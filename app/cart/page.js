'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { ProductSwatch } from '../components/ProductSwatch';
import styles from './page.module.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function GoldDivider() {
  return (
    <div className={styles.goldDivider}>
      <span className={styles.dividerLine} />
      <span className={styles.dividerDiamond}>◆</span>
      <span className={styles.dividerLine} />
    </div>
  );
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, updateSize, subtotal, shipping, total, itemCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c9982a" strokeWidth="1.2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptyDesc}>Discover our exquisite collection of ethnic suits</p>
          <Link href="/" className={styles.btnPrimary}>Explore Collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Page Title */}
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <span className={styles.breadSep}>✦</span>
          <span>Cart</span>
        </p>
        <h1 className={styles.pageTitle}>Shopping Cart</h1>
        <p className={styles.itemCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        <GoldDivider />
      </div>

      <div className={styles.cartLayout}>
        {/* Items */}
        <section className={styles.cartItems}>
          {cartItems.map((item, idx) => (
            <div key={item.id} className={styles.cartItem}
              style={{ animationDelay: `${idx * 0.08}s` }}>
              {/* Swatch */}
              <div className={styles.itemSwatch}>
                <div className={styles.swatchFrame}>
                  <ProductSwatch color={item.color} bg={item.bg} size={90} />
                </div>
              </div>

              {/* Details */}
              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <div>
                    <span className={styles.itemCode}>{item.code}</span>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemBrand}>MRIGAANK TEX</p>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>

                <div className={styles.itemControls}>
                  {/* Size */}
                  <div className={styles.sizeWrap}>
                    <span className={styles.controlLabel}>Size</span>
                    <div className={styles.sizeGrid}>
                      {SIZES.map(s => (
                        <button key={s}
                          className={`${styles.sizeBtn} ${item.size === s ? styles.sizeBtnActive : ''}`}
                          onClick={() => updateSize(item.id, s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Qty + Price */}
                  <div className={styles.qtyPriceRow}>
                    <div className={styles.qtyWrap}>
                      <span className={styles.controlLabel}>Qty</span>
                      <div className={styles.qtyControl}>
                        <button className={styles.qtyBtn} onClick={() => updateQty(item.id, -1)}
                          disabled={item.qty <= 1}>−</button>
                        <span className={styles.qtyNum}>{item.qty}</span>
                        <button className={styles.qtyBtn} onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <div className={styles.priceWrap}>
                      <span className={styles.unitPrice}>₹ {item.price.toLocaleString('en-IN')} × {item.qty}</span>
                      <span className={styles.lineTotal}>₹ {(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className={styles.continueRow}>
            <Link href="/" className={styles.btnGhost}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </section>

        {/* Order Summary */}
        <aside className={styles.orderSummary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryCornerTL} />
            <div className={styles.summaryCornerTR} />
            <div className={styles.summaryCornerBL} />
            <div className={styles.summaryCornerBR} />

            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <GoldDivider />

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({itemCount} items)</span>
                <span>₹ {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shipping === 0 ? styles.freeShipping : ''}>
                  {shipping === 0 ? 'FREE' : `₹ ${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className={styles.shippingNote}>
                  Add ₹ {(5000 - subtotal).toLocaleString('en-IN')} more for free shipping
                </p>
              )}
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>₹ {total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className={styles.promoWrap}>
              <input type="text" placeholder="Promo code" className={styles.promoInput} />
              <button className={styles.promoBtn}>Apply</button>
            </div>

            <Link href="/checkout" className={styles.btnPrimary} style={{ display: 'block', textAlign: 'center' }}>
              Proceed to Checkout
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ marginLeft: 8 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <div className={styles.trustBadges}>
              {['🔒 Secure Payment', '↩ Easy Returns', '🚚 Fast Delivery'].map(b => (
                <span key={b} className={styles.badge}>{b}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
