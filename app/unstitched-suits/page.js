'use client';
import { useState, useEffect } from 'react';
import ProductListClient from '../components/ProductListClient';

export default function UnstitchedSuitsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?category=unstitched')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <ProductListClient 
      products={products} 
      title="Unstitched Suits" 
      subtitle="Exquisite unstitched fabrics for your custom creations"
    />
  );
}
