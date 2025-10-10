'use client';

import AdminNavbar from '@/components/admin/AdminNavbar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && <AdminNavbar />}
      <main className="flex-grow bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {children}
      </main>
    </div>
  );
}
