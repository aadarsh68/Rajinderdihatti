'use client';
import { useState, useEffect } from 'react';
import ProductListClient from '../components/ProductListClient';

export default function CollectionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <ProductListClient 
      products={products} 
      title="Our Collections" 
      subtitle="Curated styles for every occasion"
    />
  );
}
