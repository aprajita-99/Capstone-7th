# Attendance Session Lifecycle Contract

## Core Tenet
An attendance session acts through a definitive state machine:
`CREATED` -> `ACTIVE` -> `STOPPED`
If `now >= expiresAt`, it enters `EXPIRED`. Only **1 ACTIVE** session is permitted for a single Section at a given time.

### POST `/api/sections/:sectionId/attendance-sessions`
Spawns a Session in `CREATED`.
```json
{
  "subject": "Intro to Binary Trees",
  "room": "Lab 1",
  "durationMinutes": 60
}
```

### GET `/api/sections/:sectionId/attendance-sessions/active`
Returns the 1 explicitly active session. Reverts to `404` if none exist, or if the lone existent session has surpassed its calculated `expiresAt` envelope.

### POST `/api/attendance-sessions/:sessionId/start`
Validates `CREATED` state and transitions to `ACTIVE`.

### POST `/api/attendance-sessions/:sessionId/stop`
Validates `ACTIVE` state, injects `endedAt = now`, and sets `STOPPED`. This irreversibly terminates attendance ingress capabilities.
