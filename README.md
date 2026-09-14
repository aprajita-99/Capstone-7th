# Automated BLE & Biometric Attendance System

A production-oriented React Native cross-platform application aiming to solve manual attendance overhead and drastically reduce proxy attendance through multi-layered verification constraints: Course Authorization, Active Session Validation, Localized BLE Signal Proximity, Root Device Attestation, and On-Device Biometric Face Verification.

## Monorepo Layout

- `apps/mobile/` - React Native (Expo Router) Application.
- `apps/server/` - Node.js Backend utilizing Prisma (PostgreSQL).
- `packages/shared/` - Shared Typescript interfaces and Zod validation schemas.

## Requirements
- Node.js > 18.x
- PostgreSQL server (can be provisioned via Docker)
- Redis server
- Global Expo CLI (`npm install -g expo-cli`)

## Quickstart

### 1. Root Installation
Run `npm install` at the root to leverage npm workspaces and install the entire ecosystem's dependencies.

### 2. Backend Startup
```bash
# Provision DB
cd apps/server
npx prisma db push
npx prisma generate

# Start the dev server
npm run dev
# Alternatively, from root: npm run dev:server
```

### 3. Mobile App Startup
```bash
cd apps/mobile
npx expo start --clear
# Alternatively, from root: npm run dev:mobile
```

Note: Because this application heavily relies on physical BLE modules, it will eventually require "Expo Prebuilds" (Development Builds base on React Native CLI native implementations) and **must be tested on physical iOS/Android devices**, not just abstract computer emulators.

## Documentation
Please view the generated technical documents at the project root for comprehensive insights:
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SECURITY.md](./SECURITY.md)
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
- [docs/](./docs/) - Spec library
