# Architecture Specification

## Monorepo Layout
The project follows a standard un-ejected React Native monorepo approach utilizing `npm` workspaces.

```text
/
├── apps/
│   ├── mobile/          # React Native (Expo/React Native CLI) Application
│   └── server/          # Node.js + Express + Prisma Backend
│
├── packages/
│   ├── shared/          # Shared Zod validation schemas & TS definitions
│   └── config/          # Shared configurations (e.g. ESLint, Prettier if applicable)
```

## Separation of Concerns (Mobile)
A strict clean architectural design pattern is used to separate the UI layer from the data and platform layers.

- **`src/screens`**: Contains purely presentational React components that compose screens. Business logic here is kept to an absolute minimum.
- **`src/components`**: Reusable generic and domain-specific UI components.
- **`src/services`**: Foundational domain logic wrapper. 
  - `ble/` - Abstracts `react-native-ble-plx` so the app only ever relies on internal interfaces (e.g., `startAdvertising()`, `scanForTeacher()`).
  - `face/` - Isolates the facial recognition/liveness module.
  - `device/` - Isolates KeyStore/KeyChain security key generation.
- **`src/app` / `src/navigation`**: Router and navigation setups.

*Note: UI components must never contain direct backend API calls or raw database queries. All data access occurs via isolated hooks wrapping backend API calls.*

## Backend Internal Architecture (apps/server)
A stringent decoupled Service-Repository pattern is enforced to avoid tightly coupling Express HTTP logic with Database logic.
- **`src/controllers/`**: Isolates `req` and `res`. Forwards Zod-validated payloads to Domain Services.
- **`src/services/`**: Holds core business rules and identity mapping logic (e.g. `auth.service.ts`). Depends entirely on Repositories.
- **`src/repositories/`**: Contains direct Prisma queries. Isolates standard database hydration and transactions.
- **`src/middleware/`**: Handles localized protections. `requireAuth` blocks unauthenticated routes via stateless session decodes, while `requireRole` protects administrative features.

## Service Interface Philosophy
By designing abstract interfaces (e.g., `IAuthService`, `IBleService`), we can swap out mocked development versions with actual physical device implementations (like real BLE broadcasting) without modifying the UI layer.

## Database (Prisma)
The backend leverages Prisma. The database schema separates `User` from `Student` and `Teacher` profiles to allow unified authentication and extensible profile data per role. Attendance records depend strongly on an `AttendanceSession` to group active BLE check-ins.
