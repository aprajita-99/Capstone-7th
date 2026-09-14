import prisma from '../lib/prisma';
import { DeviceStatus } from '@prisma/client';

export class DeviceRepository {
  async register(studentId: string, publicKey: string, algorithm?: string, platform?: string) {
    return prisma.device.create({
      data: {
        studentId,
        publicKey,
        algorithm,
        platform
      }
    });
  }

  async revoke(deviceId: string) {
    return prisma.device.update({
      where: { id: deviceId },
      data: { status: DeviceStatus.REVOKED }
    });
  }

  async findById(deviceId: string) {
    return prisma.device.findUnique({ where: { id: deviceId } });
  }
}
