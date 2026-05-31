'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductListClient from '../components/ProductListClient';

function CollectionsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const bestseller = searchParams.get('bestseller');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = '/api/products';
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (bestseller === 'true') params.push(`bestseller=true`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [category, bestseller]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', background: '#fdfaf5' }}>
        <span style={{ fontFamily: 'var(--font-outfit)', color: '#8b6914', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '14px', fontWeight: '500' }}>
          Loading products...
        </span>
      </div>
    );
  }

  return (
    <ProductListClient 
      products={products} 
      title={bestseller === 'true' ? "Best Sellers" : (category || "Our Collections")} 
      subtitle={bestseller === 'true' ? "Fast-selling favorites — running extremely low on stock!" : (category ? `Explore our premium selection of ${category}` : "Curated styles for every occasion")}
    />
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', background: '#fdfaf5' }}>
        <span style={{ fontFamily: 'var(--font-outfit)', color: '#8b6914', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '14px', fontWeight: '500' }}>
          Loading Collections...
        </span>
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
