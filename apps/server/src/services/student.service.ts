import { StudentRepository } from '../repositories/student.repository';
import { InviteService } from './invite.service';
import { AppError } from '../utils/errors';

export class StudentService {
  private studentRepo = new StudentRepository();
  private inviteService = new InviteService();

  async getStudent(userId: string) {
    const student = await this.studentRepo.getStudentByUserId(userId);
    if (!student) throw new AppError(403, 'User is not a student', 'FORBIDDEN');
    return student;
  }

  async getMyEnrollments(userId: string) {
    const student = await this.getStudent(userId);
    const enrollments = await this.studentRepo.getEnrollments(student.id);
    
    return enrollments.map((e: any) => ({
      id: e.id,
      joinedAt: e.joinedAt,
      section: {
        id: e.section.id,
        name: e.section.name,
      },
      course: {
        id: e.section.course.id,
        name: e.section.course.name,
        code: e.section.course.code
      }
    }));
  }

  async acceptInvite(userId: string, rawToken: string) {
    const student = await this.getStudent(userId);
    
    // Validation verifies expiration and revocation
    const invite = await this.inviteService.validateInvite(rawToken);

    // Prevent deduplication concurrently safely using a read-check followed by DB constraints
    const existing = await this.studentRepo.findEnrollment(student.id, invite.sectionId);
    if (existing) {
      // Idempotent rejection
      throw new AppError(400, 'You are already enrolled in this section', 'ALREADY_ENROLLED');
    }

    try {
      await this.studentRepo.createEnrollmentTransaction(student.id, invite.sectionId);
      return { success: true, sectionId: invite.sectionId };
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new AppError(400, 'You are already enrolled', 'ALREADY_ENROLLED');
      }
      throw e;
    }
  }
}
