import { SessionRepository } from '../repositories/session.repository';
import { SectionService } from './section.service';
import { CourseService } from './course.service';
import { AppError } from '../utils/errors';
import { AttendanceSessionStatus } from '@prisma/client';

export class SessionService {
  private sessionRepo = new SessionRepository();
  private sectionService = new SectionService();
  private courseService = new CourseService();

  private isExpired(expiresAt: Date): boolean {
    return new Date() >= expiresAt;
  }

  async createSession(userId: string, sectionId: string, subject: string, room: string, durationMinutes: number) {
    await this.sectionService.getSection(userId, sectionId);
    const teacher = await this.courseService.getTeacherFromUser(userId);

    const existingActive = await this.sessionRepo.findActiveBySection(sectionId);
    if (existingActive) {
      if (this.isExpired(existingActive.expiresAt)) {
        await this.sessionRepo.updateStatus(existingActive.id, AttendanceSessionStatus.EXPIRED);
      } else {
        throw new AppError(400, 'Section already has an active attendance session', 'ACTIVE_SESSION_EXISTS');
      }
    }

    // Authoritative Server Time
    const expiresAt = new Date(Date.now() + durationMinutes * 60000);
    return this.sessionRepo.create(sectionId, teacher.id, subject, room, expiresAt);
  }

  async startSession(userId: string, sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new AppError(404, 'Session not found', 'SESSION_NOT_FOUND');
    
    await this.sectionService.getSection(userId, session.sectionId);

    if (session.status !== AttendanceSessionStatus.CREATED) {
      throw new AppError(400, `Cannot start session from status: ${session.status}`, 'INVALID_STATE_TRANSITION');
    }

    return this.sessionRepo.updateStatus(sessionId, AttendanceSessionStatus.ACTIVE);
  }

  async stopSession(userId: string, sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new AppError(404, 'Session not found', 'SESSION_NOT_FOUND');
    
    await this.sectionService.getSection(userId, session.sectionId);

    if (session.status !== AttendanceSessionStatus.ACTIVE) {
      throw new AppError(400, 'Only ACTIVE sessions can be stopped', 'INVALID_STATE_TRANSITION');
    }

    return this.sessionRepo.updateStatus(sessionId, AttendanceSessionStatus.STOPPED);
  }

  async getActiveSession(userId: string, sectionId: string) {
    await this.sectionService.getSection(userId, sectionId);
    
    const session = await this.sessionRepo.findActiveBySection(sectionId);
    if (!session) {
      throw new AppError(404, 'No active session found for this section', 'NO_ACTIVE_SESSION');
    }

    if (this.isExpired(session.expiresAt)) {
      await this.sessionRepo.updateStatus(session.id, AttendanceSessionStatus.EXPIRED);
      throw new AppError(404, 'Active session expired', 'NO_ACTIVE_SESSION');
    }

    return session;
  }

  async getSectionSessions(userId: string, sectionId: string) {
    await this.sectionService.getSection(userId, sectionId);
    return this.sessionRepo.findBySection(sectionId);
  }
}
