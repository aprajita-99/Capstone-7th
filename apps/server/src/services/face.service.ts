import prisma from '../lib/prisma';
import { AppError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PendingProvider } from './providers/PendingProvider';
import { env } from '../config/env';

export class FaceService {
  private provider = new PendingProvider();

  async getStatus(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new AppError(404, 'Student not found', 'NOT_FOUND');
    return { faceEnrolled: student.faceEnrolled, faceEnrolledAt: student.faceEnrolledAt };
  }

  async initEnrollment(studentId: string) {
    const { challenge, expiresAt, contextId } = await this.provider.initializeEnrollment(studentId);
    
    await prisma.verificationChallenge.create({
      data: {
        studentId,
        type: 'ENROLL',
        challenge,
        expiresAt,
        sessionId: contextId
      }
    });

    await prisma.auditEvent.create({
      data: {
        type: 'FACE_ENROLLMENT_STARTED',
        details: { studentId }
      }
    });

    return { challenge, expiresAt };
  }

  async completeEnrollment(studentId: string, challengeInput: string, facePayload: any) {
    const activeChallenge = await prisma.verificationChallenge.findUnique({
      where: { challenge: challengeInput }
    });

    if (!activeChallenge || activeChallenge.studentId !== studentId || activeChallenge.type !== 'ENROLL') {
      await prisma.auditEvent.create({
        data: { type: 'FACE_ENROLLMENT_FAILED', details: { studentId, reason: 'Invalid or bound challenge' } }
      });
      throw new AppError(400, 'Invalid or consumed challenge', 'INVALID_CHALLENGE');
    }

    if (activeChallenge.expiresAt < new Date()) {
       await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });
       await prisma.auditEvent.create({
         data: { type: 'FACE_ENROLLMENT_FAILED', details: { studentId, reason: 'Challenge expired' } }
       });
       throw new AppError(400, 'Challenge expired', 'EXPIRED_CHALLENGE');
    }

    await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });

    const result = await this.provider.completeEnrollment(studentId, activeChallenge.sessionId || 'N/A', facePayload);

    if (!result.success) {
       await prisma.auditEvent.create({
         data: { type: 'FACE_ENROLLMENT_FAILED', details: { studentId, reason: result.error || 'Provider rejected enrollment' } }
       });
       throw new AppError(400, result.error || 'Enrollment failed', 'PROVIDER_REJECTED');
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { faceEnrolled: true, faceEnrolledAt: new Date() }
    });

    await prisma.auditEvent.create({
      data: { type: 'FACE_ENROLLMENT_COMPLETED', details: { studentId } }
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

    const session = await prisma.attendanceSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'ACTIVE') {
      throw new AppError(400, 'Invalid or inactive session', 'INVALID_SESSION');
    }

    const { challenge, expiresAt } = await this.provider.initializeVerification(studentId, sessionId);

    await prisma.verificationChallenge.create({
      data: {
        studentId,
        type: 'VERIFY',
        challenge,
        expiresAt,
        sessionId
      }
    });

    await prisma.auditEvent.create({
      data: { type: 'FACE_VERIFICATION_STARTED', details: { studentId, sessionId } }
    });

    return { challenge, expiresAt };
  }

  async verify(studentId: string, sessionId: string, challengeInput: string, facePayload: any) {
    const activeChallenge = await prisma.verificationChallenge.findUnique({
      where: { challenge: challengeInput }
    });

    if (!activeChallenge || activeChallenge.studentId !== studentId || activeChallenge.sessionId !== sessionId || activeChallenge.type !== 'VERIFY') {
      await prisma.auditEvent.create({
        data: { type: 'FACE_VERIFICATION_FAILED', details: { studentId, sessionId, reason: 'Invalid challenge' } }
      });
      throw new AppError(400, 'Invalid or bound challenge', 'INVALID_CHALLENGE');
    }

    if (activeChallenge.expiresAt < new Date()) {
       await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });
       await prisma.auditEvent.create({
         data: { type: 'FACE_VERIFICATION_FAILED', details: { studentId, sessionId, reason: 'Challenge expired' } }
       });
       throw new AppError(400, 'Challenge expired', 'EXPIRED_CHALLENGE');
    }

    await prisma.verificationChallenge.delete({ where: { id: activeChallenge.id } });

    const result = await this.provider.verify(studentId, sessionId, 'N/A', facePayload);

    if (!result.verified || !result.livenessPassed) {
       await prisma.auditEvent.create({
         data: { type: 'FACE_VERIFICATION_FAILED', details: { studentId, sessionId, reason: result.failureReason || 'Liveness or match failed' } }
       });
       throw new AppError(400, result.failureReason || 'Verification failed', 'VERIFICATION_FAILED');
    }

    const jti = crypto.randomUUID();
    const verificationToken = jwt.sign(
      { sub: studentId, sessionId, verificationId: crypto.randomUUID(), verified: true, jti },
      env.JWT_SECRET,
      { expiresIn: '2m' }
    );

    await prisma.auditEvent.create({
      data: { type: 'FACE_VERIFICATION_SUCCESS', details: { studentId, sessionId } }
    });

    return { verificationToken };
  }

  // Phase 5 Test Helper function asserting Single Use Consumption logic
  async consumeVerificationTokenTest(token: string) {
     try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        if (!decoded.jti || !decoded.verified) throw new Error('Invalid token schema');
        
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
