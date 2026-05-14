// Example: Forgot Password Flow
// This shows how to implement the complete forgot password process

// Step 1: User requests password reset (forgot-password)
const forgotPasswordResponse = await fetch('http://localhost:3000/api/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const forgotResult = await forgotPasswordResponse.json();
// Expected response:
// {
//   "success": true,
//   "message": "OTP sent to your email. Check your inbox."
// }

// Step 2: User receives OTP in email and submits new password (reset-password)
const resetPasswordResponse = await fetch('http://localhost:3000/api/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456', // 6-digit code from email
    newPassword: 'newPassword123'
  })
});

const resetResult = await resetPasswordResponse.json();
// Expected response:
// {
//   "success": true,
//   "message": "Password reset successfully. You can now log in with your new password."
// }

// Expected error responses:
// If OTP is invalid:
// {
//   "error": "Invalid OTP."
// }

// If OTP expired:
// {
//   "error": "OTP has expired."
// }

// If password too short:
// {
//   "error": "Password must be at least 8 characters."
// }
