import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ 
        where: { id },
        select: { id: true, email: true, role: true, createdAt: true, updatedAt: true }
    });
  }

  async createUserTransaction(email: string, passwordHash: string, role: Role) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
        },
      });

      if (role === 'STUDENT') {
        await tx.student.create({ data: { userId: user.id } });
      } else if (role === 'TEACHER') {
        await tx.teacher.create({ data: { userId: user.id } });
      }

      return user;
    });
  }
}
