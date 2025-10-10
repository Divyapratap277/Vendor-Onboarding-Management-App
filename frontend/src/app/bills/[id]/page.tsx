// src/app/bills/[id]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { configuredAxios as axios } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isAxiosError } from 'axios';

interface BillItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Bill {
  _id: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  notes: string;
  billStatus: string;
  paymentStatus: string;
  items: BillItem[];
  vendor?: { _id: string, businessName: string, contactEmail: string, address: unknown };
  billNumber?: string;
  purchaseOrder?: string;
  generatedBy?: { name: string; email: string };
  pdfFileName?: string;
}

const AdminBillPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      console.log('Fetching bill with ID:', id);
      try {
        const response = await axios.get(`/api/bills/${id}`);
        console.log('Raw bill data:', response.data);
        const fetchedBill: Bill = {
          ...response.data,
          issueDate: response.data.issueDate ? new Date(response.data.issueDate).toISOString().split('T')[0] : '',
          dueDate: response.data.dueDate ? new Date(response.data.dueDate).toISOString().split('T')[0] : '',
          billStatus: response.data.status,
          purchaseOrder: response.data.purchaseOrder ? response.data.purchaseOrder._id : null,
          generatedBy: response.data.generatedBy ? { name: response.data.generatedBy.name, email: response.data.generatedBy.email } : null,
          pdfFileName: response.data.pdfFileName,
        };
        console.log('Fetched bill data:', fetchedBill);
        setBill(fetchedBill);
        setLoading(false);
      } catch (error: unknown) {
        console.error('Error fetching bill:', error);
        const err = error as any;
        setError(err.response?.data?.message || 'Failed to fetch bill');
        setLoading(false);
      }
    };

    if (id) {
          fetchBill();
        }
      }, [id]);
    
      const handleDownloadPDF = () => {
        setDownloadError(null);
        if (!bill || !bill.pdfFileName) {
          console.error('PDF file name not available for this Bill.');
          setDownloadError('PDF not available for download.');
          return;
        }
    
        try {
          console.log('Downloading PDF with filename:', bill.pdfFileName);
          window.open(`${process.env.NEXT_PUBLIC_BACKEND_URI}/uploads/bills/${bill.pdfFileName}`, '_blank');
        } catch (error) {
          console.error('Error downloading Bill PDF:', error);
          setDownloadError('Failed to download Bill PDF. Please try again.');
        }
      };

  if (loading) {
    return <div className="flex justify-center items-center h-48"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!bill) {
    return <div>Bill not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-blue-400 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-semibold tracking-tight">Bill Details</CardTitle>
                {bill.billNumber && (
                  <p className="text-lg text-blue-100 mt-1">Bill #{bill.billNumber}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => router.back()} variant="outline" className="text-base bg-blue-500 border-blue-400 hover:bg-blue-600 text-white">
                  Back
                </Button>
                {bill.pdfFileName && (
                  <Button onClick={handleDownloadPDF} className="bg-blue-500 hover:bg-blue-600 text-white text-base">
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8 bg-white">
            {/* Bill Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
              <div className="p-5 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <label className="block text-xl font-semibold text-gray-800">Issue Date</label>
                <p className="mt-2 text-xl">{new Date(bill.issueDate).toLocaleDateString()}</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <label className="block text-xl font-semibold text-gray-800">Due Date</label>
                <p className="mt-2 text-xl">{new Date(bill.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <label className="block text-xl font-semibold text-gray-800">Total Amount</label>
                <p className="mt-2 text-xl font-mono">${bill.totalAmount.toFixed(2)}</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <label className="block text-xl font-semibold text-gray-800">Bill Status</label>
                <Badge 
                  className="mt-2 text-xl px-4 py-1"
                  variant={bill.billStatus === 'completed' ? 'success' : 'destructive'}
                >
                  {bill.billStatus}
                </Badge>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <label className="block text-xl font-semibold text-gray-800">Payment Status</label>
                <p className="mt-2 text-xl">{bill.paymentStatus.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</p>
              </div>
              {bill.generatedBy && (
                <div className="p-5 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                  <label className="block text-xl font-semibold text-gray-800">Generated By</label>
                  <p className="mt-2 text-xl">{bill.generatedBy.name} ({bill.generatedBy.email})</p>
                </div>
              )}
              {bill.notes && (
                <div className="col-span-full p-5 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                  <label className="block text-xl font-semibold text-gray-800">Notes</label>
                  <p className="mt-2 text-xl">{bill.notes}</p>
                </div>
              )}
            </div>

            {/* Items Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Items</h2>
              <div className="overflow-x-auto border-2 border-gray-200 rounded-xl">
                <Table className="min-w-full text-lg">
                  <TableHeader className="bg-gray-200">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-left text-xl font-semibold text-gray-800">Description</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xl font-semibold text-gray-800">Quantity</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xl font-semibold text-gray-800">Unit Price</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xl font-semibold text-gray-800">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.items.map((item, index) => (
                      <TableRow key={item._id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                        <TableCell className="px-6 py-5 text-xl">{item.description}</TableCell>
                        <TableCell className="px-6 py-5 text-xl text-center">{item.quantity}</TableCell>
                        <TableCell className="px-6 py-5 text-xl font-mono text-right">${item.unitPrice}</TableCell>
                        <TableCell className="px-6 py-5 text-xl font-mono text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {downloadError && (
              <p className="text-red-600 text-center text-xl font-semibold p-4 bg-red-100 rounded-lg">{downloadError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBillPage;
