'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import styles from '../page.module.css';

const FloralSVG = ({ color }) => {
  const petal = ['darkgrey','maroon','blue','teal'].includes(color) ? '#e8b4c0' : '#d4808a';
  const leaf = '#8aaa7a';
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" className={styles.floralSvg}>
      <line x1="60" y1="120" x2="60" y2="50" stroke={leaf} strokeWidth="1.5"/>
      <line x1="60" y1="90" x2="40" y2="75" stroke={leaf} strokeWidth="1"/>
      <line x1="60" y1="80" x2="80" y2="65" stroke={leaf} strokeWidth="1"/>
      <ellipse cx="35" cy="72" rx="10" ry="5" fill={leaf} transform="rotate(-30 35 72)" opacity="0.8"/>
      <ellipse cx="85" cy="62" rx="10" ry="5" fill={leaf} transform="rotate(30 85 62)" opacity="0.8"/>
      {[0,60,120,180,240,300].map((angle,i)=>(
        <ellipse key={i} cx="60" cy="50" rx="7" ry="14" fill={petal} opacity="0.85" transform={`rotate(${angle} 60 50)`}/>
      ))}
      <circle cx="60" cy="50" r="6" fill="#f5e6b0"/>
    </svg>
  );
};

export default function ProductListClient({ products: initialProducts, title, subtitle }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [added, setAdded] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) setSearchQuery(q);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200);
  };

  const filteredProducts = initialProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ paddingTop: '120px' }}>
        <div className={styles.shopHeader}>
          <div className={styles.shopTitleBox}>
            <h1 className={styles.shopMainTitle}>{title}</h1>
            <span className={styles.shopSub}>{subtitle}</span>
          </div>
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Search in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <section className={styles.productGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImgWrap}>
                  {product.stock <= 0 && (
                    <span className={styles.outOfStockTag}>Sold Out</span>
                  )}
                  <Link href={`/product/${product.id}`}>
                    <div className={`${styles.productImgInner} ${product.stock <= 0 ? styles.outOfStockImg : ''}`} style={{background: product.colorHex || product.bg || '#fff'}}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl.split(',')[0]} alt={product.name} className={styles.productImg} />
                      ) : (
                        <FloralSVG color={product.color?.toLowerCase()}/>
                      )}
                    </div>
                  </Link>
                  <button 
                    className={styles.wishlistBtn} 
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                    aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div className={styles.productInfo}>
                  <p className={styles.productCode}>{product.code}</p>
                  <Link href={`/product/${product.id}`} className={styles.productNameLink}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  <p className={styles.productPrice}>
                    <span className={styles.currencySymbol}>₹</span>
                    {product.price.toLocaleString('en-IN')}
                  </p>
                  {product.stock > 0 ? (
                    <button className={styles.addBtn} onClick={() => handleAddToCart(product)}>
                      {added[product.id] ? "Added to Cart" : "Add to Cart"}
                    </button>
                  ) : (
                    <button className={styles.addBtnDisabled} disabled>
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noProducts}>
              <p>No products found in this category.</p>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>© 2026 Mrigaank Tex. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
