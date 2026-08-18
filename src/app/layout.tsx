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
  title: `${siteConfig.name} | Modern eCommerce`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
