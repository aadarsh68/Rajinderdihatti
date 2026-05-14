'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState({ lowStock: 0, outOfStock: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetch('/api/admin/products')
        .then(res => res.json())
        .then(data => {
          const products = data.products || [];
          const low = products.filter(p => p.stock > 0 && p.stock <= (p.reorderLevel || 5)).length;
          const out = products.filter(p => p.stock === 0).length;
          setStats({ lowStock: low, outOfStock: out });
        })
        .catch(err => console.error('Stats fetch error:', err));
    }
  }, [session]);

  if (status === 'loading') {
    return <div className={styles.loadingState}><div className={styles.spinner}></div><p>Verifying Admin Credentials...</p></div>;
  }

  if (session?.user?.role !== 'ADMIN') {
    return notFound();
  }

  const navItems = [
    { 
      id: 'dashboard', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>, 
      label: 'Dashboard', 
      path: '/admin/dashboard' 
    },
    { 
      id: 'inventory', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>, 
      label: 'Inventory', 
      path: '/admin/inventory' 
    },
    { 
      id: 'orders', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, 
      label: 'Orders', 
      path: '/admin/orders' 
    },
    { 
      id: 'cod-orders', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>, 
      label: 'COD Orders', 
      path: '/admin/orders/cod' 
    },
    { 
      id: 'alerts', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, 
      label: 'Alerts', 
      path: '/admin/alerts', 
      badge: stats.lowStock + stats.outOfStock 
    },
  ];

  return (
    <div className={`${styles.adminPage} ${sidebarOpen ? '' : styles.sidebarCollapsed}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" width="44" height="32">
              <defs><linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8c870"/><stop offset="100%" stopColor="#c9982a"/></linearGradient></defs>
              <path d="M40,30 Q20,10 5,18 Q15,28 40,30Z" fill="url(#logoGrad)"/>
              <path d="M40,30 Q60,10 75,18 Q65,28 40,30Z" fill="url(#logoGrad)"/>
              <text x="40" y="34" textAnchor="middle" fontSize="16" fontWeight="900" fill="#12100e" fontFamily="Montserrat,sans-serif">MT</text>
            </svg>
          </div>
          <div className={styles.logoText}>
            <div className={styles.logoBrand}>MRIGAANK</div>
            <div className={styles.logoSubtext}>ADMIN</div>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {navItems.map(item => (
            <Link 
              key={item.id} 
              href={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge > 0 && <span className={styles.navBadge}>{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.footerLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Storefront Home</span>
          </Link>
        </div>
      </aside>

      <main className={styles.adminMain}>
        <header className={styles.adminHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.toggleSidebarBtn} onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle Sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>
                {navItems.find(i => i.path === pathname)?.label || 'Admin Panel'}
              </h1>
              <p className={styles.pageSubtitle}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{session.user.name}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
            <div className={styles.userAvatar}>
              {session.user.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className={styles.dashContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
