import { Response } from 'express';
import { StudentService } from '../services/student.service';
import { AuthRequest } from '../types/auth.types';

const studentService = new StudentService();

export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
  const result = await studentService.getMyEnrollments(req.user!.userId);
  res.status(200).json({ success: true, data: result });
};

export const acceptInvite = async (req: AuthRequest, res: Response) => {
  const result = await studentService.acceptInvite(req.user!.userId, req.params.token);
  res.status(200).json({ success: true, data: result });
};
