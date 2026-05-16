'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import styles from './page.module.css';

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

const GoldFrame = () => (
  <svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" className={styles.goldFrame}>
    <defs>
      <linearGradient id="gold3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4a843"/><stop offset="50%" stopColor="#f0c96e"/><stop offset="100%" stopColor="#b8862a"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="292" height="332" rx="4" fill="none" stroke="url(#gold3)" strokeWidth="1.5" opacity="0.7"/>
    <rect x="10" y="10" width="280" height="320" rx="2" fill="none" stroke="url(#gold3)" strokeWidth="0.8" opacity="0.5"/>
  </svg>
);

const MandalaBg = ({ size=400, opacity=0.07 }) => (
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" width={size} height={size} style={{opacity}}>
    <circle cx="200" cy="200" r="180" fill="none" stroke="#8B6914" strokeWidth="0.5"/>
  </svg>
);

export default function HomeClient({ initialProducts }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Date, new to old');
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

  const saleProducts = initialProducts.filter(p => p.status?.toLowerCase() === 'sale' || p.category?.toLowerCase() === 'sale');

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img src="/hero-bg.jpg" alt="Luxury Ethnic Wear" className={styles.heroImage} />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <span className={styles.heroSubtitle}>Exquisite Craftsmanship</span>
          <h1 className={styles.heroTitle}>MRIGAANK TEX</h1>
          <button className={styles.heroBtn} onClick={() => document.getElementById('shop').scrollIntoView({behavior: 'smooth'})}>
            Explore Collection
          </button>
        </div>
      </section>

      <main className={styles.main}>
        <section className={styles.collectionsSection}>
          <span className={styles.sectionLabel}>Curated Styles</span>
          <h2 className={styles.sectionTitle}>Featured Collections</h2>
          <div className={styles.collectionsGrid}>
            {[
              { name: 'Daily Wear Suits', count: '120+ Styles', img: '/unstitched.png' },
              { name: 'Party Wear Suits', count: '85+ Styles', img: '/party.png' },
              { name: 'Bridal Unstitched', count: '40+ Styles', img: '/bridal.png' }
            ].map(col => (
              <div key={col.name} className={styles.collectionCard}>
                <img src={col.img} alt={col.name} className={styles.collectionImg} />
                <div className={styles.collectionOverlay}>
                  <h3 className={styles.collectionName}>{col.name}</h3>
                  <span className={styles.collectionCount}>{col.count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {saleProducts.length > 0 && (
          <section className={styles.saleSectionHome}>
            <div className={styles.saleSectionHeader}>
              <span className={styles.saleSectionBadge}>Limited Time Offer</span>
              <h2 className={styles.saleSectionTitle}>Special Sale Offers</h2>
            </div>
            <div className={styles.productGrid}>
              {saleProducts.map((product, idx) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productImgWrap}>
                    <Link href={`/product/${product.id}`}>
                      <div className={styles.productImgInner} style={{background: product.colorHex || product.bg || '#fff'}}>
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
                    <button className={styles.addBtn} onClick={() => handleAddToCart(product)}>
                      {added[product.id] ? "Added to Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div id="shop" className={styles.shopHeader}>
          <div className={styles.shopTitleBox}>
            <h2 className={styles.shopMainTitle}>The Boutique</h2>
            <span className={styles.shopSub}>Handpicked ethnic treasures for you</span>
          </div>
        </div>

        <section className={styles.productGrid}>
          {filteredProducts.map((product, idx) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImgWrap}>
                <Link href={`/product/${product.id}`}>
                  <div className={styles.productImgInner} style={{background: product.colorHex || product.bg || '#fff'}}>
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
                <button className={styles.addBtn} onClick={() => handleAddToCart(product)}>
                  {added[product.id] ? "Added to Cart" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.storySection}>
          <div className={styles.storyMandala} style={{top: '-100px', left: '-100px'}}><MandalaBg size={400} opacity={0.1}/></div>
          <div className={styles.storyMandala} style={{bottom: '-100px', right: '-100px'}}><MandalaBg size={400} opacity={0.1}/></div>
          <div className={styles.storyContent}>
            <h2 className={styles.storyTitle}>Our Heritage</h2>
            <p className={styles.storyText}>
              Mrigaank Tex represents a legacy of textile excellence. 
              We curate only the finest unstitched ethnic suit fabrics, ensuring every thread tells a story of 
              craftsmanship, culture, and timeless beauty.
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerText}>© 2026 Mrigaank Tex. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
}
