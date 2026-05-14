'use client';
import { useState, useEffect } from 'react';
import HomeClient from './HomeClient';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return <HomeClient initialProducts={products} />;
}
