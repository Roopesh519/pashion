import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthSessionProvider } from "@/context/AuthSessionProvider";
import { ToastProvider } from "@/components/ui/ToastContainer";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { siteConfig } from "@/config/site.config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: siteConfig.favicon, type: 'image/png' },
    ],
    shortcut: siteConfig.favicon,
    apple: siteConfig.favicon,
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
        <link rel="icon" href={siteConfig.favicon} type="image/png" />
        <link rel="apple-touch-icon" href={siteConfig.favicon} />
        <ThemeProvider />
      </head>
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthSessionProvider>
          <ToastProvider>
            <CartProvider>
              <Header />
              <main style={{ flex: 1, paddingTop: 'var(--header-height)' }}>
                {children}
              </main>
              <Footer />
            </CartProvider>
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
