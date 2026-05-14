'use client';
import Link from 'next/link';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import styles from './page.module.css';

const FloralSVG = ({ color }) => {
  const petal = ['darkgrey','maroon','blue','teal'].includes(color) ? '#e8b4c0' : '#d4808a';
  const leaf = '#8aaa7a';
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" className={styles.floralSvg}>
      <line x1="60" y1="120" x2="60" y2="50" stroke={leaf} strokeWidth="1.5"/>
      {[0,60,120,180,240,300].map((angle,i)=>(
        <ellipse key={i} cx="60" cy="50" rx="7" ry="14" fill={petal} opacity="0.85" transform={`rotate(${angle} 60 50)`}/>
      ))}
      <circle cx="60" cy="50" r="6" fill="#f5e6b0"/>
    </svg>
  );
};

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Wishlist</h1>
        <p className={styles.subtitle}>{wishlistItems.length} items of timeless elegance</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p>Your wishlist is currently empty.</p>
          <Link href="/" className={styles.shopBtn}>Explore Collections</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlistItems.map(item => {
            const images = item.imageUrl ? item.imageUrl.split(',').filter(Boolean) : [];
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.imgWrap}>
                  <Link href={`/product/${item.id}`}>
                    <div className={styles.imgInner} style={{ background: item.bg || '#e8ddd0' }}>
                      {images.length > 0 ? (
                        <img src={images[0]} alt={item.name} className={styles.productImg} />
                      ) : (
                        <FloralSVG color={item.color?.toLowerCase()} />
                      )}
                    </div>
                  </Link>
                  <button 
                    className={styles.removeBtn} 
                    onClick={() => toggleWishlist(item)}
                    title="Remove from wishlist"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className={styles.info}>
                  <p className={styles.code}>{item.code}</p>
                  <Link href={`/product/${item.id}`}>
                    <h3 className={styles.name}>{item.name}</h3>
                  </Link>
                  <p className={styles.price}>₹ {item.price?.toLocaleString('en-IN')}</p>
                  <button className={styles.addBtn} onClick={() => addToCart(item)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
