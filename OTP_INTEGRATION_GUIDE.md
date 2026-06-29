# OTP Authentication Integration Guide

This guide explains how to integrate the Passwordless OTP Login flow into this website from the CRM backend.

## Prerequisites
Make sure you have the Backend API URL set in your environment variables (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080   # Use the production URL when live
```

---

## The APIs

### 1. Send OTP
Generates a 6-digit OTP and sends it to the user's email. If the user does not exist, an account is automatically created.

- **Endpoint**: `POST /auth/otp/send`
- **Headers**: `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (201 Created):**
```json
{
  "message": "OTP sent successfully"
}
```

---

### 2. Verify OTP
Validates the 6-digit OTP. If successful, it verifies the user's email and returns a JWT `accessToken` along with the user profile, exactly like a standard login.

- **Endpoint**: `POST /auth/otp/verify`
- **Headers**: `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123xx-xxxx-xxxx-xxxx",
    "email": "user@example.com",
    "role": "employee",
    "isVerified": true
  },
  "profile": {
    "id": "xyz987xx-xxxx-xxxx-xxxx",
    "name": "User Name",
    "kind": "employee"
  }
}
```

---

## Step 1: Create the API Helper Functions

Create a new file `src/lib/auth-api.ts` (or wherever you keep your API calls) and add these two functions:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 1. Send OTP to the user's email
export async function sendOtp(email: string) {
  const response = await fetch(`${API_URL}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send OTP');
  }

  return response.json(); // returns { message: "OTP sent successfully" }
}

// 2. Verify the 6-digit OTP and login
export async function verifyOtp(email: string, otp: string) {
  const response = await fetch(`${API_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Invalid or expired OTP');
  }

  return response.json(); // returns { accessToken, user, ... }
}
```

---

## Step 2: Build the UI (React/Next.js Example)

You will need a page where the user enters their email, and then a page (or state) where they enter the 6-digit code.

Here is a complete example of a combined component you can drop into `src/app/login/page.tsx` or similar:

```tsx
"use client";

import React, { useState } from 'react';
import { sendOtp, verifyOtp } from '@/lib/auth-api';

export default function OtpLoginComponent() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Email, Step 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Step 1: Requesting the OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendOtp(email);
      setStep(2); // Move to OTP input screen
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verifying the OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await verifyOtp(email, otp);
      
      // 1. Save the JWT token securely (localStorage or cookies)
      localStorage.setItem('accessToken', data.accessToken);
      
      // 2. Redirect the user to the dashboard or next step
      alert('Login successful! Token saved.');
      // window.location.href = '/dashboard';
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h2>Sign In / Sign Up</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp}>
          <label>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="you@example.com"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Magic Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <p>We sent a 6-digit code to <strong>{email}</strong></p>
          <label>Enter 6-Digit Code</label>
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            required 
            maxLength={6}
            placeholder="123456"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          
          <button type="button" onClick={() => setStep(1)} style={{ marginTop: '10px' }}>
            Change Email
          </button>
        </form>
      )}
    </div>
  );
}
```

### Important Notes for Frontend:
1. **Token Storage**: After `verifyOtp` succeeds, store the `accessToken` in `localStorage` or a secure HTTP-only cookie.
2. **Subsequent API Calls**: For any authenticated API requests made later to the CRM, attach the token in the Headers like this:
   `Authorization: Bearer <accessToken>`
