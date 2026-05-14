'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { ProductSwatch } from '../components/ProductSwatch';
import styles from './page.module.css';

function GoldDivider() {
  return (
    <div className={styles.goldDivider}>
      <span className={styles.dividerLine} /><span className={styles.dividerDiamond}>◆</span><span className={styles.dividerLine} />
    </div>
  );
}

const Icons = {
  Standard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  Express: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  Card: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  ),
  Cash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <circle cx="12" cy="12" r="2"></circle>
      <path d="M6 12h.01M18 12h.01"></path>
    </svg>
  ),
  Email: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  )
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useUI();
  const { cartItems, subtotal, shipping, total, itemCount, clearCart } = useCart();
  const [delivery, setDelivery] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', apartment: '', city: '', state: '', pincode: '', landmark: '',
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const states = ['Andhra Pradesh','Delhi','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const req = { firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Phone', address: 'Address', city: 'City', state: 'State', pincode: 'Pincode' };
    const newErrors = {};
    Object.entries(req).forEach(([k, label]) => {
      if (!form[k]?.trim()) newErrors[k] = `${label} is required`;
    });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit phone';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRazorpay = async (currentOrderId) => {
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: currentOrderId })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create Razorpay order');
      }
      const { id: rzpOrderId, amount: rzpAmount } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: rzpAmount,
        currency: "INR",
        name: "Mrigaank Tex",
        description: "Ethnic Wear Purchase",
        order_id: rzpOrderId,
        handler: async (response) => {
          // Update order status in DB
          const patchRes = await fetch(`/api/orders/${currentOrderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'paid', 
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id
            }),
          });
          if (!patchRes.ok) throw new Error('Failed to confirm payment status');
          
          setOrderId(currentOrderId);
          setOrderPlaced(true);
          clearCart();
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#c9982a" },
        modal: {
          ondismiss: () => setIsSubmitting(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showAlert(err.message, 'Payment Error', 'error');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) { router.push('/login?callbackUrl=/checkout'); return; }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          shippingAddress: `${form.address}, ${form.apartment ? form.apartment + ', ' : ''}${form.city}, ${form.state} - ${form.pincode}`,
          paymentMethod, 
          delivery, // Send delivery type so backend can calculate shipping
          email: form.email,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      if (paymentMethod === 'razorpay') {
        if (!razorpayLoaded) throw new Error('Razorpay is still loading, please try again.');
        // handleRazorpay will now fetch the exact amount from the DB via data.order.id
        await handleRazorpay(data.order.id);
      } else {
        // COD path - status is already 'confirmed' from backend
        setOrderId(data.order.id);
        setOrderPlaced(true);
        clearCart();
        setIsSubmitting(false);
      }
    } catch (err) { 
      showAlert(err.message, 'Checkout Error', 'error'); 
      setIsSubmitting(false); 
    }
  };

  const deliveryOptions = [
    { id: 'standard', label: 'Standard Delivery', desc: '5–7 business days', price: subtotal > 5000 ? 'FREE' : '₹ 149', icon: <Icons.Standard /> },
    { id: 'express', label: 'Express Delivery', desc: '2–3 business days', price: '₹ 299', icon: <Icons.Express /> },
  ];

  if (orderPlaced) {
    return (
      <div className={styles.page}>
        <div className={styles.confirmedWrap}>
          <div className={styles.confirmedAnim}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#c9982a" strokeWidth="2" className={styles.circleAnim} />
              <polyline points="30,52 46,68 70,35" fill="none" stroke="#c9982a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.checkAnim} />
            </svg>
          </div>
          <h1 className={styles.confirmedTitle}>Order Placed!</h1>
          <p className={styles.confirmedDesc}>Thank you for choosing Mrigaank Tex. Your exquisite ethnic wear is now being prepared for its journey to you.</p>
          
          <div className={styles.orderIdBadge}>
            <span className={styles.orderIdLabel}>Official Order ID</span>
            <span className={styles.orderIdVal}>{orderId}</span>
          </div>

          <div className={styles.confirmedMeta}>
            {[
              { icon: <Icons.Standard />, label: 'Arrival Estimate', val: '5–7 Business Days' },
              { icon: <Icons.Email />, label: 'Digital Receipt', val: form.email || 'Sent to your inbox' },
              { icon: <Icons.Phone />, label: 'Priority Support', val: '+91 98765 43210' },
            ].map(m => (
              <div key={m.label} className={styles.confirmedMetaItem}>
                <span className={styles.confirmedMetaIcon}>{m.icon}</span>
                <div>
                  <span className={styles.confirmedMetaLabel}>{m.label}</span>
                  <span className={styles.confirmedMetaVal}>{m.val}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/" className={styles.btnPrimaryLarge}>
            Continue Shopping
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 10 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <span className={styles.breadSep}>✦</span>
          <Link href="/cart" className={styles.breadLink}>Cart</Link>
          <span className={styles.breadSep}>✦</span>
          <span>Checkout</span>
        </p>
        <h1 className={styles.pageTitle}>Checkout</h1>
        <GoldDivider />
      </div>

      <div className={styles.checkoutLayout}>
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>01</span> Contact Information</h2>
            <GoldDivider />
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label className={styles.label}>First Name *</label><input name="firstName" value={form.firstName} onChange={handleChange} className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`} placeholder="Priya" />{errors.firstName && <span className={styles.errorMsg}>{errors.firstName}</span>}</div>
              <div className={styles.formGroup}><label className={styles.label}>Last Name *</label><input name="lastName" value={form.lastName} onChange={handleChange} className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`} placeholder="Sharma" />{errors.lastName && <span className={styles.errorMsg}>{errors.lastName}</span>}</div>
              <div className={styles.formGroup}><label className={styles.label}>Email Address *</label><input name="email" type="email" value={form.email} onChange={handleChange} className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="priya@example.com" />{errors.email && <span className={styles.errorMsg}>{errors.email}</span>}</div>
              <div className={styles.formGroup}><label className={styles.label}>Phone Number *</label><div className={styles.phoneWrap}><span className={styles.phonePrefix}>+91</span><input name="phone" type="tel" value={form.phone} onChange={handleChange} className={`${styles.input} ${styles.inputPhone} ${errors.phone ? styles.inputError : ''}`} placeholder="9876543210" maxLength={10} /></div>{errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}</div>
            </div>
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>02</span> Shipping Address</h2>
            <GoldDivider />
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Address Line 1 *</label><input name="address" value={form.address} onChange={handleChange} className={`${styles.input} ${errors.address ? styles.inputError : ''}`} placeholder="House / Flat No., Street Name" />{errors.address && <span className={styles.errorMsg}>{errors.address}</span>}</div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Apartment / Locality (optional)</label><input name="apartment" value={form.apartment} onChange={handleChange} className={styles.input} placeholder="Apartment, sector, colony" /></div>
              <div className={styles.formGroup}><label className={styles.label}>City *</label><input name="city" value={form.city} onChange={handleChange} className={`${styles.input} ${errors.city ? styles.inputError : ''}`} placeholder="New Delhi" />{errors.city && <span className={styles.errorMsg}>{errors.city}</span>}</div>
              <div className={styles.formGroup}><label className={styles.label}>Pincode *</label><input name="pincode" type="text" value={form.pincode} onChange={handleChange} className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`} placeholder="110001" maxLength={6} />{errors.pincode && <span className={styles.errorMsg}>{errors.pincode}</span>}</div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>State *</label><select name="state" value={form.state} onChange={handleChange} className={`${styles.input} ${styles.select} ${errors.state ? styles.inputError : ''}`}><option value="">Select State</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>{errors.state && <span className={styles.errorMsg}>{errors.state}</span>}</div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Landmark (optional)</label><input name="landmark" value={form.landmark} onChange={handleChange} className={styles.input} placeholder="Near metro station, landmark" /></div>
            </div>
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>03</span> Delivery Method</h2>
            <GoldDivider />
            <div className={styles.deliveryOptions}>
              {deliveryOptions.map(opt => (
                <label key={opt.id} className={`${styles.deliveryOption} ${delivery === opt.id ? styles.deliverySelected : ''}`}>
                  <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className={styles.radioHidden} />
                  <span className={styles.deliveryIcon}>{opt.icon}</span>
                  <span className={styles.deliveryInfo}><span className={styles.deliveryLabel}>{opt.label}</span><span className={styles.deliveryDesc}>{opt.desc}</span></span>
                  <span className={`${styles.deliveryPrice} ${opt.price === 'FREE' ? styles.free : ''}`}>{opt.price}</span>
                  <span className={`${styles.radioIndicator} ${delivery === opt.id ? styles.radioChecked : ''}`} />
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>04</span> Payment Method</h2>
            <GoldDivider />
            <div className={styles.deliveryOptions}>
              {[
                { id: 'razorpay', label: 'Online Payment', desc: 'Pay securely via UPI, Card, or Net Banking', icon: <Icons.Card /> },
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay ₹ 50 extra as handling fee', icon: <Icons.Cash /> },
              ].map(opt => (
                <label key={opt.id} className={`${styles.deliveryOption} ${paymentMethod === opt.id ? styles.deliverySelected : ''}`}>
                  <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} className={styles.radioHidden} />
                  <span className={styles.deliveryIcon}>{opt.icon}</span>
                  <span className={styles.deliveryInfo}><span className={styles.deliveryLabel}>{opt.label}</span><span className={styles.deliveryDesc}>{opt.desc}</span></span>
                  <span className={`${styles.radioIndicator} ${paymentMethod === opt.id ? styles.radioChecked : ''}`} />
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} className={`${styles.btnPrimary} ${isSubmitting ? styles.btnDisabled : ''}`} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : (paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Place Order')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <aside className={styles.orderSummary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryCornerTL} /><div className={styles.summaryCornerTR} />
            <div className={styles.summaryCornerBL} /><div className={styles.summaryCornerBR} />
            <h2 className={styles.summaryTitle}>Your Order</h2>
            <GoldDivider />
            <div className={styles.summaryItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryThumb}>
                    <ProductSwatch color={item.color} bg={item.bg} size={44} />
                    <span className={styles.qtyBadge}>{item.qty}</span>
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <span className={styles.summaryItemName}>{item.name}</span>
                    <span className={styles.summaryItemSize}>Size: {item.size}</span>
                  </div>
                  <span className={styles.summaryItemPrice}>₹ {(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Subtotal ({itemCount} items)</span><span>₹ {subtotal.toLocaleString('en-IN')}</span></div>
              <div className={styles.summaryRow}>
                <span>Shipping ({delivery === 'express' ? 'Express' : 'Standard'})</span>
                <span className={(delivery === 'standard' && subtotal > 5000) ? styles.freeShipping : ''}>
                  { delivery === 'express' ? '₹ 299' : (subtotal > 5000 ? 'FREE' : '₹ 149') }
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className={styles.summaryRow}><span>COD Handling Fee</span><span>₹ 50</span></div>
              )}
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>₹ {(
                  subtotal + 
                  (delivery === 'express' ? 299 : (subtotal > 5000 ? 0 : 149)) + 
                  (paymentMethod === 'cod' ? 50 : 0)
                ).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
