'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import styles from './page.module.css';

function GoldDivider() {
  return (
    <div className={styles.goldDivider}>
      <span className={styles.dividerLine} /><span className={styles.dividerDiamond}>◆</span><span className={styles.dividerLine} />
    </div>
  );
}

// Hardcoded fallback removed

const TABS = ['Profile', 'Orders', 'Addresses', 'Wishlist'];

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Profile');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    email: '', phone: '',
  });
  const [editForm, setEditForm] = useState({ ...form });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'Orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Split name into first and last name
      const nameParts = user.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
      };

      setForm(userData);
      setEditForm(userData);
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleEdit = () => { setEditForm({ ...form }); setEditing(true); setSaved(false); };
  const handleCancel = () => { setEditing(false); setSaved(false); };
  const handleSave = () => {
    setForm({ ...editForm });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <span className={styles.breadSep}>✦</span>
          <span>My Account</span>
        </p>
        <h1 className={styles.pageTitle}>My Account</h1>
        <GoldDivider />
      </div>

      <div className={styles.profileLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.avatarCard}>
            <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
            <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />
            <div className={styles.avatar}>
              <span className={styles.avatarInitials}>{form.firstName[0]}{form.lastName[0]}</span>
            </div>
            <p className={styles.avatarName}>{form.firstName} {form.lastName}</p>
            <p className={styles.avatarEmail}>{form.email}</p>
            <div className={styles.memberBadge}>
              <span className={styles.memberIcon}>✦</span>
              <span>Member</span>
            </div>
          </div>

          <nav className={styles.sideNav}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.navItem} ${activeTab === tab ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>
                  {tab === 'Profile' && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {tab === 'Orders' && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  )}
                  {tab === 'Addresses' && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  )}
                  {tab === 'Wishlist' && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  )}
                </span>
                {tab}
              </button>
            ))}

            <div className={styles.navDivider} />
            
            {user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className={styles.adminBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                Admin Panel
              </Link>
            )}

            <button onClick={handleLogout} className={styles.logoutBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </nav>
        </aside>

        <main className={styles.mainContent}>
          {activeTab === 'Profile' && (
            <div className={styles.contentCard}>
              <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
              <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.sectionNum}>01</span> Personal Information
                </h2>
                {!editing && (
                  <button onClick={handleEdit} className={styles.editBtn}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
              <GoldDivider />

              {saved && (
                <div className={styles.savedBanner}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Profile updated successfully
                </div>
              )}

              {!editing ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>First Name</span>
                    <span className={styles.infoValue}>{form.firstName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Last Name</span>
                    <span className={styles.infoValue}>{form.lastName}</span>
                  </div>
                  <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                    <span className={styles.infoLabel}>Email Address</span>
                    <span className={styles.infoValue}>{form.email}</span>
                  </div>
                  <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                    <span className={styles.infoLabel}>Phone Number</span>
                    <span className={styles.infoValue}>+91 {form.phone}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.editGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>First Name</label>
                    <input value={editForm.firstName}
                      onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))}
                      className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name</label>
                    <input value={editForm.lastName}
                      onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                      className={styles.input} />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" value={editForm.email}
                      onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                      className={styles.input} />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.phoneWrap}>
                      <span className={styles.phonePrefix}>+91</span>
                      <input value={editForm.phone}
                        onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                        className={`${styles.input} ${styles.inputPhone}`} maxLength={10} />
                    </div>
                  </div>
                  <div className={`${styles.btnRow} ${styles.fullWidth}`}>
                    <button onClick={handleCancel} className={styles.btnSecondary}>Cancel</button>
                    <button onClick={handleSave} className={styles.btnPrimary}>Save Changes</button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.sectionNum}>02</span> Security
                </h2>
                <GoldDivider />
                <div className={styles.securityRow}>
                  <div>
                    <p className={styles.secLabel}>Password</p>
                    <p className={styles.secDesc}>Last changed 30 days ago</p>
                  </div>
                  <Link href="/forgot-password" className={styles.changeBtn}>Change Password</Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Orders' && (
            <div className={styles.contentCard}>
              <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
              <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />
              <h2 className={styles.cardTitle}>
                <span className={styles.sectionNum}>02</span> Order History
              </h2>
              <GoldDivider />
              <div className={styles.ordersList}>
                {ordersLoading ? (
                  <div className={styles.emptyState}>Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className={styles.emptyState}>No orders found.</div>
                ) : orders.map(order => (
                  <div key={order.id} className={styles.orderItem}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.orderDetails}>
                      <span className={styles.orderItems}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        {order.discount > 0 && ` (Coupon ${order.couponCode}: -₹${order.discount.toLocaleString('en-IN')})`}
                      </span>
                      <span className={styles.orderTotal}>₹ {order.total.toLocaleString('en-IN')}</span>
                      <span className={`${styles.orderStatus} ${styles[order.status.toLowerCase()]}`}>{order.status}</span>
                    </div>
                    <button className={styles.viewOrderBtn}>View Details →</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Addresses' && (
            <div className={styles.contentCard}>
              <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
              <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.sectionNum}>03</span> Saved Addresses
                </h2>
                <button className={styles.editBtn}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New
                </button>
              </div>
              <GoldDivider />
              <div className={styles.addressCard}>
                <div className={styles.addressBadge}>Default</div>
                <p className={styles.addressName}>Priya Sharma</p>
                <p className={styles.addressText}>Flat 4B, Sunflower Apartments, Sector 18</p>
                <p className={styles.addressText}>New Delhi — 110001, Delhi</p>
                <p className={styles.addressText}>+91 9876543210</p>
                <div className={styles.addressActions}>
                  <button className={styles.addressEditBtn}>Edit</button>
                  <button className={styles.addressDeleteBtn}>Remove</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Wishlist' && (
            <div className={styles.contentCard}>
              <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
              <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />
              <h2 className={styles.cardTitle}>
                <span className={styles.sectionNum}>04</span> My Wishlist
              </h2>
              <GoldDivider />
              
              {wishlistItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(201,152,42,0.4)" strokeWidth="1.2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <p className={styles.emptyTitle}>Your wishlist is empty</p>
                  <p className={styles.emptyDesc}>Save your favourite pieces to revisit them anytime.</p>
                  <Link href="/" className={styles.btnPrimary} style={{ width: 'auto', padding: '12px 28px' }}>
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className={styles.wishlistGrid}>
                  {wishlistItems.map(item => (
                    <div key={item.id} className={styles.wishlistCard}>
                      <div className={styles.wishlistImgWrap} style={{ background: item.bg || '#e8ddd0' }}>
                        <Link href={`/product/${item.id}`}>
                          <div className={styles.wishlistImgInner}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className={styles.wishlistImg} />
                            ) : (
                              <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" className={styles.wishlistFloral}>
                                <line x1="60" y1="120" x2="60" y2="50" stroke="#8aaa7a" strokeWidth="1.5"/>
                                {[0,60,120,180,240,300].map((angle,i)=>(
                                  <ellipse key={i} cx="60" cy="50" rx="7" ry="14" fill={['darkgrey','maroon','blue','teal'].includes(item.color?.toLowerCase()) ? '#e8b4c0' : '#d4808a'} opacity="0.8" transform={`rotate(${angle} 60 50)`}/>
                                ))}
                                <circle cx="60" cy="50" r="6" fill="#f5e6b0"/>
                              </svg>
                            )}
                          </div>
                        </Link>
                        <button 
                          className={styles.wishlistRemove} 
                          onClick={() => toggleWishlist(item)}
                          aria-label="Remove from wishlist"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      <div className={styles.wishlistInfo}>
                        <p className={styles.wishlistCode}>{item.code}</p>
                        <Link href={`/product/${item.id}`}>
                          <h3 className={styles.wishlistName}>{item.name}</h3>
                        </Link>
                        <p className={styles.wishlistPrice}>₹ {item.price?.toLocaleString('en-IN')}</p>
                        <button className={styles.wishlistAddBtn} onClick={() => addToCart(item)}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
