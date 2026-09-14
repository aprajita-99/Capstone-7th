import { Response } from 'express';
import { CourseService } from '../services/course.service';
import { AuthRequest } from '../types/auth.types';

const courseService = new CourseService();

export const createCourse = async (req: AuthRequest, res: Response) => {
  const { name, code } = req.body;
  const result = await courseService.createCourse(req.user!.userId, name, code);
  res.status(201).json({ success: true, data: result });
};

export const getMyCourses = async (req: AuthRequest, res: Response) => {
  const result = await courseService.getMyCourses(req.user!.userId);
  res.status(200).json({ success: true, data: result });
};

export const getMyCourse = async (req: AuthRequest, res: Response) => {
  const result = await courseService.getMyCourse(req.user!.userId, req.params.courseId);
  res.status(200).json({ success: true, data: result });
};
