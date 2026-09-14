import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

const app = createApp();

let teacherToken: string;
let studentToken: string;
let teacherId: string;
let studentId: string;
let courseId: string;
let sectionId: string;
let inviteToken: string;
let sessionId: string;

beforeAll(async () => {
    if (!process.env.DATABASE_URL?.includes('_test')) {
        throw new Error('CRITICAL: Tests must be executed against a dedicated _test PostgreSQL database!');
    }
    // Clear tests globally
    await prisma.invite.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.attendanceSession.deleteMany();
    await prisma.section.deleteMany();
    await prisma.course.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.device.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.user.deleteMany();

    // 1. Setup Auth
    const teacherUser = await prisma.user.create({
        data: {
            email: 'teacher@test.com',
            passwordHash: await bcrypt.hash('password123', 10),
            role: 'TEACHER',
            teacher: { create: { department: 'CS' } }
        },
        include: { teacher: true }
    });
    teacherId = teacherUser.teacher!.id;
    teacherToken = jwt.sign({ userId: teacherUser.id, role: 'TEACHER' }, env.JWT_SECRET);

    const studentUser = await prisma.user.create({
        data: {
            email: 'student@test.com',
            passwordHash: await bcrypt.hash('password123', 10),
            role: 'STUDENT',
            student: { create: { studentId: 'STU123' } }
        },
        include: { student: true }
    });
    studentId = studentUser.student!.id;
    studentToken = jwt.sign({ userId: studentUser.id, role: 'STUDENT' }, env.JWT_SECRET);
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('E2E Lifecycle and Concurrency API Audit', () => {

    it('GET /health - Smoke test properly mapping DB status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.db).toBe('connected');
    });

    describe('Courses & Sections', () => {
        it('Teacher creates a course', async () => {
            const res = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ name: 'Integration Course', code: 'INT101' });
            
            expect(res.status).toBe(201);
            courseId = res.body.data.id;
        });

        it('Teacher creates a section', async () => {
            const res = await request(app)
                .post(`/api/courses/${courseId}/sections`)
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ name: 'Section A' });
            
            expect(res.status).toBe(201);
            sectionId = res.body.data.id;
        });
    });

    describe('Invitations & Enrolments', () => {
        it('Teacher creates an invite', async () => {
             const res = await request(app)
                .post(`/api/sections/${sectionId}/invites`)
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ expiresInDays: 7 });
            
            expect(res.status).toBe(201);
            expect(res.body.data.inviteToken).toBeDefined();
            inviteToken = res.body.data.inviteToken;
        });

        it('Student handles valid enrolments', async () => {
             const res = await request(app)
                .post(`/api/invites/${inviteToken}/accept`)
                .set('Authorization', `Bearer ${studentToken}`);
            
            expect(res.status).toBe(200);
            
            // Double enrolment testing idempotency bounce (Should map P2002 via StudentService safely returning 400 ALREADY_ENROLLED)
            const doubleRes = await request(app)
                .post(`/api/invites/${inviteToken}/accept`)
                .set('Authorization', `Bearer ${studentToken}`);
                
            expect(doubleRes.status).toBe(400);
            expect(doubleRes.body.error.code).toBe('ALREADY_ENROLLED');
        });
    });

    describe('Session State Machine and Concurrency Boundaries', () => {
        it('Creates a session in CREATED state', async () => {
             const res = await request(app)
                .post(`/api/sections/${sectionId}/attendance-sessions`)
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ subject: 'Test Sub', room: 'Test Room', durationMinutes: 60 });
            
            expect(res.status).toBe(201);
            expect(res.body.data.status).toBe('CREATED');
            expect(res.body.data.startedAt).toBeNull();
            sessionId = res.body.data.id;
        });

        it('Rejects STARTING active sessions concurrently', async () => {
            // First one transitions successfully
            const res1 = await request(app)
                .post(`/api/attendance-sessions/${sessionId}/start`)
                .set('Authorization', `Bearer ${teacherToken}`);
            
            expect(res1.status).toBe(200);
            expect(res1.body.data.status).toBe('ACTIVE');
            expect(res1.body.data.startedAt).not.toBeNull();

            // Setup a fake secondary session in CREATED to race
            const fakeSess = await prisma.attendanceSession.create({
                data: { sectionId, teacherId, subject: 'F', room: 'F', status: 'CREATED' }
            });

            // Second one bounds against the @unique Section.activeSessionId invariant rejecting cleanly
            const res2 = await request(app)
                .post(`/api/attendance-sessions/${fakeSess.id}/start`)
                .set('Authorization', `Bearer ${teacherToken}`);
            
            expect(res2.status).toBe(400);
            expect(res2.body.error.code).toBe('CONCURRENCY_ERROR');
        });
        
        it('Gracefully stops active session clearing locks', async () => {
            const res = await request(app)
                .post(`/api/attendance-sessions/${sessionId}/stop`)
                .set('Authorization', `Bearer ${teacherToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('STOPPED');
            
            const unboundSection = await prisma.section.findUnique({ where: { id: sectionId } });
            expect(unboundSection?.activeSessionId).toBeNull();
        });
    });
});
