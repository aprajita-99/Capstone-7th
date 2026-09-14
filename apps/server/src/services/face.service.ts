import prisma from '../lib/prisma';
import { AppError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PendingProvider } from './providers/PendingProvider';

export class FaceService {
  private provider = new PendingProvider();

  async getStatus(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new AppError(404, 'Student not found', 'NOT_FOUND');
    return { faceEnrolled: student.faceEnrolled, faceEnrolledAt: student.faceEnrolledAt };
  }

  async initEnrollment(studentId: string) {
    const { challenge, expiresAt, contextId } = await this.provider.initializeEnrollment(studentId);
    
    // Store securely bounded to this student (Any previous unconsumed challenge is overwritten/ignored)
    await prisma.verificationChallenge.create({
      data: {
        studentId,
        type: 'ENROLL',
        challenge,
        expiresAt,
        sessionId: contextId // We use sessionId space for contextual binding loosely here mapping Provider needs
      }
    });

    return { challenge, expiresAt };
  }

  async completeEnrollment(studentId: string, challengeInput: string, facePayload: any) {
    // 1. Verify Challenge Ownership and state
    const activeChallenge = await prisma.verificationChallenge.findUnique({
      where: { challenge: challengeInput }
    });

    if (!activeChallenge || activeChallenge.studentId !== studentId || activeChallenge.type !== 'ENROLL') {
      throw new AppError(400, 'Invalid or consumed challenge', 'INVALID_CHALLENGE');
    }

    if (activeChallenge.expiresAt < new Date()) {
       await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });
       throw new AppError(400, 'Challenge expired', 'EXPIRED_CHALLENGE');
    }

    // 2. Consume Challenge Single-Use Immediately
    await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });

    // 3. Delegate to Provider
    const result = await this.provider.completeEnrollment(studentId, activeChallenge.sessionId || 'N/A', facePayload);

    if (!result.success) {
       // Provider logic boundary bounds (e.g. true liveness missing)
       throw new AppError(400, result.error || 'Enrollment failed', 'PROVIDER_REJECTED');
    }

    // 4. Update Schema
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { faceEnrolled: true, faceEnrolledAt: new Date() }
    });

    return { faceEnrolled: updated.faceEnrolled, faceEnrolledAt: updated.faceEnrolledAt };
  }

  async deleteEnrollment(studentId: string) {
    await prisma.student.update({
      where: { id: studentId },
      data: { faceEnrolled: false, faceEnrolledAt: null }
    });
    return { success: true };
  }

  async initVerification(studentId: string, sessionId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student?.faceEnrolled) {
      throw new AppError(400, 'Student has not enrolled a face', 'NOT_ENROLLED');
    }

    // Verify Session is real
    const session = await prisma.attendanceSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'ACTIVE') {
      throw new AppError(400, 'Invalid or inactive session', 'INVALID_SESSION');
    }

    const { challenge, expiresAt, contextId } = await this.provider.initializeVerification(studentId, sessionId);

    await prisma.verificationChallenge.create({
      data: {
        studentId,
        type: 'VERIFY',
        challenge,
        expiresAt,
        sessionId
      }
    });

    return { challenge, expiresAt };
  }

  async verify(studentId: string, sessionId: string, challengeInput: string, facePayload: any) {
    const activeChallenge = await prisma.verificationChallenge.findUnique({
      where: { challenge: challengeInput }
    });

    if (!activeChallenge || activeChallenge.studentId !== studentId || activeChallenge.sessionId !== sessionId || activeChallenge.type !== 'VERIFY') {
      throw new AppError(400, 'Invalid or bound challenge', 'INVALID_CHALLENGE');
    }

    if (activeChallenge.expiresAt < new Date()) {
       await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });
       throw new AppError(400, 'Challenge expired', 'EXPIRED_CHALLENGE');
    }

    await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });

    const result = await this.provider.verify(studentId, sessionId, 'N/A', facePayload);

    if (!result.verified || !result.livenessPassed) {
       throw new AppError(400, result.failureReason || 'Verification failed', 'VERIFICATION_FAILED');
    }

    // Issue Cryptographically Signed Single-Use Token
    const jti = crypto.randomUUID();
    const verificationToken = jwt.sign(
      { sub: studentId, sessionId, verificationId: crypto.randomUUID(), verified: true, jti },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '2m' }
    );

    return { verificationToken };
  }

  // Phase 5 Test Helper function asserting Single Use Consumption logic
  async consumeVerificationTokenTest(token: string) {
     try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        if (!decoded.jti || !decoded.verified) throw new Error('Invalid token schema');
        
        // Transactionally ensure single-use mapping
        await prisma.consumedToken.create({
          data: { jti: decoded.jti }
        });

        return { success: true, payload: decoded };
     } catch (e: any) {
        if (e.code === 'P2002') throw new AppError(400, 'Token already consumed', 'TOKEN_CONSUMED');
        throw new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED');
     }
  }
}
