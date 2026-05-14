export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/success/'],
    },
    sitemap: 'https://mrigaanktex.com/sitemap.xml',
  }
}
