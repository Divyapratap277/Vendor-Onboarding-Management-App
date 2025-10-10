"use client";

import React from 'react';
import VendorNavbar from "@/components/VendorNavbar";
import { useRouter, usePathname } from 'next/navigation';
import '../globals.css';
import { Toaster } from 'sonner';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const router = useRouter();

  const pathname = usePathname();
  const showNavbar = pathname !== '/vendor/login';

  return (
    <div>
      {showNavbar && <VendorNavbar router={router} />}
      <main>{children}</main>
    </div>
  );
};

export default VendorLayout;