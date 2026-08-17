import type { Metadata, Viewport } from 'next';
import { Cinzel, Cinzel_Decorative, Syne, Inter } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#060608',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'MORBIDIUM // The Sunken Sanctuary — A Grimdark 3D Experience',
  description:
    'An award-winning interactive 3D dark fantasy showcase inspired by Dark Souls, Diablo IV, and medieval grimdark architecture. Features real-time WebGL scrollytelling, procedural audio synthesis, and 3D relic inspection.',
  keywords: [
    'Gothic Dark Fantasy',
    'WebGL 3D Showcase',
    'Three.js',
    'React Three Fiber',
    'Dark Souls',
    'Diablo IV',
    'Awwwards',
    'Interactive Showcase',
  ],
  authors: [{ name: 'The Silent Clergy' }],
  openGraph: {
    title: 'MORBIDIUM // The Sunken Sanctuary',
    description: 'Award-winning Gothic Dark Fantasy interactive WebGL experience.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${syne.variable} ${inter.variable} dark`}
    >
      <body className="bg-[#060608] text-[#c5b396] font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
