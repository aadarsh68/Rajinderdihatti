'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

const navLinks = ['ALL SUITS', 'UNSTITCHED SUITS', 'COLLECTIONS', 'SALE!']

export default function Header() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { wishlistItems } = useWishlist()
  const { user } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      window.location.href = `/collections?search=${encodeURIComponent(query)}`;
    }
  };

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.hamburger} 
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <button
              className={styles.iconBtn}
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {isSearchOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>
                )}
              </svg>
            </button>
            {isSearchOpen && (
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Find your suit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className={styles.headerSearchInput}
                />
              </form>
            )}
          </div>

          <Link href="/" className={styles.logoWrap}>
            <img src="/logo.png" alt="Mrigaank Tex Logo" className={styles.logoImg} />
          </Link>

          <div className={styles.headerRight}>
            <Link
              href={user ? '/profile' : '/login'}
              className={styles.iconBtn}
              aria-label={user ? 'My Account' : 'Sign In'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link href="/wishlist" className={styles.cartBtn} aria-label={`Wishlist (${wishlistItems.length})`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistItems.length > 0 && <span className={styles.cartBadge}>{wishlistItems.length}</span>}
            </Link>
            <Link href="/cart" className={styles.cartBtn} aria-label={`Cart (${itemCount})`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
            </Link>
          </div>
        </div>

        <nav className={styles.nav}>
          {navLinks.map(link => {
            let href = '/';
            if (link === 'UNSTITCHED SUITS') href = '/unstitched-suits';
            if (link === 'COLLECTIONS') href = '/collections';
            if (link === 'SALE!') href = '/sale';
            
            return (
              <Link
                key={link}
                href={href}
                className={`${styles.navLink} ${link === 'SALE!' ? styles.navSale : ''} ${pathname === href ? styles.navLinkActive : ''}`}
              >
                {link}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className={styles.mobileMenu + (isMenuOpen ? ` ${styles.mobileMenuOpen}` : '')}>
        <button className={styles.mobileMenuClose} onClick={() => setIsMenuOpen(false)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <nav className={styles.mobileNav}>
          {navLinks.map(link => {
            let href = '/';
            if (link === 'UNSTITCHED SUITS') href = '/unstitched-suits';
            if (link === 'COLLECTIONS') href = '/collections';
            if (link === 'SALE!') href = '/sale';

            return (
              <Link
                key={link}
                href={href}
                className={`${styles.mobileNavLink} ${link === 'SALE!' ? styles.mobileNavSale : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link}
              </Link>
            );
          })}
        </nav>
        <div className={styles.mobileMenuFooter}>
          <Link href="/login" onClick={() => setIsMenuOpen(false)} className={styles.iconBtn}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></Link>
          <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className={styles.iconBtn}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></Link>
        </div>
      </div>

      <div className={styles.announcementBar}>
        <p>✦ &nbsp; Razorpay Money Back Promise — Get 100% refund on non-delivery or defects &nbsp; ✦</p>
      </div>
    </>
  )
}
