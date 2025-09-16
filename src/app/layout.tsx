import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Kova Systems",
  description: "Discover Kova Systems, the decentralized protocol for collecting and distributing sensory data from robots. Explore Proof of Sensory Contribution (PoSC) in an immersive 3D workshop environment.",
  keywords: "Kova Systems, robotics, blockchain, protocol, sensory data, PoSC, proof of sensory contribution, automation, AI datasets",
  authors: [{ name: "Kova Systems" }],
  openGraph: {
    title: "Kova Systems - Proof of Sensory Contribution",
    description: "Discover Kova Systems, the decentralized protocol for collecting and distributing sensory data from robots. Explore the future of robotic data economy.",
    url: "https://kovasystems.com",
    siteName: "Kova Systems",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Kova Systems - Proof of Sensory Contribution",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kova Systems - Proof of Sensory Contribution",
    description: "Discover Kova Systems, the decentralized protocol for collecting and distributing sensory data from robots.",
    images: ["/images/logo.png"],
    creator: "@KovaSystems",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: '/images/logo.jpg',
    shortcut: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full`}
      >
        {children}
      </body>
    </html>
  );
}
