'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';

function GoldDivider() {
  return (
    <div className={styles.goldDivider}>
      <span className={styles.dividerLine} /><span className={styles.dividerDiamond}>◆</span><span className={styles.dividerLine} />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setServerError('');
    setIsLoading(true);
    try {
      const result = await login(form.email.trim().toLowerCase(), form.password);

      if (result.success) {
        router.push('/profile');
      } else {
        setServerError(result.error);
        setIsLoading(false);
      }
    } catch (error) {
      setServerError('Unable to sign in. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <span className={styles.breadSep}>✦</span>
          <span>Sign In</span>
        </p>
        <h1 className={styles.pageTitle}>Welcome Back</h1>
        <GoldDivider />
        <p className={styles.subtitle}>Sign in to your Mrigaank Tex account</p>
      </div>

      <div className={styles.authLayout}>
        <div className={styles.authCard}>
          <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
          <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="priya@example.com"
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Password</label>
              <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>
            <div className={styles.passwordWrap}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className={`${styles.input} ${styles.inputPassword} ${errors.password ? styles.inputError : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          <button onClick={handleSubmit} disabled={isLoading} className={styles.btnPrimary} style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? (
              <>
                <span>Signing in</span>
                <span style={{ display: 'inline-block', marginLeft: '6px', animation: 'spin 1s linear infinite' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                </span>
              </>
            ) : (
              <>
                Sign In
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
          {serverError && <span className={styles.errorMsg}>{serverError}</span>}

          <GoldDivider />

          <div className={styles.altActions}>
            <span className={styles.altText}>New to Mrigaank Tex?</span>
            <Link href="/register" className={styles.altLink}>Create an account →</Link>
          </div>
        </div>

        <div className={styles.brandPanel}>
          <div className={styles.brandPanelInner}>
            <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" className={styles.brandLogo}>
              <defs>
                <linearGradient id="panelGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9982a" />
                  <stop offset="50%" stopColor="#e8b84b" />
                  <stop offset="100%" stopColor="#a87020" />
                </linearGradient>
              </defs>
              <path d="M40,30 Q20,10 5,18 Q15,28 40,30Z" fill="url(#panelGold)" />
              <path d="M40,30 Q60,10 75,18 Q65,28 40,30Z" fill="url(#panelGold)" />
              <text x="40" y="34" textAnchor="middle" fontSize="18" fontWeight="bold"
                fill="url(#panelGold)" fontFamily="Montserrat, sans-serif">MT</text>
            </svg>
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
