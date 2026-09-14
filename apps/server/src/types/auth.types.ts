import { Request } from 'express';
import { TokenPayload } from '../utils/jwt';

export type AuthRequest = Request & {
  user?: TokenPayload;
};
