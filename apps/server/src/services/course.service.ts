import { CourseRepository } from '../repositories/course.repository';
import { AppError } from '../utils/errors';

export class CourseService {
  private courseRepo = new CourseRepository();

  public async getTeacherFromUser(userId: string) {
    const teacher = await this.courseRepo.getTeacherByUserId(userId);
    if (!teacher) throw new AppError(403, 'User is not a teacher', 'FORBIDDEN');
    return teacher;
  }

  async createCourse(userId: string, name: string, code: string) {
    const teacher = await this.getTeacherFromUser(userId);
    
    // Check if course code is unique
    const existing = await this.courseRepo.findByCode(code);
    if (existing) {
      throw new AppError(400, 'Course code is already in use', 'DUPLICATE_CODE');
    }

    return this.courseRepo.create(teacher.id, name, code);
  }

  async getMyCourses(userId: string) {
    const teacher = await this.getTeacherFromUser(userId);
    return this.courseRepo.findByTeacher(teacher.id);
  }

  async getMyCourse(userId: string, courseId: string) {
    const teacher = await this.getTeacherFromUser(userId);
    const course = await this.courseRepo.findByIdAndTeacher(courseId, teacher.id);
    if (!course) {
      throw new AppError(404, 'Course not found or unauthorized', 'COURSE_NOT_FOUND');
    }
    return course;
  }
}
