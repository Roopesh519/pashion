import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { SocketProvider } from "@/context/SocketProvider";
import { AuthSessionProvider } from "@/context/AuthSessionProvider";
import { ToastProvider } from "@/components/ui/ToastContainer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pashion | Modern eCommerce",
  description: "Style that defines you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthSessionProvider>
          <SocketProvider>
            <CartProvider>
              <Header />
              <main style={{ flex: 1, paddingTop: 'var(--header-height)' }}>
                {children}
              </main>
              <Footer />
            </CartProvider>
          </SocketProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
