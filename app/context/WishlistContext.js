'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from API or LocalStorage
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoaded(false);
      if (session?.user) {
        try {
          const local = localStorage.getItem('mrg_wishlist');
          const localItems = local ? JSON.parse(local) : [];
          
          const res = await fetch('/api/wishlist');
          const data = await res.json();
          
          if (localItems.length > 0) {
            const dbItems = data.items || [];
            const merged = [...dbItems];
            localItems.forEach(li => {
              if (!merged.find(di => di.id === li.id)) merged.push(li);
            });
            setWishlistItems(merged);
            localStorage.removeItem('mrg_wishlist');
          } else if (data.items) {
            setWishlistItems(data.items);
          }
        } catch (err) {
          console.error('Wishlist load error:', err);
        }
      } else {
        const local = localStorage.getItem('mrg_wishlist');
        if (local) setWishlistItems(JSON.parse(local));
      }
      setIsLoaded(true);
    };
    loadWishlist();
  }, [session]);

  // Sync wishlist to API or LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    if (session?.user) {
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: wishlistItems }),
      }).catch(err => console.error('Wishlist sync error:', err));
    } else {
      localStorage.setItem('mrg_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, session, isLoaded]);

  const toggleWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.filter(i => i.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((id) => {
    return wishlistItems.some(i => i.id === id);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
}
