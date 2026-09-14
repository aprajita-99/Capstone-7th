import prisma from '../lib/prisma';

export class CourseRepository {
  async getTeacherByUserId(userId: string) {
    return prisma.teacher.findUnique({ where: { userId } });
  }

  async create(teacherId: string, name: string, code: string) {
    return prisma.course.create({
      data: { name, code, teacherId },
    });
  }

  async findByCode(code: string) {
    return prisma.course.findUnique({ where: { code } });
  }

  async findByTeacher(teacherId: string) {
    return prisma.course.findMany({ where: { teacherId } });
  }

  async findByIdAndTeacher(id: string, teacherId: string) {
    return prisma.course.findFirst({ where: { id, teacherId } });
  }
}
