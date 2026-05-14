'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext(null);

export const initialProducts = [];

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from API or LocalStorage
  useEffect(() => {
    const loadCart = async () => {
      setIsLoaded(false);
      if (session?.user) {
        try {
          const local = localStorage.getItem('mrg_cart');
          const localItems = local ? JSON.parse(local) : [];
          
          const res = await fetch('/api/cart');
          const data = await res.json();
          
          if (localItems.length > 0) {
            // Merge logic or prioritize local? Usually merge.
            // For now, let's just use local if DB is empty, or vice versa.
            // A simple merge:
            const dbItems = data.items || [];
            const merged = [...dbItems];
            localItems.forEach(li => {
              if (!merged.find(di => di.id === li.id)) merged.push(li);
            });
            setCartItems(merged);
            localStorage.removeItem('mrg_cart'); // Clear after merge
          } else if (data.items) {
            setCartItems(data.items);
          }
        } catch (err) {
          console.error('Cart load error:', err);
        }
      } else {
        const local = localStorage.getItem('mrg_cart');
        if (local) setCartItems(JSON.parse(local));
      }
      setIsLoaded(true);
    };
    loadCart();
  }, [session]);

  // Sync cart to API or LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    if (session?.user) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      }).catch(err => console.error('Cart sync error:', err));
    } else {
      localStorage.setItem('mrg_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, session, isLoaded]);

  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, size: 'M' }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCartItems(prev =>
      prev.map(i => i.id === id
        ? { ...i, qty: Math.max(1, i.qty + delta) }
        : i
      )
    );
  }, []);

  const updateSize = useCallback((id, size) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, size } : i));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const placeOrder = useCallback(() => {
    const id = 'MRG' + Date.now().toString().slice(-8).toUpperCase();
    setOrderId(id);
    setOrderPlaced(true);
    setCartItems([]);
  }, []);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 149;
  const total = subtotal + shipping;
  const itemCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQty, updateSize,
      clearCart, placeOrder, subtotal, shipping, total, itemCount,
      orderPlaced, orderId
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
