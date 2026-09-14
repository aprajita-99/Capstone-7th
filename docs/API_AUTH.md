# Authentication API Contract

## POST `/api/auth/register`
**Purpose**: Register a new Student or Teacher account. Generates a secure session token upon success natively isolating Role privileges.
**Auth**: Public
**Body**:
```json
{
  "email": "student@example.com",
  "password": "strongPassword123!",
  "role": "STUDENT" // or "TEACHER"
}
```
**Success Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "STUDENT"
    },
    "token": "eyJhbG..."
  }
}
```

## POST `/api/auth/login`
**Purpose**: Issues an authentication token for an existing user.
**Auth**: Public
**Body**:
```json
{
  "email": "student@example.com",
  "password": "strongPassword123!"
}
```
**Success Response**: `200 OK` (Same format as Register)

## GET `/api/auth/me`
**Purpose**: Fetches the currently authenticated profile information.
**Auth**: Requires Bearer Token Header (`Authorization: Bearer <token>`)
**Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "STUDENT",
      "createdAt": "date...",
      "updatedAt": "date..."
    }
  }
}
```

## Error Formats
All errors return `success: false` and a strongly typed `error` field overriding HTTP defaults.
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": [] 
  }
}
```
