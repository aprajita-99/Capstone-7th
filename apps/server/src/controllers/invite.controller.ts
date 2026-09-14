import { Response } from 'express';
import { InviteService } from '../services/invite.service';
import { AuthRequest } from '../types/auth.types';

const inviteService = new InviteService();

export const createInvite = async (req: AuthRequest, res: Response) => {
  const { expiresInDays } = req.body;
  const result = await inviteService.createInvite(req.user!.userId, req.params.sectionId, expiresInDays);
  res.status(201).json({ success: true, data: result });
};

export const getSectionInvites = async (req: AuthRequest, res: Response) => {
  const result = await inviteService.getSectionInvites(req.user!.userId, req.params.sectionId);
  res.status(200).json({ success: true, data: result });
};

export const revokeInvite = async (req: AuthRequest, res: Response) => {
  const result = await inviteService.revoke(req.user!.userId, req.params.inviteId);
  res.status(200).json({ success: true, data: result });
};

export const validateInvite = async (req: AuthRequest, res: Response) => {
  const result = await inviteService.validateInvite(req.params.token);
  // Sanitize before returning to student
  res.status(200).json({ 
    success: true, 
    data: {
      courseName: result.section.course.name,
      courseCode: result.section.course.code,
      sectionName: result.section.name,
      expiresAt: result.expiresAt
    } 
  });
};
