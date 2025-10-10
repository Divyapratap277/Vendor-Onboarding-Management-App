'use client';

import { useState, useEffect } from 'react';

interface Vendor {
  _id: string;
  businessName: string;
  contactPerson: string;
  contactEmail: string;
  // Add other properties as needed based on your Vendor model
}

const AdminPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch vendors from the API
    const token = "6a7b99aebdf7c23e140c5cbf1f32f50d63f247c64fff5b1782798daaca8a05b2";
    fetch('/api/vendors', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVendors(data.vendors);
        } else {
          // Handle error if needed
        }
        setLoading(false);
      })
      .catch(() => {
        // Handle error if needed
        setLoading(false);
      });
  }, []);

  const handleInitiateOnboarding = (vendorId: string) => {
    fetch(`/api/vendors/${vendorId}/initiate-onboarding`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          // Handle successful response, e.g., show a success message
          alert(`Onboarding initiated. Token: ${data.token}`);
        } else {
          // Handle error
          alert(`Error: ${data.message}`);
        }
      })
      .catch(() => {
        alert('Failed to initiate onboarding.');
      });
  };

  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel - Vendors</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Business Name</th>
            <th className="py-2">Contact Person</th>
            <th className="py-2">Email</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor._id}>
              <td className="border px-4 py-2">{vendor.businessName}</td>
              <td className="border px-4 py-2">{vendor.contactPerson}</td>
              <td className="border px-4 py-2">{vendor.contactEmail}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleInitiateOnboarding(vendor._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Initiate Onboarding
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
