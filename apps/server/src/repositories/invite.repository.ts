import prisma from '../lib/prisma';

export class InviteRepository {
  async create(sectionId: string, tokenHash: string, expiresAt: Date) {
    return prisma.invite.create({
      data: {
        sectionId,
        tokenHash,
        expiresAt
      }
    });
  }

  async findByHash(tokenHash: string) {
    return prisma.invite.findUnique({
      where: { tokenHash },
      include: {
        section: {
          include: { course: true }
        }
      }
    });
  }

  async revoke(inviteId: string) {
    return prisma.invite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date() }
    });
  }

  async findBySection(sectionId: string) {
    return prisma.invite.findMany({
      where: { sectionId },
      orderBy: { createdAt: 'desc' },
      select: {
          id: true,
          sectionId: true,
          expiresAt: true,
          revokedAt: true,
          createdAt: true
      }
    });
  }

  async findById(inviteId: string) {
    return prisma.invite.findUnique({ where: { id: inviteId } });
  }
}
