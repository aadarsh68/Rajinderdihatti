'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from '../page.module.css';

export default function AdminDashboard() {
  const [showNotification, setShowNotification] = useState(true);

  const { data: prodData, isLoading: loadingProd } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetch('/api/admin/products').then(res => res.json())
  });

  const { data: ordData, isLoading: loadingOrd } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => fetch('/api/admin/orders').then(res => res.json())
  });

  const inventory = prodData?.products || [];
  const orders = ordData?.orders || [];
  const loading = loadingProd || loadingOrd;

  if (loading) return <div className={styles.loadingState}><div className={styles.spinner}></div></div>;

  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(p => p.stock > 0 && p.stock <= (p.reorderLevel || 5)).length,
    outOfStock: inventory.filter(p => p.stock === 0).length,
    totalOrders: orders.length,
    revenue: orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s, o) => s + o.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length
  };

  const alertCount = stats.lowStock + stats.outOfStock;

  const stockStatus = (stock, reorder) => {
    if (stock === 0) return 'out';
    if (stock <= (reorder || 5)) return 'low';
    return 'ok';
  };

  return (
    <>
      {showNotification && (
        <div className={styles.dashboardNotification}>
          <div>
            <strong>Dashboard Alert:</strong> {alertCount} stock alert{alertCount === 1 ? '' : 's'} and {stats.pendingOrders} pending order{stats.pendingOrders === 1 ? '' : 's'}.
          </div>
          <button className={styles.notificationClose} onClick={() => setShowNotification(false)} aria-label="Dismiss notification">
            ✕
          </button>
        </div>
      )}
      <div className={styles.dashGrid}>
        <div className={styles.dashCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon} style={{ background: 'rgba(201, 152, 42, 0.12)', color: '#c9982a' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3>Total Revenue</h3>
        </div>
        <div className={styles.cardValue}>₹{stats.revenue.toLocaleString('en-IN')}</div>
        <div className={styles.cardMeta}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>From {orders.filter(o => o.status === 'paid' || o.status === 'delivered').length} successful orders</span>
        </div>
      </div>

      <div className={styles.dashCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon} style={{ background: 'rgba(42, 122, 64, 0.12)', color: '#2a7a40' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3>Active Orders</h3>
        </div>
        <div className={styles.cardValue}>{stats.pendingOrders}</div>
        <div className={styles.cardMeta} style={{ color: '#2a7a40' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Awaiting processing</span>
        </div>
      </div>

      <div className={styles.dashCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon} style={{ background: 'rgba(176, 48, 32, 0.12)', color: '#b03020' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3>Inventory Alerts</h3>
        </div>
        <div className={styles.cardValue}>{stats.lowStock + stats.outOfStock}</div>
        <div className={styles.cardMeta} style={{ color: '#b03020' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          <span>{stats.outOfStock} items out of stock</span>
        </div>
      </div>

      <div className={styles.dashCard} style={{ gridColumn: 'span 2' }}>
        <div className={styles.cardHeader}>
          <h3>Stock Status Overview</h3>
        </div>
        <div className={styles.stockChart}>
          <div className={styles.chartLegend}>
            <div className={styles.chartItem}>
              <span className={styles.chartDot} style={{ background: '#2a7a40' }}></span>
              <span>Optimal: {inventory.length - stats.lowStock - stats.outOfStock}</span>
            </div>
            <div className={styles.chartItem}>
              <span className={styles.chartDot} style={{ background: '#c9982a' }}></span>
              <span>Low Stock: {stats.lowStock}</span>
            </div>
            <div className={styles.chartItem}>
              <span className={styles.chartDot} style={{ background: '#b03020' }}></span>
              <span>Out of Stock: {stats.outOfStock}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dashCard} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.cardHeader}>
          <h3>Critical Stock Alerts</h3>
        </div>
        <div className={styles.alertsList}>
          {inventory.filter(p => stockStatus(p.stock, p.reorderLevel) !== 'ok').length === 0 ? (
            <div className={styles.emptyState}>All items are well stocked</div>
          ) : (
            inventory.filter(p => stockStatus(p.stock, p.reorderLevel) !== 'ok').slice(0, 8).map(p => (
              <div key={p.id} className={styles.alertItem}>
                <div className={styles.alertSwatch} style={{ background: p.bg }}></div>
                <div className={styles.alertMeta}>
                  <span className={styles.alertName}>{p.name}</span>
                  <span className={styles.alertSku}>{p.sku} | {p.code}</span>
                </div>
                <span className={`${styles.alertBadge} ${p.stock === 0 ? styles.badgeOut : styles.badgeLow}`}>
                  {p.stock === 0 ? 'OUT' : `${p.stock} LEFT`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
