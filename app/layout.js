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
  metadataBase: new URL('https://rajinderdihatti.com'),
  title: {
    default: 'Rajinder Di Hatti — Premium Unstitched Suits',
    template: '%s | Rajinder Di Hatti'
  },
  description: 'Discover Rajinder Di Hatti. Curated collection of premium unstitched ethnic suits, showcasing Indian craftsmanship and elegance.',
  keywords: ['unstitched suits', 'premium suits', 'ethnic fabrics', 'party wear unstitched', 'Indian fashion', 'Rajinder Di Hatti'],
  authors: [{ name: 'Rajinder Di Hatti' }],
  creator: 'Rajinder Di Hatti',
  publisher: 'Rajinder Di Hatti',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Rajinder Di Hatti — Premium Unstitched Suits',
    description: 'Curated collection of premium unstitched ethnic suits.',
    url: 'https://rajinderdihatti.com',
    siteName: 'Rajinder Di Hatti',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rajinder Di Hatti Luxury Collection',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rajinder Di Hatti — Premium Unstitched Suits',
    description: 'Curated collection of premium unstitched ethnic suits.',
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
