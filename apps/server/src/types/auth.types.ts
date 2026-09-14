export interface AuthRequest extends import('express').Request {
  user?: import('../utils/jwt').TokenPayload;
}
