'use client';
import { useState, useEffect } from 'react';
import ProductListClient from '../components/ProductListClient';

export default function CollectionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasSearch = params.get('search');
    const url = hasSearch ? '/api/products' : '/api/products?category=collections';

    fetch(url)
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
