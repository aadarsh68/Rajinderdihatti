'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUI } from '../../context/UIContext';
import styles from '../page.module.css';

const CATEGORIES = ['All', 'Suit Fabric', 'Sherwani', 'Indo-Western', 'Kurta Pajama', 'Accessories'];

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useUI();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ code: '', name: '', category: 'Suit Fabric', fabric: '', color: '', bg: '#c9982a', imageUrl: '', description: '', price: '', costPrice: '', stock: '', reorderLevel: 5, sku: '', status: 'active' });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);

  const { data: prodData, isLoading: loading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetch('/api/admin/products').then(res => res.json())
  });

  const inventory = prodData?.products || [];

  const addMutation = useMutation({
    mutationFn: (product) => fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setShowAddModal(false);
      setNewProduct({ code: '', name: '', category: 'Suit Fabric', fabric: '', color: '', bg: '#c9982a', imageUrl: '', description: '', price: '', costPrice: '', stock: '', reorderLevel: 5, sku: '', status: 'active' });
      showToast('Product added successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      showToast('Product deleted');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (product) => fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setEditingId(null);
      showToast('Product updated');
    }
  });

  const toggleSaleMutation = useMutation({
    mutationFn: (p) => fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, status: p.status === 'sale' ? 'active' : 'sale' })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      showToast('Product sale status updated');
    }
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(20);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setNewProduct(prev => {
        const currentUrls = prev.imageUrl ? prev.imageUrl.split(',').filter(Boolean) : [];
        return { ...prev, imageUrl: [...currentUrls, data.url].join(',') };
      });
      setUploadProgress(100);
      showToast('Image uploaded successfully');
    } catch (err) {
      showAlert(err.message, 'Upload Failed', 'error');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewProduct(prev => {
      const currentUrls = prev.imageUrl ? prev.imageUrl.split(',').filter(Boolean) : [];
      return { ...prev, imageUrl: currentUrls.filter((_, idx) => idx !== indexToRemove).join(',') };
    });
  };

  const addProduct = () => {
    addMutation.mutate(newProduct);
  };

  const deleteProduct = (id) => {
    showConfirm('Are you sure you want to delete this product? This action cannot be undone.', () => {
      deleteMutation.mutate(id);
    }, 'Delete Product');
  };

  const saveEdit = () => {
    updateMutation.mutate(editValues);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditValues({ ...p });
  };

  const filtered = inventory.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className={styles.loadingState}><div className={styles.spinner}></div></div>;

  return (
    <div className={styles.inventoryContent}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          <span className={styles.toastIcon}>
            {toast.type === 'success' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
          </span>
          {toast.msg}
        </div>
      )}

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input placeholder="Search by name, code, or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filterBox}>
          {CATEGORIES.map(c => (
            <button key={c} className={`${styles.filterBtn} ${categoryFilter === c ? styles.filterBtnActive : ''}`} onClick={() => setCategoryFilter(c)}>{c}</button>
          ))}
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowAddModal(true)}>+ Add Product</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU / Code</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className={styles.tableRow}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productSwatch} style={{ background: p.bg }}>
                      {p.imageUrl && <img src={p.imageUrl.split(',')[0]} alt="" className={styles.swatchImg} />}
                    </div>
                    <div className={styles.productMeta}>
                      {editingId === p.id ? (
                        <input className={styles.inlineInput} value={editValues.name} onChange={e => setEditValues({...editValues, name: e.target.value})} />
                      ) : (
                        <span className={styles.productName}>{p.name}</span>
                      )}
                      <span className={styles.productFabric}>{p.fabric}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.codeCell}>{p.sku || 'N/A'}<br/><small>{p.code}</small></td>
                <td>{p.category}</td>
                <td className={styles.priceCell}>
                  {editingId === p.id ? (
                    <input className={styles.inlineInput} value={editValues.price} onChange={e => setEditValues({...editValues, price: e.target.value})} style={{ width: '80px' }} />
                  ) : (
                    `₹${p.price.toLocaleString('en-IN')}`
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <input className={styles.inlineInput} type="number" value={editValues.stock} onChange={e => setEditValues({...editValues, stock: parseInt(e.target.value)})} style={{ width: '60px' }} />
                  ) : (
                    <span className={`${styles.stockBadge} ${p.stock === 0 ? styles.stockOut : p.stock <= (p.reorderLevel || 5) ? styles.stockLow : styles.stockOk}`}>
                      {p.stock}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${p.status === 'active' ? styles.statusActive : styles.statusDraft}`}>
                    {p.status}
                  </span>
                </td>
                <td className={styles.actionCell}>
                  {editingId === p.id ? (
                    <>
                      <button className={styles.iconBtn} onClick={saveEdit} title="Save">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      </button>
                      <button className={styles.iconBtn} onClick={() => setEditingId(null)} title="Cancel">✕</button>
                    </>
                  ) : (
                    <>
                      <button className={`${styles.iconBtn} ${p.status === 'sale' ? styles.iconBtnActiveSale : ''}`} onClick={() => toggleSaleMutation.mutate(p)} title={p.status === 'sale' ? "Remove from Sale Section" : "Add to Sale Section"}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={p.status === 'sale' ? "#b03020" : "none"} stroke={p.status === 'sale' ? "#b03020" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      </button>
                      <button className={styles.iconBtn} onClick={() => startEdit(p)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                      </button>
                      <button className={styles.iconBtn} onClick={() => deleteProduct(p.id)} title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className={`${styles.modal} ${styles.modalLarge}`}>
            <div className={styles.modalHeader}>
              <h2>Add New Product</h2>
              <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalLayout}>
                {/* Left Column: Image Manager */}
                <div className={styles.modalLeftColumn}>
                  <span className={styles.imageUploadLabel}>Product Images</span>
                  <div className={styles.multiImageGrid}>
                    {/* Render existing images */}
                    {newProduct.imageUrl ? (
                      newProduct.imageUrl.split(',').filter(Boolean).map((url, idx) => (
                        <div key={idx} className={styles.imagePreviewCard}>
                          <img src={url} alt={`Upload ${idx + 1}`} />
                          <div className={styles.deleteImageOverlay} onClick={() => handleRemoveImage(idx)} title="Delete Image">
                            <span className={styles.deleteImageIcon}>✕</span>
                          </div>
                        </div>
                      ))
                    ) : null}

                    {/* Upload Card button if less than 6 images */}
                    {(newProduct.imageUrl ? newProduct.imageUrl.split(',').filter(Boolean).length : 0) < 6 && (
                      <div className={styles.uploadCard} onClick={() => document.getElementById('fileUpload').click()}>
                        <span className={styles.uploadCardIcon}>
                          {isUploading ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" style={{ fill: 'none' }} /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="2" style={{ fill: 'none' }} /></svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          )}
                        </span>
                        <span className={styles.uploadCardText}>{isUploading ? 'Uploading...' : 'Add Image'}</span>
                        {uploadProgress > 0 && <span className={styles.uploadCardProgress}>{uploadProgress}%</span>}
                      </div>
                    )}
                  </div>
                  <input type="file" id="fileUpload" className={styles.fileInput} accept="image/*" onChange={handleUpload} />
                  <span className={styles.uploadSubtext}>Upload up to 6 luxury catalog images. Hover on any card to delete.</span>
                </div>

                {/* Right Column: Premium Form Grid */}
                <div className={styles.modalRightColumn}>
                  <div className={styles.formField}>
                    <label>Code *</label>
                    <input placeholder="MT-101" value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value})} />
                  </div>
                  <div className={styles.formField}>
                    <label>Product Name *</label>
                    <input placeholder="Royal Silk Sherwani" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className={styles.formField}>
                    <label>Category</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label>Fabric</label>
                    <input placeholder="Silk, Cotton, etc." value={newProduct.fabric} onChange={e => setNewProduct({...newProduct, fabric: e.target.value})} />
                  </div>
                  <div className={styles.formField}>
                    <label>Price (₹) *</label>
                    <input type="number" placeholder="4999" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || ''})} />
                  </div>
                  <div className={styles.formField}>
                    <label>Stock *</label>
                    <input type="number" placeholder="10" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || ''})} />
                  </div>
                  <div className={`${styles.formField} ${styles.modalRightColumnFull}`}>
                    <label>Description</label>
                    <textarea className={styles.textarea} placeholder="Describe the product details..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows={3}></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={addProduct}>Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
