# Invitation System Architecture

## Cryptographic Base
The invitation infrastructure prevents brute forcing or ID-guessing by avoiding predictable auto-incrementing integers or standard UUIDs that could accidentally be leaked.
- Token Generation: `crypto.randomBytes(32).toString('hex')` returns 64 entropy-rich hex characters.
- Token Storage: Backend uniquely indexes the single-pass SHA-256 hash using `crypto.createHash('sha256')`.

## Lifecycle Config
- **Expiry**: Configurable directly by the teacher (`expiresInDays` bounding `1 - 30`). Bound defaults seamlessly to 7 days computed completely within the UTC backend execution frame.
- **Revocation**: Invites incorporate a discrete `revokedAt` DateTime permitting terminal invalidation without destroying existent Enrollment lineages. All ingest attempts upon revoked links permanently return stateless 400 violations.

## API Contracts
### Teacher (Owner Operations)
- `POST /api/sections/:sectionId/invites` (Body: `{ expiresInDays?: number }`) $\rightarrow$ `{ inviteToken: string }`
- `GET /api/sections/:sectionId/invites/list` $\rightarrow$ Metadata array (exposes zero token secrets).
- `POST /api/invites/:inviteId/revoke` $\rightarrow$ Triggers `revokedAt`.

### Student (Ingest Operations)
- `GET /api/invites/:token` $\rightarrow$ Public metadata parser exposing `{ courseName, sectionName }` before prompting enrollment confirmation.
- `POST /api/invites/:token/accept` $\rightarrow$ Executes unified duplicate checks mapping the `token -> Section` and `req.userId -> StudentId` directly in the backend. 
