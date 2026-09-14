import { DeviceRepository } from '../repositories/device.repository';
import { StudentService } from './student.service';
import { AppError } from '../utils/errors';
import { DeviceStatus } from '@prisma/client';

export class DeviceService {
  private deviceRepo = new DeviceRepository();
  private studentService = new StudentService();

  async registerDevice(userId: string, publicKey: string, algorithm?: string, platform?: string) {
    const student = await this.studentService.getStudent(userId);
    return this.deviceRepo.register(student.id, publicKey, algorithm, platform);
  }

  async revokeDevice(userId: string, deviceId: string) {
    const student = await this.studentService.getStudent(userId);
    const device = await this.deviceRepo.findById(deviceId);
    
    if (!device) throw new AppError(404, 'Device not found', 'NOT_FOUND');
    if (device.studentId !== student.id) throw new AppError(403, 'Cannot modify a device you do not own', 'FORBIDDEN');
    if (device.status === DeviceStatus.REVOKED) throw new AppError(400, 'Device already revoked', 'ALREADY_REVOKED');
    
    return this.deviceRepo.revoke(deviceId);
  }
}
