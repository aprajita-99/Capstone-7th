import { Response } from 'express';
import { DeviceService } from '../services/device.service';
import { AuthRequest } from '../types/auth.types';

const deviceService = new DeviceService();

export const registerDevice = async (req: AuthRequest, res: Response) => {
  const { publicKey, algorithm, platform } = req.body;
  const result = await deviceService.registerDevice(req.user!.userId, publicKey, algorithm, platform);
  res.status(201).json({ success: true, data: result });
};

export const revokeDevice = async (req: AuthRequest, res: Response) => {
  const result = await deviceService.revokeDevice(req.user!.userId, req.params.deviceId);
  res.status(200).json({ success: true, data: result });
};
