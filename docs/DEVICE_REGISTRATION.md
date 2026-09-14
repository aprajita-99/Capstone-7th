# Device Registration & Cryptographic Foundation

## Objective
The application utilizes asymmetric Hardware Keystore verification to definitively guarantee that physical device bounds represent true biological presence. Phase 4 established the foundational domain primitives managing these models in the backend without attempting speculative implementation on the Mobile UI.

## Model Expansions
The `Device` Prisma model inherently tracks:
- `publicKey` (String explicitly validated by Zod bound limits rejecting trivial inputs).
- `status` (`DeviceStatus` Enum actively gating `ACTIVE` vs `REVOKED` thresholds natively).
- `algorithm` & `platform` identifiers.

## API Contracts
- `POST /api/student/devices`
  - Safely pairs the device record against `req.userId -> studentId`.
  - Intentionally refuses to ingest Private Keys (which remain permanently guarded within secure iOS/Android secure enclosures).
- `POST /api/student/devices/:deviceId/revoke`
  - Transitions `status` mapping unconditionally restricting any further challenge-response algorithms mapped against this public key context in upcoming BLE interactions.
