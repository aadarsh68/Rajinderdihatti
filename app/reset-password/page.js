'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function GoldDivider() {
  return (
    <div className={styles.goldDivider}>
      <span className={styles.dividerLine} /><span className={styles.dividerDiamond}>◆</span><span className={styles.dividerLine} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.page}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setEmail(searchParams.get('email') || '');
  }, [searchParams]);

  const validate = () => {
    const newErrors = {};
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!email) { setServerError('Email missing. Please start over.'); return; }

    setServerError('');
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setServerError(data?.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setServerError('Unable to reset password. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <span className={styles.breadSep}>✦</span>
          <span>Reset Password</span>
        </p>
        <h1 className={styles.pageTitle}>Create New Password</h1>
        <GoldDivider />
        <p className={styles.subtitle}>Enter a strong password for your account</p>
      </div>

      <div className={styles.authLayout}>
        <div className={styles.authCard}>
          <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
          <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />

          {!success ? (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password *</label>
                <div className={styles.passwordWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Repeat new password"
                />
                {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword}</span>}
              </div>

              <button onClick={handleSubmit} className={styles.btnPrimary}>
                Reset Password
              </button>
              {serverError && <span className={styles.errorMsg}>{serverError}</span>}
            </>
          ) : (
            <div className={styles.successState}>
              <h3 className={styles.successTitle}>Password Reset!</h3>
              <p className={styles.successMsg}>Your password has been updated successfully. Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
