import prisma from '../lib/prisma';
import { AttendanceSessionStatus } from '@prisma/client';

export class SessionRepository {
  async create(sectionId: string, teacherId: string, subject: string, room: string, expiresAt: Date) {
    return prisma.attendanceSession.create({
      data: {
        sectionId,
        teacherId,
        subject,
        room,
        expiresAt,
        status: AttendanceSessionStatus.CREATED
      }
    });
  }

  async findActiveBySection(sectionId: string) {
    return prisma.attendanceSession.findFirst({
      where: { 
        sectionId, 
        status: AttendanceSessionStatus.ACTIVE 
      }
    });
  }

  async findById(sessionId: string) {
    return prisma.attendanceSession.findUnique({ where: { id: sessionId }});
  }
  
  async updateStatus(sessionId: string, status: AttendanceSessionStatus) {
      return prisma.attendanceSession.update({
          where: { id: sessionId },
          data: { 
              status, 
              endedAt: status === AttendanceSessionStatus.STOPPED ? new Date() : undefined 
          }
      });
  }

  async findBySection(sectionId: string) {
    return prisma.attendanceSession.findMany({
      where: { sectionId },
      orderBy: { startedAt: 'desc' }
    });
  }
}
