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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit phone';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    setServerError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setServerError(data?.error || data?.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    } catch (error) {
      setServerError('Unable to create account. Please check your internet connection and try again.');
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', level: 1 };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', level: 2 };
    if (/[!@#$%^&*]/.test(p)) return { label: 'Strong', level: 4 };
    return { label: 'Good', level: 3 };
  };

  const strength = passwordStrength();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <span className={styles.breadSep}>✦</span>
          <span>Create Account</span>
        </p>
        <h1 className={styles.pageTitle}>Join Us</h1>
        <GoldDivider />
        <p className={styles.subtitle}>Create your Mrigaank Tex account</p>
      </div>

      <div className={styles.authLayout}>
        <form className={styles.authCard} onSubmit={handleSubmit}>
          <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
          <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />

          <div className={styles.cardLogo}>
            <h2 className={styles.cardLogoText}>RAJINDER DI HATTI</h2>
          </div>

          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>01</span> Personal Details
          </h2>
          <GoldDivider />

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange}
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                placeholder="Priya" />
              {errors.firstName && <span className={styles.errorMsg}>{errors.firstName}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange}
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                placeholder="Sharma" />
              {errors.lastName && <span className={styles.errorMsg}>{errors.lastName}</span>}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="Enter your email" />
              {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Phone Number *</label>
              <div className={styles.phoneWrap}>
                <span className={styles.phonePrefix}>+91</span>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  className={`${styles.input} ${styles.inputPhone} ${errors.phone ? styles.inputError : ''}`}
                  placeholder="9876543210" maxLength={10} />
              </div>
              {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
            </div>
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: 8 }}>
            <span className={styles.sectionNum}>02</span> Set Password
          </h2>
          <GoldDivider />

          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Password *</label>
              <div className={styles.passwordWrap}>
                <input name="password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  className={`${styles.input} ${styles.inputPassword} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Min. 8 characters" />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPassword(p => !p)}>
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
              {strength && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBars}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`${styles.strengthBar} ${i <= strength.level ? styles[`strength${strength.level}`] : ''}`} />
                    ))}
                  </div>
                  <span className={`${styles.strengthLabel} ${styles[`strengthLabel${strength.level}`]}`}>{strength.label}</span>
                </div>
              )}
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Confirm Password *</label>
              <div className={styles.passwordWrap}>
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={handleChange}
                  className={`${styles.input} ${styles.inputPassword} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Repeat your password" />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? (
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
              {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={styles.btnPrimary}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
            {!isLoading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </button>
          {serverError && <span className={styles.errorMsg}>{serverError}</span>}

          <GoldDivider />

          <div className={styles.altActions}>
            <span className={styles.altText}>Already have an account?</span>
            <Link href="/login" className={styles.altLink}>Sign in →</Link>
          </div>
        </form>

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
