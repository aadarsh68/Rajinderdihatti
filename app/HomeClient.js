'use client';
import { useState, useEffect, useRef } from 'react';
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

  // Showroom Carousel Ref and Scroll Logic
  const scrollContainerRef = useRef(null);

  const slides = [
    {
      img: '/shop/shop1.jpg',
      ratio: '741/1024',
      title: 'Our Heritage Store',
      subtitle: 'Rajinder Di Hatti at Chandni Chowk'
    },
    {
      img: '/shop/shop2.jpg',
      ratio: '1024/656',
      title: 'Premium Fabrics',
      subtitle: 'Fine unstitched suits & materials'
    },
    {
      img: '/shop/shop3.jpg',
      ratio: '1024/642',
      title: 'Personalized Service',
      subtitle: 'Dedicated counters for assistance'
    },
    {
      img: '/shop/shop4.jpg',
      ratio: '1024/674',
      title: 'Bespoke Ambience',
      subtitle: 'Comfortable showroom shopping'
    }
  ];

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.75;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

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
          <h1 className={styles.heroTitle}>RAJINDER DI HATTI</h1>
          <button className={styles.heroBtn} onClick={() => document.getElementById('shop').scrollIntoView({behavior: 'smooth'})}>
            Explore Collection
          </button>
        </div>
      </section>

      <main className={styles.main}>
        <section className={styles.showroomSection}>
          <span className={styles.sectionLabel}>Discover Ambience</span>
          <h2 className={styles.sectionTitle}>Our Boutique Showroom</h2>
          
          <div className={styles.showroomCarouselWrapper}>
            {/* Navigation Arrows */}
            <button 
              className={`${styles.showroomCarouselArrow} ${styles.showroomCarouselArrowPrev}`}
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              className={`${styles.showroomCarouselArrow} ${styles.showroomCarouselArrowNext}`}
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Scrollable Carousel Track */}
            <div 
              className={styles.showroomCarousel}
              ref={scrollContainerRef}
            >
              <div className={styles.showroomTrack}>
                {slides.map((slide, index) => (
                  <div 
                    key={index} 
                    className={styles.showroomCard}
                    style={{ aspectRatio: slide.ratio }}
                  >
                    <img 
                      src={slide.img} 
                      alt={slide.title} 
                      className={styles.showroomCardImg} 
                    />
                    <div className={styles.showroomCardOverlay}>
                      <h3 className={styles.showroomCardTitle}>{slide.title}</h3>
                      <p className={styles.showroomCardSub}>{slide.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Handle below */}
          <div className={styles.showroomSocial}>
            <a 
              href="https://www.instagram.com/ritu_arora_narang?igsh=MTFxODVrb2U5NnBkNg%3D%3D&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              @rajinderdihatti
            </a>
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
          ))}
        </section>

        <section className={styles.storySection}>
          <div className={styles.storyMandala} style={{top: '-100px', left: '-100px'}}><MandalaBg size={400} opacity={0.1}/></div>
          <div className={styles.storyMandala} style={{bottom: '-100px', right: '-100px'}}><MandalaBg size={400} opacity={0.1}/></div>
          <div className={styles.storyContent}>
            <h2 className={styles.storyTitle}>Our Heritage</h2>
            <p className={styles.storyText}>
              Rajinder Di Hatti represents a legacy of textile excellence. 
              We curate only the finest unstitched ethnic suit fabrics, ensuring every thread tells a story of 
              craftsmanship, culture, and timeless beauty.
            </p>
          </div>
        </section>

        <section className={styles.feedbackSection}>
          <div className={styles.feedbackCard}>
            <span className={styles.feedbackLabel}>We Value Your Experience</span>
            <h2 className={styles.feedbackTitle}>Customer Feedback</h2>
            <p className={styles.feedbackText}>
              Have questions, feedback, or need assistance? Reach out to us directly on WhatsApp.
            </p>
            <a 
              href="https://wa.me/918851937440?text=Hello!%20I%20have%20feedback%20regarding%20my%20experience%20at%20Rajinder%20Di%20Hatti."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.806-9.799.002-2.618-1.016-5.08-2.87-6.934C16.353 2.016 13.9 1.002 11.278 1.002c-5.412 0-9.816 4.399-9.82 9.807-.002 2.062.54 4.075 1.572 5.867L2.04 21.96l5.35-1.401-1.12.607-.623.38zm11.758-5.326c-.301-.151-1.782-.879-2.057-.979-.275-.1-.475-.151-.675.151-.2.301-.775.979-.95 1.18-.175.201-.35.226-.651.075-.3-.15-1.267-.467-2.414-1.492-.893-.797-1.496-1.782-1.672-2.083-.176-.302-.019-.465.131-.615.136-.135.301-.351.451-.527.15-.176.2-.301.3-.502.1-.2.05-.376-.025-.527-.075-.151-.675-1.628-.925-2.229-.243-.584-.489-.505-.675-.515-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.376-.275.301-1.05 1.028-1.05 2.509 0 1.48 1.075 2.913 1.225 3.114.15.2 2.115 3.229 5.123 4.527.714.309 1.272.494 1.707.632.718.228 1.37.196 1.885.119.574-.086 1.782-.728 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.201-.575-.351z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerText}>© 2026 Rajinder Di Hatti. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
}
