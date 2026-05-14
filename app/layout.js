import { Cormorant_Garamond, Outfit, Montserrat } from 'next/font/google';
import './globals.css';
import Header from './components/header';
import GlobalProviders from './providers';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://mrigaanktex.com'),
  title: {
    default: 'Mrigaank Tex — Premium Ethnic Suits & Sarees',
    template: '%s | Mrigaank Tex'
  },
  description: 'Discover Mrigaank Tex. Curated collection of premium ethnic suits and sarees, showcasing Indian craftsmanship and elegance.',
  keywords: ['ethnic wear', 'premium suits', 'designer sarees', 'organza silk', 'Indian fashion', 'Mrigaank Tex'],
  authors: [{ name: 'Mrigaank Tex' }],
  creator: 'Mrigaank Tex',
  publisher: 'Mrigaank Tex',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Mrigaank Tex — Premium Ethnic Suits & Sarees',
    description: 'Curated collection of premium ethnic suits and sarees.',
    url: 'https://mrigaanktex.com',
    siteName: 'Mrigaank Tex',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mrigaank Tex Luxury Collection',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mrigaank Tex — Premium Ethnic Suits & Sarees',
    description: 'Curated collection of premium ethnic suits and sarees.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable} ${montserrat.variable}`}>
      <body>
        <GlobalProviders>
          <Header />
          {children}
        </GlobalProviders>
      </body>
    </html>
  );
}
