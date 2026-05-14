'use client';
import { useState, useEffect } from 'react';
import styles from '../page.module.css';

export default function AdminAlerts() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => setInventory(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  const stockStatus = (stock, reorder) => {
    if (stock === 0) return 'out';
    if (stock <= (reorder || 5)) return 'low';
    return 'ok';
  };

  const alerts = inventory.filter(p => stockStatus(p.stock, p.reorderLevel) !== 'ok');

  if (loading) return <div className={styles.loadingState}><div className={styles.spinner}></div></div>;

  return (
    <div className={styles.alertsGrid}>
      {alerts.length === 0 ? (
        <div className={styles.emptyState} style={{ gridColumn: '1 / -1', padding: '100px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2>All items are well stocked</h2>
          <p>No critical stock alerts at this moment.</p>
        </div>
      ) : (
        alerts.map(p => (
          <div key={p.id} className={`${styles.alertCardItem} ${p.stock === 0 ? styles.alertCardCritical : styles.alertCardWarning}`}>
            <div className={styles.alertCardTop} style={{ background: p.colorHex || p.bg || '#f5eee6' }}>
              {p.imageUrl && (
                <img src={p.imageUrl.split(',')[0]} alt={p.name} className={styles.alertImg} />
              )}
            </div>
            <div className={styles.alertCardBody}>
              <div className={styles.alertCardCode}>{p.code}</div>
              <div className={styles.alertCardTitle}>{p.name}</div>
              <div className={styles.alertCardStats}>
                <div>Stock: <strong style={{ color: p.stock === 0 ? '#b03020' : '#c9982a' }}>{p.stock}</strong></div>
                <div>Price: <strong>₹{p.price.toLocaleString('en-IN')}</strong></div>
              </div>
              <div style={{ marginTop: '15px', fontSize: '11px', color: '#666' }}>
                Reorder Level: {p.reorderLevel || 5}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
