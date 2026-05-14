'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import styles from './UIContext.module.css';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null });

  const showAlert = useCallback((message, title = 'Notification', type = 'info') => {
    setModal({ show: true, title, message, type, onConfirm: null });
  }, []);

  const showConfirm = useCallback((message, onConfirm, title = 'Confirm Action') => {
    setModal({ show: true, title, message, type: 'confirm', onConfirm });
  }, []);

  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, show: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modal.onConfirm) modal.onConfirm();
    hideModal();
  }, [modal, hideModal]);

  return (
    <UIContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal.show && (
        <div className={styles.overlay} onClick={hideModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={`${styles.header} ${styles[modal.type]}`}>
              <h3>{modal.title}</h3>
              <button className={styles.close} onClick={hideModal}>✕</button>
            </div>
            <div className={styles.body}>
              <p>{modal.message}</p>
            </div>
            <div className={styles.footer}>
              {modal.type === 'confirm' ? (
                <>
                  <button className={styles.btnSecondary} onClick={hideModal}>Cancel</button>
                  <button className={styles.btnPrimary} onClick={handleConfirm}>Confirm</button>
                </>
              ) : (
                <button className={styles.btnPrimary} onClick={hideModal}>Okay</button>
              )}
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
