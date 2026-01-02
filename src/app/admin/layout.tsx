import React from 'react';
import './admin.css';
import Sidebar from '@/components/admin/Sidebar';

export const metadata = {
  title: 'Admin - Pashion',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="admin-wrapper">
          <Sidebar />

          <main className="admin-content">
            {/* <header className="admin-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin</h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 14, color: '#475569' }}>Signed in as Admin</div>
                </div>
              </div>
            </header> */}
            <section className="admin-main">{children}</section>
          </main>
        </div>
      </body>
    </html>
  );
}

