// src/app/bills/[id]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { configuredAxios as axios } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  vendor?: { _id: string, businessName: string, contactEmail: string, address: any };
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
      } catch (error: any) {
        console.error('Error fetching bill:', error);
        setError(error.response?.data?.message || 'Failed to fetch bill');
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
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 text-blue-500">
            <Spinner />
          </div>
          <p className="ml-2 text-lg">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-500 text-2xl font-semibold">Error</CardTitle>
            <CardDescription className="text-lg">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-500 text-2xl font-semibold">Not Found</CardTitle>
            <CardDescription className="text-lg">Bill not found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {error && <p className="text-red-500 mb-4 text-lg">{error}</p>}
      {downloadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-lg">{downloadError}</p>
        </div>
      )}

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Bill Details</CardTitle>
          <CardDescription className="text-lg">
            Complete bill information and itemized breakdown
          </CardDescription>
          {bill.billNumber && (
            <div className="mt-2">
              <Badge className="text-base px-3 py-1">
                Bill #{bill.billNumber}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* 2-Column Grid Layout for Bill Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Bill Information */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Bill Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Issue Date</label>
                    <p className="text-lg text-gray-900">{new Date(bill.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Due Date</label>
                    <p className="text-lg text-gray-900">{new Date(bill.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Total Amount</label>
                    <p className="text-2xl font-bold text-green-600">${bill.totalAmount.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Bill Status</label>
                    <Badge 
                      variant={bill.paymentStatus === 'paid' ? 'default' : 'destructive'} 
                      className="text-base px-4 py-2"
                    >
                      {bill.billStatus}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Payment Status</label>
                    <p className="text-lg">
                      <span className={`font-semibold px-3 py-1 rounded-full text-base ${
                        bill.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : bill.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {bill.paymentStatus?.charAt(0).toUpperCase() + bill.paymentStatus?.slice(1)}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Generated By Information */}
              {bill.generatedBy && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Generated By</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-lg"><strong>Name:</strong> {bill.generatedBy.name}</p>
                    <p className="text-lg"><strong>Email:</strong> {bill.generatedBy.email}</p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {bill.notes ? (
                    <div className="p-4 bg-gray-50 border rounded-md">
                      <p className="text-lg text-gray-700">{bill.notes}</p>
                    </div>
                  ) : (
                    <p className="text-lg text-gray-600">No notes provided</p>
                  )}
                </CardContent>
              </Card>

              {/* PDF Download */}
              
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Bill Items</CardTitle>
          <CardDescription className="text-lg">Detailed breakdown of all items in this bill</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-6 py-4 text-left text-lg font-semibold text-gray-700 border-b-2 border-gray-200">
                    Description
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-lg font-semibold text-gray-700 border-b-2 border-gray-200">
                    Quantity
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-lg font-semibold text-gray-700 border-b-2 border-gray-200">
                    Unit Price
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-lg font-semibold text-gray-700 border-b-2 border-gray-200">
                    Line Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items.map((item, index) => (
                  <TableRow key={item._id || index} className="hover:bg-gray-50 border-b border-gray-200">
                    <TableCell className="px-6 py-4 text-lg text-gray-900 border-r border-gray-200">
                      {item.description}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-lg text-gray-900 border-r border-gray-200 text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-xl font-mono text-right">${item.unitPrice}</TableCell>
                    <TableCell className="px-6 py-4 text-lg font-semibold text-gray-900">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-gray-100 border-t-2 border-gray-300">
                  <TableCell colSpan={3} className="px-6 py-4 text-xl font-bold text-gray-900 text-right border-r border-gray-200">
                    Total Amount:
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xl font-bold text-green-600">
                    ${bill.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="text-lg py-3 px-6"
            >
              ← Back to Bills
            </Button>
            
            <div className="flex gap-4">
              {bill.pdfFileName && (
                <Button 
                  onClick={handleDownloadPDF} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 px-6"
                >
                  📄 Download PDF
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBillPage;