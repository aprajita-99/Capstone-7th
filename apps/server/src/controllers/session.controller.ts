import { Response } from 'express';
import { SessionService } from '../services/session.service';
import { AuthRequest } from '../types/auth.types';

const sessionService = new SessionService();

export const createSession = async (req: AuthRequest, res: Response) => {
  const { subject, room, durationMinutes } = req.body;
  const result = await sessionService.createSession(req.user!.userId, req.params.sectionId, subject, room, durationMinutes);
  res.status(201).json({ success: true, data: result });
};

export const startSession = async (req: AuthRequest, res: Response) => {
  const result = await sessionService.startSession(req.user!.userId, req.params.sessionId);
  res.status(200).json({ success: true, data: result });
};

export const stopSession = async (req: AuthRequest, res: Response) => {
  const result = await sessionService.stopSession(req.user!.userId, req.params.sessionId);
  res.status(200).json({ success: true, data: result });
};

export const getActiveSession = async (req: AuthRequest, res: Response) => {
  const result = await sessionService.getActiveSession(req.user!.userId, req.params.sectionId);
  res.status(200).json({ success: true, data: result });
};

export const getSectionSessions = async (req: AuthRequest, res: Response) => {
  const result = await sessionService.getSectionSessions(req.user!.userId, req.params.sectionId);
  res.status(200).json({ success: true, data: result });
};
