'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X, Home, UserPlus, Users, ShoppingCart, FileText, LogOut, Building2 } from 'lucide-react';
import { configuredAxios as configuredAxiosInstance } from '@/lib/auth';

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await configuredAxiosInstance.post('/api/auth/logout');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/admin/login');
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Initiate Onboarding', href: '/admin/onboarding/initiate', icon: UserPlus },
    { name: 'View Vendors', href: '/admin/vendors', icon: Users },
    { name: 'Create PO', href: '/admin/purchase-orders/create', icon: ShoppingCart },
    { name: 'View PO', href: '/admin/purchase-orders', icon: ShoppingCart },
    { name: 'View Bills', href: '/admin/bills', icon: FileText },
  ];

  return (
    <nav className="bg-white border-b-2 border-slate-300 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {/* Logo Section */}
          <Link 
            href="/admin/dashboard" 
            className="flex items-center space-x-3 text-slate-900 hover:text-slate-700 transition-colors duration-200"
          >
            <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
              <Building2 className="h-7 w-7 text-blue-700" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3 flex-1 justify-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-md' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 ml-6">
            <Button
              onClick={handleLogout}
              className="hidden lg:flex bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg items-center space-x-2 border-0"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-lg border-2 border-slate-300 shadow-md"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-lg font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-md' 
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-md flex items-center justify-center space-x-2 border-0"
              >
                <LogOut className="h-6 w-6" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;