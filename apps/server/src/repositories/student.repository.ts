import prisma from '../lib/prisma';

export class StudentRepository {
  async getStudentByUserId(userId: string) {
    return prisma.student.findUnique({ where: { userId } });
  }

  async getEnrollments(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        section: {
          include: { course: true }
        }
      }
    });
  }

  async createEnrollmentTransaction(studentId: string, sectionId: string) {
    // Upsert or safe create considering unique bounds
    return prisma.enrollment.create({
      data: {
        studentId,
        sectionId
      }
    });
  }

  async findEnrollment(studentId: string, sectionId: string) {
    return prisma.enrollment.findUnique({
      where: {
        studentId_sectionId: { studentId, sectionId }
      }
    });
  }
}
