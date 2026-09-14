import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types/auth.types';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const result = await authService.register(email, password, role);
  res.status(201).json({ success: true, data: result });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json({ success: true, data: result });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' }});
  const user = await authService.getMe(req.user.userId);
  res.status(200).json({ success: true, data: { user } });
};
