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
  title: "KuboNet",
  description: "Discover KuboNet, the foundational blockchain protocol for robotics coordination. Explore the future of robotic interoperability in an immersive 3D workshop environment.",
  keywords: "KuboNet, robotics, blockchain, protocol, interoperability, robotics internet protocol, automation",
  authors: [{ name: "KuboNet" }],
  openGraph: {
    title: "KuboNet - Robotics Internet Protocol",
    description: "Discover KuboNet, the foundational blockchain protocol for robotics coordination. Explore the future of robotic interoperability.",
    url: "https://kubonet.com",
    siteName: "KuboNet",
    images: [
      {
        url: "/images/logo.jpg",
        width: 1200,
        height: 630,
        alt: "KuboNet - Robotics Internet Protocol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KuboNet - Robotics Internet Protocol",
    description: "Discover KuboNet, the foundational blockchain protocol for robotics coordination.",
    images: ["/images/logo.jpg"],
    creator: "@UseKuboNet",
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
