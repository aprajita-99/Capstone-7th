# Student Enrollment Architecture

## Idempotency Principles
The Enrollment repository actively relies heavily upon the underlying Postgres constraints defining `@@unique([studentId, sectionId])`.
By coupling business logic reads via `findEnrollment` followed by catching potential race-condition Prisma mapping exceptions gracefully, we guarantee extreme concurrency handling bounds protecting against brute-forced multi-click acceptance vectors on slow mobile clients.

## Endpoints
- `POST /api/invites/:token/accept` -> Safely injects the student into the class roster without relying on frontend logic to send the correct internal IDs.
- `GET /api/student/enrollments` -> Strips out any internal structures serving only normalized views of the classes a Student joined safely.

## Next Phase Pre-requiste Connections
These core schemas perfectly pave the structure required where `Device` arrays directly integrate against the verified `Student` map, enforcing absolute identity scopes against later physical BLE boundaries.
