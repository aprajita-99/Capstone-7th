import { Response } from 'express';
import { SectionService } from '../services/section.service';
import { AuthRequest } from '../types/auth.types';

const sectionService = new SectionService();

export const createSection = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const result = await sectionService.createSection(req.user!.userId, req.params.courseId, name);
  res.status(201).json({ success: true, data: result });
};

export const getSections = async (req: AuthRequest, res: Response) => {
  const result = await sectionService.getSections(req.user!.userId, req.params.courseId);
  res.status(200).json({ success: true, data: result });
};

export const getSection = async (req: AuthRequest, res: Response) => {
  const result = await sectionService.getSection(req.user!.userId, req.params.sectionId);
  res.status(200).json({ success: true, data: result });
};

export const getSectionEnrollments = async (req: AuthRequest, res: Response) => {
  const result = await sectionService.getSectionEnrollments(req.user!.userId, req.params.sectionId);
  res.status(200).json({ success: true, data: result });
};
