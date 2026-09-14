import prisma from '../lib/prisma';
import { SectionService } from './section.service';
import { AppError } from '../utils/errors';
import { AttendanceSessionStatus } from '@prisma/client';

export class SessionService {
  private sectionService = new SectionService();

  async createSession(userId: string, sectionId: string, subject: string, room: string, durationMinutes: number) {
    const section = await this.sectionService.getSection(userId, sectionId);
    
    // Concurrency boundary starts here: We simply CREATE the session.
    // We strictly DO NOT make it active yet. The actual "single active"
    // condition is enforced by the Section.activeSessionId @unique constraint on START.
    
    return prisma.attendanceSession.create({
      data: {
        sectionId,
        teacherId: userId,
        subject,
        room,
        durationMinutes,
        status: AttendanceSessionStatus.CREATED
      }
    });
  }

  async startSession(userId: string, sessionId: string) {
    // 1. Fetch Session
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { section: true }
    });

    if (!session) throw new AppError(404, 'Session not found', 'NOT_FOUND');
    if (session.teacherId !== userId) throw new AppError(403, 'Cannot modify another teacher\'s session', 'FORBIDDEN');
    
    if (session.status !== AttendanceSessionStatus.CREATED) {
      throw new AppError(400, 'Only CREATED sessions can be started', 'INVALID_STATE');
    }

    // 2. Perform Atomic Transaction verifying concurrency
    try {
      return await prisma.$transaction(async (tx: any) => {
        // Enforce the @unique constraint mapping - Section must not have an active session right now.
        const sectionCheck = await tx.section.findUnique({ where: { id: session.sectionId } });
        if (sectionCheck?.activeSessionId) {
          throw new AppError(400, 'Another session is currently active for this section', 'CONCURRENCY_ERROR');
        }

        const now = new Date();
        const expires = new Date(now.getTime() + session.durationMinutes * 60000);

        // Transition the Session
        const updatedSession = await tx.attendanceSession.update({
          where: { id: sessionId },
          data: {
            status: AttendanceSessionStatus.ACTIVE,
            startedAt: now,
            expiresAt: expires
          }
        });

        // Set the active map on the Section
        await tx.section.update({
          where: { id: session.sectionId },
          data: { activeSessionId: sessionId }
        });

        return updatedSession;
      });
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      // P2002 Unique Constraint violation on activeSessionId means a race condition happened and a concurrent req won
      if (e.code === 'P2002') {
         throw new AppError(400, 'Another session is currently active for this section', 'CONCURRENCY_ERROR');
      }
      throw e;
    }
  }

  async stopSession(userId: string, sessionId: string) {
    const session = await prisma.attendanceSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError(404, 'Session not found', 'NOT_FOUND');
    if (session.teacherId !== userId) throw new AppError(403, 'Forbidden', 'FORBIDDEN');

    if (session.status !== AttendanceSessionStatus.ACTIVE) {
      throw new AppError(400, 'Only ACTIVE sessions can be stopped', 'INVALID_STATE');
    }

    return prisma.$transaction(async (tx: any) => {
      const updatedSession = await tx.attendanceSession.update({
        where: { id: sessionId },
        data: {
          status: AttendanceSessionStatus.STOPPED,
          endedAt: new Date()
        }
      });

      // Clear the active session lock logically allowing future ones
      await tx.section.update({
        where: { id: session.sectionId },
        data: { activeSessionId: null }
      });

      return updatedSession;
    });
  }

  async getActiveSession(userId: string, sectionId: string) {
    // Validates Ownership
    await this.sectionService.getSection(userId, sectionId);

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { activeSession: true }
    });

    if (!section || !section.activeSessionId || !section.activeSession) return null;

    const activeSession = section.activeSession;

    // Execute Expire Verify: Transition to EXPIRED gracefully if we crossed the threshold
    if (activeSession.expiresAt && activeSession.expiresAt <= new Date()) {
       // It expired logically!
       await prisma.$transaction([
         prisma.attendanceSession.update({
           where: { id: activeSession.id },
           data: { status: AttendanceSessionStatus.EXPIRED, endedAt: activeSession.expiresAt }
         }),
         prisma.section.update({
           where: { id: sectionId },
           data: { activeSessionId: null }
         })
       ]);
       return null;
    }

    return activeSession;
  }

  async getSectionSessions(userId: string, sectionId: string) {
    await this.sectionService.getSection(userId, sectionId);
    return prisma.attendanceSession.findMany({
      where: { sectionId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
