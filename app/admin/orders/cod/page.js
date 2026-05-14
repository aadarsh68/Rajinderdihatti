'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUI } from '../../../context/UIContext';
import styles from '../../page.module.css';

export default function AdminCodOrders() {
  const queryClient = useQueryClient();
  const { showAlert } = useUI();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingUrlInput, setTrackingUrlInput] = useState('');
  const [tempStatus, setTempStatus] = useState('');

  const { data: ordData, isLoading: loading } = useQuery({
    queryKey: ['admin-cod-orders'],
    queryFn: () => fetch('/api/admin/orders/cod').then(res => res.json())
  });

  const orders = ordData?.orders || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status, trackingUrl }) => fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingUrl }),
    }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['admin-cod-orders']);
      if (selectedOrder?.id === variables.id) {
        setSelectedOrder(prev => ({ ...prev, status: variables.status, trackingUrl: variables.trackingUrl || prev.trackingUrl }));
      }
    },
    onError: (err) => {
      showAlert(err.message, 'Update Failed', 'error');
    }
  });

  const updateOrderStatus = (id, status) => {
    updateMutation.mutate({ id, status, trackingUrl: status === 'shipped' ? trackingUrlInput : undefined });
  };

  const handlePrintPackingSlip = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) {
      showAlert('Popups are blocked! Please allow popups for this site.', 'Error', 'error');
      return;
    }
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px dashed #ddd;">
        <td style="padding: 10px 0; font-size: 13px;">
          <strong style="color: #1a1510;">${item.product.name}</strong><br/>
          <span style="font-size: 11px; color: #666;">
            Code: ${item.product.code || 'N/A'} ${item.product.sku ? '| SKU: ' + item.product.sku : ''}<br/>
            Color: ${item.product.color || 'As shown'} | Size: ${item.product.size || 'Unstitched Suit'}
          </span>
        </td>
        <td style="padding: 10px 0; text-align: center; font-size: 13px; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-size: 13px; font-weight: bold;">₹${item.price.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Packing Slip - ${order.id.slice(-8).toUpperCase()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&display=swap');
          body {
            font-family: 'Outfit', sans-serif;
            color: #1a1510;
            margin: 0;
            padding: 40px;
            background: #fff;
          }
          .container {
            max-width: 650px;
            margin: 0 auto;
            border: 2px solid #1a1510;
            padding: 30px;
            border-radius: 12px;
            box-sizing: border-box;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px double #1a1510;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          .brand-logo {
            height: 70px;
            width: auto;
            object-fit: contain;
          }
          .brand-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 3px;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            color: #1a1510;
          }
          .brand-sub {
            font-size: 11px;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: #8b6914;
            font-weight: 600;
            margin: 0;
          }
          .slip-title {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            background: #1a1510;
            color: #fff;
            padding: 8px 14px;
            border-radius: 4px;
            text-align: center;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
            font-size: 12px;
            border-bottom: 1px solid #1a1510;
            padding-bottom: 15px;
          }
          .address-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }
          .address-box {
            background: #fdfaf5;
            border: 1px solid #e8ddd0;
            padding: 18px;
            border-radius: 8px;
          }
          .address-title {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #8b6914;
            text-transform: uppercase;
            margin: 0 0 8px 0;
          }
          .address-text {
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .items-table th {
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8b6914;
            border-bottom: 1px solid #1a1510;
            padding-bottom: 8px;
          }
          .totals-box {
            text-align: right;
            border-top: 1px solid #1a1510;
            padding-top: 15px;
            font-size: 13px;
          }
          .total-row {
            font-size: 18px;
            font-weight: 800;
            margin-top: 8px;
          }
          .footer-note {
            text-align: center;
            font-size: 11px;
            color: #777;
            margin-top: 35px;
            border-top: 1px dashed #ccc;
            padding-top: 15px;
            line-height: 1.5;
          }
          @media print {
            body { padding: 0; }
            .container { border: 2px solid #000; box-shadow: none; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <img src="${window.location.origin}/logo.png" class="brand-logo" alt="Logo" />
              <div>
                <h1 class="brand-title">Rajinder Di Hatti</h1>
                <p class="brand-sub">Luxury Ethnic Wardrobe</p>
              </div>
            </div>
            <div class="slip-title">Shipping Label<br/>& Packing Slip</div>
          </div>
          
          <div class="meta-grid">
            <div>
              <strong>Order Number:</strong><br/>
              <span style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">#${order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div style="text-align: right;">
              <strong>Date:</strong> ${orderDate}<br/>
              <strong>Payment Method:</strong> <span style="text-transform: uppercase; font-weight: bold;">CASH ON DELIVERY</span>
            </div>
          </div>
          
          <div class="address-grid">
            <div class="address-box">
              <h3 class="address-title">Sold By / Return Address:</h3>
              <p class="address-text">
                <strong>Rajinder Di Hatti</strong><br/>
                439/ground floor, Manohar market, chandni chowk, katra neel, delhi - 110006
              </p>
            </div>
            <div class="address-box">
              <h3 class="address-title">Deliver To:</h3>
              <p class="address-text">
                <strong>${order.user?.name || 'Guest Customer'}</strong><br/>
                ${order.shippingAddress || 'N/A'}<br/>
                <strong>Phone:</strong> ${order.phone || 'N/A'}
              </p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals-box">
            <div>Subtotal: ₹${(order.total - (order.shippingPrice || 0) - (order.handlingFee || 0)).toLocaleString('en-IN')}</div>
            ${order.shippingPrice > 0 ? `<div>Shipping: ₹${order.shippingPrice.toLocaleString('en-IN')}</div>` : ''}
            ${order.handlingFee > 0 ? `<div>Handling Fee: ₹${order.handlingFee.toLocaleString('en-IN')}</div>` : ''}
            <div class="total-row">Total Collect at Door: ₹${order.total.toLocaleString('en-IN')}</div>
          </div>
          
          <div class="footer-note">
            Thank you for shopping at Rajinder Di Hatti!<br/>
            For support, please contact: adarshsahni8@gmail.com
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filtered = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.includes(search)
  );

  if (loading) return <div className={styles.loadingState}><div className={styles.spinner}></div></div>;

  return (
    <div className={styles.inventoryContent}>
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input placeholder="Search COD orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className={styles.tableRow}>
                <td className={styles.codeCell}>#{o.id.slice(-8).toUpperCase()}</td>
                <td>
                  <div className={styles.nameCell}>{o.user?.name || 'Guest'}</div>
                  <div className={styles.alertSku}>{o.email || o.user?.email}</div>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ fontWeight: 700 }}>₹{o.total.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles['status' + o.status.charAt(0).toUpperCase() + o.status.slice(1)]}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <button className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => { 
                    setSelectedOrder(o); 
                    setTrackingUrlInput(o.trackingUrl || '');
                    setTempStatus(o.status);
                  }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} style={{ maxWidth: '800px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>COD Order Details #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
              <button className={styles.modalClose} onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', textTransform: 'uppercase', marginBottom: '15px', color: '#8b6914' }}>Customer Info</h3>
                  <div style={{ background: '#fafafa', padding: '15px', borderRadius: '8px' }}>
                    <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.email || selectedOrder.user?.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                    <p style={{ marginTop: '10px' }}><strong>Shipping Address:</strong><br/>{selectedOrder.shippingAddress}</p>
                  </div>
                  
                  <h3 style={{ fontSize: '14px', textTransform: 'uppercase', margin: '20px 0 15px', color: '#8b6914' }}>Payment Info (COD)</h3>
                  <div style={{ background: '#fafafa', padding: '15px', borderRadius: '8px' }}>
                    <p><strong>Method:</strong> CASH ON DELIVERY</p>
                    <p><strong>Handling Fee:</strong> ₹50 (Included in Total)</p>
                    <p><strong>Order Status:</strong> <span className={`${styles.statusBadge} ${styles['status' + selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)]}`}>{selectedOrder.status}</span></p>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '14px', textTransform: 'uppercase', marginBottom: '15px', color: '#8b6914' }}>Items</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                    {selectedOrder.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '4px', background: item.product.colorHex || item.product.bg, flexShrink: 0 }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.product.name}</div>
                          <div style={{ fontSize: '11px', color: '#8b6914' }}>SKU: {item.product.sku}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>₹{item.price.toLocaleString('en-IN')} × {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ background: '#1a1510', color: '#e8c870', padding: '20px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span>Subtotal</span><span>₹{(selectedOrder.total - (selectedOrder.shippingPrice || 0) - (selectedOrder.handlingFee || 0)).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span>Shipping</span><span>₹{(selectedOrder.shippingPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span>Handling Fee</span><span>₹{(selectedOrder.handlingFee || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(232, 200, 112, 0.2)', fontSize: '18px', fontWeight: 800 }}>
                      <span>Collect at Door</span><span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>UPDATE STATUS:</label>
                <select 
                  value={tempStatus} 
                  onChange={(e) => setTempStatus(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {tempStatus === 'shipped' && (
                  <input 
                    placeholder="Tracking URL"
                    value={trackingUrlInput}
                    onChange={(e) => setTrackingUrlInput(e.target.value)}
                    className={styles.inlineInput}
                  />
                )}
                <button 
                  className={styles.btnPrimary} 
                  onClick={() => updateOrderStatus(selectedOrder.id, tempStatus)}
                >
                  Save
                </button>
              </div>
              <button 
                className={styles.btnPrimary} 
                style={{ 
                  padding: '10px 18px', 
                  fontSize: '12px', 
                  background: 'linear-gradient(135deg, #8b6914, #b58d22)', 
                  borderColor: '#8b6914', 
                  color: '#fff', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }} 
                onClick={() => handlePrintPackingSlip(selectedOrder)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Slip / PDF
              </button>
              <button className={styles.btnSecondary} style={{ marginLeft: '10px' }} onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
