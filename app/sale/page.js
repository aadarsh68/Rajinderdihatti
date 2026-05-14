'use client';
import { useState, useEffect } from 'react';
import ProductListClient from '../components/ProductListClient';

export default function SalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?category=sale')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <ProductListClient 
      products={products} 
      title="Sale!" 
      subtitle="Exclusive offers on luxury ethnic wear"
    />
  );
}
