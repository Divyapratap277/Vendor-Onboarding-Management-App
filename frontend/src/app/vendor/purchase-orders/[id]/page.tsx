// frontend/src/app/vendor/purchase-orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { configuredAxios as axios } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import Link from 'next/link';
import { toast } from 'sonner';

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  vendor: {
    _id: string;
    businessName: string;
    contactEmail: string;
  };
  items: Item[];
  totalAmount: number;
  status: string;
  issueDate: string;
  deliveryDate: string;
  pdfPath?: string;
  pdfFileName?: string;
}

const VendorPurchaseOrderDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // All state for editing, submitting, and review have been removed as per the new rule.
  
  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/purchaseorders/${id}`);
      setPurchaseOrder(response.data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching purchase order:', err);
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to load purchase order.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/vendor/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPurchaseOrder();
    }
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!purchaseOrder?.pdfFileName) {
      toast.warning('PDF Not Available', {
        description: 'PO PDF not available for download.',
        className: 'text-lg p-4'
      });
      return;
    }
    const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/uploads/${purchaseOrder.pdfPath}`;
    window.open(pdfUrl, '_blank');
  };
  
  if (loading) {
    return <Spinner />;
  }

  if (error && !purchaseOrder) {
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  }

  if (!purchaseOrder) {
    return <p className="text-center mt-4">Purchase Order not found.</p>;
  }

  // The entire conditional rendering block for editing is removed.
  // The page now only renders the read-only display.
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6 shadow-lg border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h1 className="text-2xl font-bold">
            Purchase Order #{purchaseOrder.orderNumber}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-full border bg-primary px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-primary-foreground text-lg px-3 py-1">
              {purchaseOrder.status.replace(/_/g, ' ').toUpperCase()}
            </span>
            {purchaseOrder.pdfPath && (
              <Button onClick={handleDownloadPdf} variant="outline" className="text-base">
                View PO PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

          {/* This is the only view that will be rendered now */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
            <div>
              <p><span className="font-semibold">Vendor:</span> {purchaseOrder.vendor.businessName}</p>
              <p><span className="font-semibold">Issue Date:</span> {new Date(purchaseOrder.issueDate).toLocaleDateString()}</p>
              <p><span className="font-semibold">Delivery Date:</span> {new Date(purchaseOrder.deliveryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p><span className="font-semibold">Total Amount:</span> ${purchaseOrder.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mt-6 mb-4">Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrder.items.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="px-4 py-2 text-left text-base">{item.description}</td>
                    <td className="px-4 py-2 text-right text-base">{item.quantity}</td>
                    <td className="px-4 py-2 text-right text-base">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-base">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-between">
            <Button onClick={() => router.back()} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPurchaseOrderDetailPage;