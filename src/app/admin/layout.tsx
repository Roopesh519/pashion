import React from 'react';
import './admin.css';
import Sidebar from '@/components/admin/Sidebar';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authConfig';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin - Pashion',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Double-check on the server that the user is an admin. Middleware already
  // protects admin routes, but an explicit server-side guard here provides
  // defense-in-depth and prevents the layout from rendering for non-admins.
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (!session) {
    // Not authenticated - redirect to login
    redirect('/login?callbackUrl=/admin&error=SessionRequired');
  }
  
  if (user?.role !== 'admin') {
    // Authenticated but not admin - redirect to unauthorized page
    redirect('/unauthorized');
  }

  return (
    <div className="admin-wrapper">
      <Sidebar />
      <main className="admin-content">
        <section className="admin-main">{children}</section>
      </main>
    </div>
  );
}
