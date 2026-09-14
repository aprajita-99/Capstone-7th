# Security Model

This document outlines the intended threat assumptions, guarantees, and the core cryptographic trust chain preventing proxy attendance in the Automated BLE & Biometric Attendance System.

## Threat Assumptions
1. **Device spoofing:** Students might attempt to use emulator devices or multiple accounts on one phone.
2. **GPS spoofing:** Location data can be falsified and is explicitly NOT RELIED UPON.
3. **Face Spoofing (Presentation Attacks):** Students may attempt to hold pictures/videos of their peers.
4. **BLE Spoofing & Relay Attacks:** Students not in the classroom might have a friend in the classroom relay the BLE payload to them over the internet.

## The Core Trust Chain

Attendance validation does not rely on a single factor. The backend is the single source of truth and ultimately authorizes an attendance check-in.

1. **Course Enrollment Verification**: User identity is bound to a specific course.
2. **Active Server Session**: A teacher must formally open a time-bound session in the database.
3. **Rolling BLE Token**: The BLE advertisement broadcast by the teacher contains a short-lived rotational token verified by the backend. It dynamically prevents replay attacks by students scanning a BLE signal and reusing it 5 minutes later.
4. **Proximity verification (RSSI)**: RSSI is logged and processed probabilistically to flag anomalies (e.g. RSSI values that suggest the user is 500 feet away).
5. **Device Binding (Asymmetric Cryptography)**:
    - We *do not* rely on easily spoofed identifiers like `ANDROID_ID`. 
    - Upon registration, an RSA/EC keypair is generated within the device's hardware KeyStore/Keychain.
    - The private key never leaves the device. The public key is stored in the database.
    - During check-in, the device signs a backend challenge with the private key to authenticate the physical hardware.
6. **Liveness Detection & Face Verification**:
    - The app enforces active liveness detection (blinking, head movement) locally to thwart simple 2D printouts.
    - Captured frames are then passed through facial verification bound to the original enrollment baseline.
7. **Server-Side Authorization**: The backend independently validates the Signed Challenge, the BLE Rolling Token, and the Biometric result before committing the `AttendanceRecord`.
