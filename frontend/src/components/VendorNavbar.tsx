import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface VendorNavbarProps {
  router: any; // Using 'any' for simplicity, but you can define a more specific type for the router
}

const VendorNavbar: React.FC<VendorNavbarProps> = ({ router }) => {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to the vendor login page after successful logout
        router.push('/vendor/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="bg-blue-700 p-4 shadow-md">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <div
          className="text-3xl font-extrabold text-white cursor-pointer hover:text-blue-200 transition-colors duration-200"
          onClick={() => router.push('/vendor/dashboard')}
        >
          Vendor Dashboard
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => router.push('/vendor/bills')} 
            className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3"
          >
            View Bills
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="destructive"
            className="text-lg px-6 py-3"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default VendorNavbar;