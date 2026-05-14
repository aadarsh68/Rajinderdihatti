'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
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

export default function ProductDetailClient({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  
  const images = product.imageUrl ? product.imageUrl.split(',').filter(Boolean) : [];

  const handleNextImage = () => {
    setActiveImage(prev => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImage(prev => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/">{product.category || 'Collection'}</Link>
        <span>/</span>
        <span className={styles.activeBreadcrumb}>{product.name}</span>
      </nav>

      <div className={styles.container}>
        <div className={styles.imageSection}>
          <div className={styles.imageCard} style={{ background: product.colorHex || '#e8ddd0' }}>
            {images.length > 0 ? (
              <>
                <img src={images[activeImage]} alt={product.name} className={styles.detailImg} />
                {images.length > 1 && (
                  <>
                    <button 
                      className={styles.slideArrowLeft} 
                      onClick={(e) => { e.preventDefault(); handlePrevImage(); }}
                      aria-label="Previous Image"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button 
                      className={styles.slideArrowRight} 
                      onClick={(e) => { e.preventDefault(); handleNextImage(); }}
                      aria-label="Next Image"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <FloralSVG color={product.color?.toLowerCase()} />
            )}
          </div>
          {images.length > 0 && (
            <div className={styles.imageThumbnails}>
              {images.map((url, index) => (
                <div 
                  key={index} 
                  className={index === activeImage ? styles.thumbActive : styles.thumbInactive}
                  onClick={() => setActiveImage(index)}
                  style={{ background: product.colorHex || '#e8ddd0' }}
                >
                  <img src={url} alt={`${product.name} view ${index + 1}`} className={styles.thumbImg} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <p className={styles.productCode}>{product.code}</p>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.brandName}>MRIGAANK TEX</p>
          
          <div className={styles.priceRow}>
            <span className={styles.price}>₹ {product.price.toLocaleString('en-IN')}.00</span>
            <span className={styles.taxLabel}>Inclusive of all taxes</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Category</span>
              <span className={styles.detailValue}>{product.category || 'Unstitched Suit'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Fabric</span>
              <span className={styles.detailValue}>{product.fabric || 'Premium Silk/Cotton'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Color</span>
              <span className={styles.detailValue}>{product.color || 'Artisanal Shade'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Availability</span>
              <span className={`${styles.detailValue} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                {product.stock > 0 ? 'In Stock' : 'Sold Out'}
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.actions}>
            <div className={styles.qtyPicker}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            
            <button 
              className={`${styles.addBtn} ${added ? styles.addBtnSuccess : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {added ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Added to Cart
                </span>
              ) : 'Add to Shopping Bag'}
            </button>

            <button 
              className={`${styles.wishlistBtn} ${isInWishlist(product.id) ? styles.wishlistBtnActive : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <div className={styles.description}>
            <h3>Product Description</h3>
            <p>
              {product.description || `This ${product.name} from the Mrigaank Tex collection represents the pinnacle of traditional craftsmanship. Featuring premium ${product.fabric || 'materials'} and an elegant ${product.color || 'finish'}, it is perfect for any special occasion.`}
            </p>
          </div>

          <div className={styles.trustBadges}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </span>
              100% Authentic
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              Free Shipping above ₹5000
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              Secure Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
