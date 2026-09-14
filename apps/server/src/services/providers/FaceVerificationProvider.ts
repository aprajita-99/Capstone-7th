export interface FaceVerificationProvider {
  /** The name of the integrated provider (e.g. AWS Rekognition, FaceTec, Pending) */
  readonly providerName: string;

  /** True ONLY if the provider provides true 3D/depth Presentation Attack Detection. */
  readonly isPadRealLiveness: boolean;

  /** 
   * Initializes a face enrollment flow yielding a cryptographic challenge boundary mapped exactly against this student.
   * @param studentId The authenticated JWT User's resolved Student map.
   */
  initializeEnrollment(studentId: string): Promise<{ challenge: string; expiresAt: Date; contextId: string }>;
  
  /**
   * Finalizes the enrolment mapping the frame logically (or securely over Cloud TLS) dropping true binaries securely.
   */
  completeEnrollment(studentId: string, contextId: string, facePayload: any): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Starts a Verification block. Crucially mapped dynamically to a particular attendance-session instance natively locking replays!
   */
  initializeVerification(studentId: string, sessionId: string): Promise<{ challenge: string; expiresAt: Date; contextId: string }>;
  
  /**
   * The actual comparison bounding `sessionId`. Yields liveness boundaries alongside algorithmic distances.
   */
  verify(studentId: string, sessionId: string, contextId: string, facePayload: any): Promise<{ verified: boolean; livenessPassed: boolean; failureReason?: string }>;
}
