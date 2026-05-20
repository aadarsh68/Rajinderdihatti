'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className={styles.page}>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    setEmail(searchParams.get('email') || '');
    setType(searchParams.get('type') || '');
  }, [searchParams]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    setError('');
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }
    if (!email) { setError('Email not found. Please try registering again.'); return; }

    setError('');
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, preserve: type === 'reset' }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Verification failed');
        return;
      }

      setVerified(true);
      const nextPath = type === 'reset' ? `/reset-password?email=${encodeURIComponent(email)}&otp=${code}` : '/profile';
      setTimeout(() => router.push(nextPath), 1800);
    } catch (error) {
      setError('Unable to verify OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;

    setError('');
    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Failed to resend OTP');
        return;
      }

      setOtp(['', '', '', '', '', '']);
      setResendTimer(30);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setError('Unable to resend OTP. Please try again.');
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
          <span>Verify OTP</span>
        </p>
        <h1 className={styles.pageTitle}>Verify OTP</h1>
        <GoldDivider />
        <p className={styles.subtitle}>Enter the 6-digit code sent to your email</p>
      </div>

      <div className={styles.authLayout}>
        <div className={styles.authCard}>
          <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
          <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />

          {!verified ? (
            <>
              <div className={styles.iconWrap}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c9982a" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              <p className={styles.cardDesc}>
                We sent a verification code to your email address. The OTP is valid for <strong>10 minutes</strong>.
              </p>

              <div className={styles.otpWrap}>
                <div className={styles.otpRow} onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className={`${styles.otpInput} ${error ? styles.otpInputError : ''} ${digit ? styles.otpInputFilled : ''}`}
                      maxLength={1}
                      autoComplete="off"
                    />
                  ))}
                </div>
                {error && <span className={styles.errorMsg}>{error}</span>}
              </div>

              <button onClick={handleVerify} className={styles.btnPrimary}>
                Verify OTP
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>

              <GoldDivider />

              <div className={styles.resendWrap}>
                <span className={styles.resendText}>Didn't receive the code?</span>
                {canResend ? (
                  <button onClick={handleResend} className={styles.resendBtn}>Resend OTP</button>
                ) : (
                  <span className={styles.resendTimer}>
                    Resend in <strong>{resendTimer}s</strong>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a7a40" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className={styles.successTitle}>Verified!</h3>
              <p className={styles.successMsg}>
                Your identity has been confirmed. Redirecting you {type === 'reset' ? 'to reset your password' : 'to your profile'}…
              </p>
              <div className={styles.loadingDots}>
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <div className={styles.brandPanel}>
          <div className={styles.brandPanelInner}>
            <h2 className={styles.brandTitleMain}>RAJINDER DI HATTI</h2>
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
