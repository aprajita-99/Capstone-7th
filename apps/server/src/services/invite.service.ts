import crypto from 'crypto';
import { InviteRepository } from '../repositories/invite.repository';
import { SectionService } from './section.service';
import { AppError } from '../utils/errors';

export class InviteService {
  private inviteRepo = new InviteRepository();
  private sectionService = new SectionService();

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  async createInvite(userId: string, sectionId: string, expiresInDays: number = 7) {
    // Verifies ownership implicitly
    const section = await this.sectionService.getSection(userId, sectionId);
    
    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await this.inviteRepo.create(sectionId, tokenHash, expiresAt);

    // Return the RAW token only this one time. Never logged or saved.
    return {
      inviteToken: rawToken,
      expiresAt,
      section: {
        id: section.id,
        name: section.name,
        courseCode: section.course.code,
        courseName: section.course.name
      }
    };
  }

  async validateInvite(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const invite = await this.inviteRepo.findByHash(tokenHash);

    if (!invite) throw new AppError(404, 'Invalid invitation link', 'INVALID_INVITE');
    if (invite.revokedAt) throw new AppError(400, 'This invitation has been revoked', 'REVOKED_INVITE');
    if (new Date() >= invite.expiresAt) throw new AppError(400, 'This invitation has expired', 'EXPIRED_INVITE');

    return invite;
  }

  async revoke(userId: string, inviteId: string) {
    const invite = await this.inviteRepo.findById(inviteId);
    if (!invite) throw new AppError(404, 'Invite not found', 'NOT_FOUND');
    
    // Check ownership
    await this.sectionService.getSection(userId, invite.sectionId);
    return this.inviteRepo.revoke(inviteId);
  }

  async getSectionInvites(userId: string, sectionId: string) {
    // Check ownership
    await this.sectionService.getSection(userId, sectionId);
    return this.inviteRepo.findBySection(sectionId);
  }
}
