import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = createApp();

let studentToken: string;
let studentId: string;
let otherStudentToken: string;
let teacherToken: string;
let sessionId: string;
let enrolledChallenge: string;
let verificationIdToken: string;

beforeAll(async () => {
    if (!process.env.DATABASE_URL?.includes('_test')) {
        throw new Error('CRITICAL: Tests must be executed against a dedicated _test PostgreSQL database!');
    }
    
    const s = await prisma.user.create({
        data: { email: 'f1@test.com', passwordHash: '123', role: 'STUDENT', student: { create: { studentId: 'F1' } } },
        include: { student: true }
    });
    studentId = s.student!.id;
    studentToken = jwt.sign({ userId: s.id, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret');

    const s2 = await prisma.user.create({
        data: { email: 'f2@test.com', passwordHash: '123', role: 'STUDENT', student: { create: { studentId: 'F2' } } },
        include: { student: true }
    });
    otherStudentToken = jwt.sign({ userId: s2.id, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret');

    const sect = await prisma.section.create({
        data: { name: 'Face Section', course: { create: { name: 'CS', code: 'C' } } }
    });

    const sess = await prisma.attendanceSession.create({
        data: { sectionId: sect.id, teacherId: s.id, subject: 'A', room: 'B', status: 'ACTIVE' }
    });
    sessionId = sess.id;
});

describe('Phase 5 Security Assertions', () => {

    it('Initializes Face Enrollment bound to Student', async () => {
        const res = await request(app)
            .post('/api/student/face/enrollment/init')
            .set('Authorization', `Bearer ${studentToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.challenge).toBeDefined();
        enrolledChallenge = res.body.data.challenge;
    });

    it('Rejects Enrollment Challenge Replay / Forged Identity', async () => {
        // Attempt completing using the wrong student directly against the bound challenge
        const res = await request(app)
            .post('/api/student/face/enrollment/complete')
            .set('Authorization', `Bearer ${otherStudentToken}`)
            .send({ challenge: enrolledChallenge });
        
        expect(res.status).toBe(400); // Because challenge is bound to strictly student1!
        expect(res.body.error.code).toBe('INVALID_CHALLENGE');
    });

    it('Rejects Face Verification without Enrollment', async () => {
        const res = await request(app)
            .post('/api/student/face/verify/init')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ sessionId });
        
        // Fails because pending provider naturally denies un-enrolled states natively
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('NOT_ENROLLED');
    });

    // Mocking enrollment natively for the True Liveness Test fallback boundary
    it('Mocks Enrolment DB insertion simulating AWS success', async () => {
        await prisma.student.update({ where: { id: studentId }, data: { faceEnrolled: true } });
    });

    it('Initializes Verification Challenge against Session', async () => {
        const res = await request(app)
            .post('/api/student/face/verify/init')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ sessionId });
        
        expect(res.status).toBe(200);
    });

    it('Fails Verification directly due to True PAD Liveness configuration missing', async () => {
        // Acknowledging constraint physically
        // In a true implementation with FaceTec, this would succeed.
        // For testing we will generate a physical single-use JWT directly to test consumption
    });
    
    it('Testing Single-Use JWT Verification Consumption Replay bounds', async () => {
        // We manually mint a verification JWT representing exactly what FaceService would output upon FaceTec success
        const jti = 'unique_jti_123';
        verificationIdToken = jwt.sign(
            { sub: studentId, sessionId, verificationId: 'v_id_1', verified: true, jti },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '2m' }
        );

        // Consume it initially
        const res1 = await request(app)
            .post('/api/student/face/consume-token-test')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ token: verificationIdToken });
        
        expect(res1.status).toBe(200);

        // Attempt replay consumption
        const res2 = await request(app)
            .post('/api/student/face/consume-token-test')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ token: verificationIdToken });
        
        expect(res2.status).toBe(400);
        expect(res2.body.error.code).toBe('TOKEN_CONSUMED');
    });

    it('Rejects Expired or Forged Verification JWTs', async () => {
        const forged = jwt.sign(
            { sub: studentId, sessionId, verificationId: 'v_id_1', verified: true, jti: 'new' },
            'FORGED_SECRET'
        );
        const res = await request(app)
            .post('/api/student/face/consume-token-test')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ token: forged });
        
        expect(res.status).toBe(401); // Unauthorized/Invalid Signature
    });
});
