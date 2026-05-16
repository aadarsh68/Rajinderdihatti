'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

function GoldDivider() {
  return (
    <div className={styles.goldDivider}>
      <span className={styles.dividerLine} /><span className={styles.dividerDiamond}>◆</span><span className={styles.dividerLine} />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setError('');
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Failed to send OTP. Please check your email.');
        return;
      }

      setSent(true);
      setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=reset`), 1800);
    } catch (error) {
      setError('Unable to process request. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <span className={styles.breadSep}>✦</span>
          <Link href="/login" className={styles.breadLink}>Sign In</Link>
          <span className={styles.breadSep}>✦</span>
          <span>Reset Password</span>
        </p>
        <h1 className={styles.pageTitle}>Reset Password</h1>
        <GoldDivider />
        <p className={styles.subtitle}>Enter your email to receive a verification code</p>
      </div>

      <div className={styles.authLayout}>
        <div className={styles.authCard}>
          <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
          <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />

          {!sent ? (
            <>
              <div className={styles.iconWrap}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9982a" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <p className={styles.cardDesc}>
                We'll send a one-time password to your registered email address. Check your inbox after submitting.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  className={`${styles.input} ${error ? styles.inputError : ''}`}
                  placeholder="Enter your email"
                />
                {error && <span className={styles.errorMsg}>{error}</span>}
              </div>

              <button onClick={handleSubmit} className={styles.btnPrimary}>
                Send OTP
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <GoldDivider />

              <div className={styles.altActions}>
                <Link href="/login" className={styles.altLink}>← Back to Sign In</Link>
              </div>
            </>
          ) : (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a7a40" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.44 2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className={styles.successTitle}>OTP Sent!</h3>
              <p className={styles.successMsg}>
                A verification code has been sent to <strong>{email}</strong>. Redirecting you now…
              </p>
              <div className={styles.loadingDots}>
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <div className={styles.brandPanel}>
          <div className={styles.brandPanelInner}>
            <img src="/logo.png" alt="Mrigaank Tex Logo" className={styles.brandLogoImg} />
            <h2 className={styles.brandTitle}>MRIGAANK TEX</h2>
            <p className={styles.brandTagline}>Luxury Indian Ethnic Wear</p>
            <GoldDivider />
            <ul className={styles.brandPerks}>
              <li className={styles.brandPerk}>
                <span className={styles.perkIcon}>✦</span>
                <span>Exclusive member discounts</span>
              </li>
              <li className={styles.brandPerk}>
                <span className={styles.perkIcon}>✦</span>
                <span>Order tracking & history</span>
              </li>
              <li className={styles.brandPerk}>
                <span className={styles.perkIcon}>✦</span>
                <span>Saved addresses & wishlist</span>
              </li>
              <li className={styles.brandPerk}>
                <span className={styles.perkIcon}>✦</span>
                <span>Early access to new collections</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
