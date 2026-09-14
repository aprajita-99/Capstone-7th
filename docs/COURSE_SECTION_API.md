# Course & Section API Contract

## Core Philosophy
Every endpoint operates under `requireAuth` + `requireRole('TEACHER')`.
Targeting another teacher's resources will invariably yield a `404` or `403` because standard lookups append `where: { teacherId: user.teacherId }` atomically.

## Courses
### POST `/api/courses`
Creates a course bound to the requester's `Teacher` record.
**Body**:
```json
{
  "name": "Data Structures",
  "code": "CS201"
}
```

### GET `/api/courses`
Returns all courses owned by the authenticated Teacher. No params required.

## Sections
### POST `/api/courses/:courseId/sections`
Creates a section (or class period structure) under the specific course.
**Body**:
```json
{
  "name": "Sec A"
}
```

### GET `/api/courses/:courseId/sections`
Returns all sections derived from the teacher-owned course.

### GET `/api/sections/:sectionId/enrollments`
Inspect enrollments mapped via Invite Links (Implementation handled in next phase). Securely exposes the `Student` mapping devoid of biometric data.
