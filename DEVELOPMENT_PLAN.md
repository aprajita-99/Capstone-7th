# Development Plan

## Phase 1: Foundation (Completed)
- Monorepo directory skeleton setup (apps, packages).
- Database foundation mapped via Prisma schema.
- Mobile service folder structures outlined.
- Base TypeScript and workspace configurations established.
- Documentation for Architecture and Security formulated.

## Phase 2: Core Authentication & Identity (Completed)
- Clean Service-Repository pattern enforced in backend.
- Token-based identity subsystem (JWT, bcrypted passwords).
- Zod-schema validations on all inbound payloads.
- Custom `AppError` and centralized error handler mappings.

## Phase 3: Teacher Role & Session Lifecycle (Completed)
- Course and Section creation pipelines structurally established.
- `AttendanceSessionStatus` enforced isolating single concurrency limits.
- `expiresAt` computation fully extracted to the backend removing client timestamps.
- Repositories strictly scope ownership mapping JWT to nested Teacher topologies.

## Phase 4: Device Cryptography & Enrolment
- Deploy invitation link bindings / Student enrollment handlers.
- Wire Asymmetric Hardware generation via `react-native-biometrics`.
- Validate hardware attestations and backend verification logics.ervice wrappers.
- Implement the teacher BLE Non-Connectable Broadcaster payload logic (rolling tokens).
- Implement the student BLE Central Scanner logic to capture payloads and RSSI values without paring.
- Implement physical device testing (cannot be fully tested in emulator).

## Phase 5: Face Verification & Liveness Integration
- Integrate an on-device facial recognition/liveness library.
- Securely acquire baseline templates during student registration.
- Chain the captured verification into the attendance check-in workflow.

## Phase 6: E2E Integration & Edge Cases
- Backend pipeline tying the BLE token + Device Signature + Face Result.
- Off-line mode handling / Queued results.
- Teacher real-time dashboard UI using WebSockets.

## Phase 7: Production Optimization
- Formal threat assessment & penetration testing (simulated).
- Hardening of JWTs, API limits, and token lifetimes.
