import { FaceVerificationProvider } from './FaceVerificationProvider';
import crypto from 'crypto';

/**
 * A fallback mock provider structurally asserting that True Liveness does NOT exist yet,
 * cleanly mapping failures to explicit configuration limits instead of faking secure boundaries.
 */
export class PendingProvider implements FaceVerificationProvider {
  providerName = 'Pending_AwaitingCloudIntegration';
  isPadRealLiveness = false; // Deliberately asserting open-source lacks true PAD

  async initializeEnrollment(studentId: string) {
    const rawChallenge = crypto.randomBytes(32).toString('hex');
    const challenge = crypto.createHash('sha256').update(rawChallenge).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes
    
    return { challenge, expiresAt, contextId: `enroll_${studentId}` };
  }

  async completeEnrollment(studentId: string, contextId: string, facePayload: any) {
    if (!this.isPadRealLiveness) {
       // Acknowledging constraint explicitly:
       return { success: false, error: 'Liveness provider not configured. Complete configuration required for secure enrollment.' };
    }
    return { success: true };
  }

  async initializeVerification(studentId: string, sessionId: string) {
    const rawChallenge = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60000);
    
    return { challenge: rawChallenge, expiresAt, contextId: `verify_${studentId}_${sessionId}` };
  }

  async verify(studentId: string, sessionId: string, contextId: string, facePayload: any) {
    return { verified: false, livenessPassed: false, failureReason: 'Liveness provider not configured.' };
  }
}
