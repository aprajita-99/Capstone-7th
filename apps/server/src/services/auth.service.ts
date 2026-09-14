import { UserRepository } from '../repositories/user.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { Role } from '@prisma/client';

export class AuthService {
  private userRepository = new UserRepository();

  async register(email: string, passwordPlain: string, role: Role) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(400, 'Email is already correctly registered or in use', 'EMAIL_IN_USE');
    }

    const passwordHash = await hashPassword(passwordPlain);
    const user = await this.userRepository.createUserTransaction(email, passwordHash, role);

    const token = generateToken({ userId: user.id, role: user.role });
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValid = await verifyPassword(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = generateToken({ userId: user.id, role: user.role });
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  async getMe(userId: string) {
      const user = await this.userRepository.findById(userId);
      if(!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
      return user;
  }
}
