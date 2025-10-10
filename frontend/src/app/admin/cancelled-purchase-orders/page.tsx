'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configuredAxios as axios } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  vendor: {
    businessName: string;
  };
  items: Item[];
  totalAmount: number;
  status: string;
  issueDate: string;
}

const CancelledPurchaseOrdersPage = () => {
  const router = useRouter();
  const [cancelledPurchaseOrders, setCancelledPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null); // To show loading on specific buttons

  useEffect(() => {
    const fetchCancelledPurchaseOrders = async () => {
      try {
        const response = await axios.get('/api/purchaseorders/cancelled');
        setCancelledPurchaseOrders(response.data);
      } catch (err: any) {
        console.error('Error fetching cancelled purchase orders:', err);
        setError(err.response?.data?.message || 'Failed to load cancelled purchase orders.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCancelledPurchaseOrders();
  }, [router]);

  const handleRestorePO = async (poId: string) => {
    // IMPORTANT: Replace window.confirm with a custom modal/dialog UI for production
    if (!window.confirm('Are you sure you want to restore this Purchase Order? It will be moved back to the active POs list with "pending" status.')) {
      return;
    }

    setProcessingId(poId);
    try {
      await axios.put(`/api/purchaseorders/${poId}/restore`);
      // Remove from the cancelled list after restoration
      setCancelledPurchaseOrders(prevPOs => prevPOs.filter(po => po._id !== poId));
      console.log(`Purchase Order ${poId} restored successfully.`);
      // Optionally, navigate back to the main PO list or show a success message
      // router.push('/admin/purchase-orders');
    } catch (err: any) {
      console.error('Error restoring purchase order:', err);
      setError(err.response?.data?.message || 'Failed to restore purchase order.');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePermanentDeletePO = async (poId: string) => {
    // IMPORTANT: Use a very strong, custom confirmation modal here in a real app
    if (!window.confirm('ARE YOU ABSOLUTELY SURE YOU WANT TO PERMANENTLY DELETE THIS PURCHASE ORDER? THIS ACTION CANNOT BE UNDONE.')) {
      return;
    }

    setProcessingId(poId);
    try {
      await axios.delete(`/api/purchaseorders/${poId}/permanent-delete`);
      // Remove from the cancelled list after permanent deletion
      setCancelledPurchaseOrders(prevPOs => prevPOs.filter(po => po._id !== poId));
      console.log(`Purchase Order ${poId} permanently deleted.`);
    } catch (err: any) {
      console.error('Error permanently deleting purchase order:', err);
      setError(err.response?.data?.message || 'Failed to permanently delete purchase order.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Cancelled/Draft Purchase Orders</CardTitle>
          <p className="text-gray-600">These are POs that have been cancelled and can be restored or permanently deleted.</p>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/admin/purchase-orders')} className="mb-4">Back to Active POs</Button>
          <div className="mt-4">
            {cancelledPurchaseOrders.length === 0 ? (
              <p className="text-gray-600">No cancelled purchase orders found.</p>
            ) : (
              cancelledPurchaseOrders.map((po) => (
                <div
                  key={po._id}
                  className="border p-4 my-2 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div className="flex-1 mb-4 md:mb-0">
                    <p>
                      <strong>Order Number:</strong> {po.orderNumber}
                    </p>
                    <p><strong>Vendor:</strong> {po.vendor.businessName}</p>
                    <p><strong>Total Amount:</strong> ${po.totalAmount.toFixed(2)}</p>
                    <p><strong>Status:</strong> {po.status}</p>
                    <p><strong>Issue Date:</strong> {new Date(po.issueDate).toLocaleDateString()}</p>
                    <table className="w-full mt-2 text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">Item/Service</th>
                          <th scope="col" className="px-6 py-3">Quantity</th>
                          <th scope="col" className="px-6 py-3">Unit Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {po.items.map((item, index) => (
                          <tr key={index} className="bg-white border-b">
                            <td className="px-6 py-4">{item.description}</td>
                            <td className="px-6 py-4">{item.quantity}</td>
                            L142: <td className="px-6 py-4">${item.unitPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col space-y-2 md:ml-4">
                    <Button
                      onClick={() => handleRestorePO(po._id)}
                      className="w-full"
                      disabled={processingId === po._id}
                    >
                      {processingId === po._id ? <Spinner className="h-4 w-4" /> : 'Restore PO'}
                    </Button>
                    <Button
                      onClick={() => handlePermanentDeletePO(po._id)}
                      variant="destructive"
                      className="w-full"
                      disabled={processingId === po._id}
                    >
                      {processingId === po._id ? <Spinner className="h-4 w-4" /> : 'Permanently Delete'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CancelledPurchaseOrdersPage;
