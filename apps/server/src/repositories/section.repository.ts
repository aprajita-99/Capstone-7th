import prisma from '../lib/prisma';

export class SectionRepository {
  async create(courseId: string, name: string) {
    return prisma.section.create({
      data: { courseId, name }
    });
  }

  async findByCourseId(courseId: string) {
    return prisma.section.findMany({ where: { courseId } });
  }

  async findById(sectionId: string) {
    return prisma.section.findUnique({ 
        where: { id: sectionId },
        include: { course: true } // Need this to check teacher ownership
    });
  }

  async getEnrollments(sectionId: string) {
    return prisma.enrollment.findMany({
      where: { sectionId },
      include: {
        student: {
          include: { user: { select: { id: true, email: true } } }
        }
      }
    });
  }
}
