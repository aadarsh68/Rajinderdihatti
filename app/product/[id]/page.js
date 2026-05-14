import { prisma } from '../../lib/prisma';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} at Mrigaank Tex. Premium ${product.category} with ${product.fabric} fabric.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.imageUrl || '/og-image.jpg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.imageUrl || '/og-image.jpg'],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl,
    description: product.description,
    sku: product.sku || product.code,
    brand: {
      '@type': 'Brand',
      name: 'Mrigaank Tex',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://mrigaanktex.com/product/${product.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
