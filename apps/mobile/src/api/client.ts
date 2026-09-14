import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Maps linearly against the workspace local bounds. E.g., Ngrok or specific local IPs during dev.
export const API_URL = 'http://localhost:3000/api'; 

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('SESSION_JWT');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const FaceAPI = {
  getEnrollmentStatus: () => apiClient.get('/student/face/status'),
  initEnrollment: () => apiClient.post('/student/face/enrollment/init'),
  completeEnrollment: (challenge: string, facePayload: string) => 
     apiClient.post('/student/face/enrollment/complete', { challenge, facePayload }),
  deleteEnrollment: () => apiClient.delete('/student/face/enrollment'),
  initVerification: (sessionId: string) => apiClient.post('/student/face/verify/init', { sessionId }),
  verifyFace: (sessionId: string, challenge: string, facePayload: string) => 
     apiClient.post('/student/face/verify', { sessionId, challenge, facePayload })
};
