import { Request, Response } from 'express';
import { FaceService } from '../services/face.service';

const faceService = new FaceService();

export const getFaceStatus = async (req: Request, res: Response) => {
    // Identity purely bounded directly by JWT
    const result = await faceService.getStatus(req.user!.userId);
    res.json({ success: true, data: result });
};

export const initEnrollment = async (req: Request, res: Response) => {
    const result = await faceService.initEnrollment(req.user!.userId);
    res.json({ success: true, data: result });
};

export const completeEnrollment = async (req: Request, res: Response) => {
    const { challenge, facePayload } = req.body;
    const result = await faceService.completeEnrollment(req.user!.userId, challenge, facePayload);
    res.json({ success: true, data: result });
};

export const deleteEnrollment = async (req: Request, res: Response) => {
    const result = await faceService.deleteEnrollment(req.user!.userId);
    res.json({ success: true, data: result });
};

export const initVerification = async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    const result = await faceService.initVerification(req.user!.userId, sessionId);
    res.json({ success: true, data: result });
};

export const verifyFace = async (req: Request, res: Response) => {
    const { sessionId, challenge, facePayload } = req.body;
    const result = await faceService.verify(req.user!.userId, sessionId, challenge, facePayload);
    res.json({ success: true, data: result });
};

// Only for verifying logic boundaries during Phase 5 testing mappings
export const consumeTokenTest = async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await faceService.consumeVerificationTokenTest(token);
    res.json({ success: true, data: result });
};
