import { SectionRepository } from '../repositories/section.repository';
import { CourseService } from './course.service';
import { AppError } from '../utils/errors';

export class SectionService {
  private sectionRepo = new SectionRepository();
  private courseService = new CourseService();

  async createSection(userId: string, courseId: string, name: string) {
    // Implicitly authenticates teacher ownership of course
    await this.courseService.getMyCourse(userId, courseId);
    return this.sectionRepo.create(courseId, name);
  }

  async getSections(userId: string, courseId: string) {
    await this.courseService.getMyCourse(userId, courseId);
    return this.sectionRepo.findByCourseId(courseId);
  }

  async getSection(userId: string, sectionId: string) {
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) throw new AppError(404, 'Section not found', 'SECTION_NOT_FOUND');
    
    // Validate ownership via parent course
    await this.courseService.getMyCourse(userId, section.courseId);
    return section;
  }

  async getSectionEnrollments(userId: string, sectionId: string) {
    await this.getSection(userId, sectionId);
    const enrollments = await this.sectionRepo.getEnrollments(sectionId);
    
    // Map output to hide sensitive internal nested user fields
    return enrollments.map((e: any) => ({
      id: e.id,
      studentId: e.studentId,
      joinedAt: e.joinedAt,
      studentData: {
        id: e.student?.user?.id,
        email: e.student?.user?.email
      }
    }));
  }
}
