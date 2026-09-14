# Development Plan

## Phase 1: Foundation (Completed)
- Monorepo directory skeleton setup (apps, packages).
- Database foundation mapped via Prisma schema.
- Mobile service folder structures outlined.
- Base TypeScript and workspace configurations established.
- Documentation for Architecture and Security formulated.

## Phase 2: Core Authentication & Device Infrastructure
- Execute UI/API integration for Login & Registration (Teacher & Student)
- Device Binding Implementation (Hardware Keystore asymmetric key generation)
- Real database integration (PostgreSQL initialization)

## Phase 3: Teacher Role & Session Lifecycle
- Course and Section creation logic.
- WebSocket / Server implementation to initialize an `AttendanceSession`.
- Mobile implementation for Teacher starting/stopping the session.

## Phase 4: BLE Advertising & Scanning (The Crux)
- Implement `react-native-ble-plx` in abstract service wrappers.
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
