// frontend/src/app/admin/purchase-orders/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { configuredAxios as axios } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { toast } from 'sonner'; // Import toast for notifications
import { Table } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'; // Import Dialog components


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
  billId?: string; // Add this to track if a bill has been generated for this PO
}

const AdminPurchaseOrderDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // For admin save operation
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For general page messages
  const [isProcessingApproval, setIsProcessingApproval] = useState(false); // For admin approve/reject vendor changes

  // State for admin editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState<Item[]>([]);
  const [editableDeliveryDate, setEditableDeliveryDate] = useState('');
  const [editableStatus, setEditableStatus] = useState('');

  // NEW: State for rejection dialog
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false); // For spinner in reject modal

  const fetchPurchaseOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/purchaseorders/${id}`);
      const poData: PurchaseOrder = response.data;
      setPurchaseOrder(poData);
      setEditableItems(poData.items);
      setEditableDeliveryDate(new Date(poData.deliveryDate).toISOString().split('T')[0]);
      setEditableStatus(poData.status);
      setError(null); // Clear any previous errors on successful fetch
      setSuccessMessage(null); // Clear previous success messages
    } catch (err: unknown) {
      console.error('Error fetching purchase order:', err);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load purchase order.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchPurchaseOrder();
    }
  }, [id, fetchPurchaseOrder]);

  const calculateTotalAmount = (items: Item[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleDownloadPOPDF = () => {
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

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...editableItems];
    let parsedValue: number = Number(value); // Ensure it's treated as a number initially

    if (field === 'quantity') {
      parsedValue = parseFloat(value.toString()) || 0;
      parsedValue = Math.max(1, parsedValue); // Enforce minimum 1 for quantity
      newItems[index][field] = parsedValue;
    } else if (field === 'unitPrice') {
      parsedValue = parseInt(value.toString()) || 0;
      parsedValue = Math.max(0, parsedValue); // Enforce minimum 0 for unitPrice
      newItems[index][field] = parsedValue;
    } else {
      newItems[index][field] = value as string; // For description, keep as string
    }
    setEditableItems(newItems);
  };

  const handleAddItem = () => {
    setEditableItems([...editableItems, { description: '', quantity: 1, unitPrice: 0 }]); // Default new items
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editableItems.filter((_: Item, i: number) => i !== index);
    setEditableItems(newItems);
  };

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseOrder) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const updatedTotalAmount = calculateTotalAmount(editableItems);

    // Basic client-side validation for items to prevent empty/zero submission
    const hasInvalidItems = editableItems.some(item => 
      !item.description || item.quantity <= 0 || item.unitPrice < 0 || !Number.isInteger(item.unitPrice)
    );

    if (updatedTotalAmount <= 0 || hasInvalidItems) {
      toast.error('Validation Error', {
        description: 'PO must have a positive total amount and all items must have a description, positive quantity, and non-negative whole number unit price.',
        className: 'text-lg p-4' // Increased toast font size
      });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        vendor: purchaseOrder.vendor._id,
        items: editableItems,
        deliveryDate: editableDeliveryDate,
        totalAmount: updatedTotalAmount,
        status: editableStatus, // Status is also editable by admin
      };

      const apiUrl = `/api/purchaseorders/${purchaseOrder._id}`;
      console.log('Admin Save Request URL:', apiUrl);
      console.log('Admin Save Request Payload:', payload);

      await axios.put(apiUrl, payload);
      toast.success('PO Updated', {
        description: 'Purchase Order updated successfully by admin!',
        className: 'text-lg p-4'// Increased toast font size
      });
      setIsEditing(false);
      fetchPurchaseOrder(); // Re-fetch the updated PO data
    } catch (err: unknown) {
      console.error('Error updating purchase order by admin:', err);
      if (isAxiosError(err)) {
        console.error('Error Response Data:', err.response?.data);
        toast.error('Update Failed', {
          description: err.response?.data?.message || `Failed to update purchase order: ${err.response?.status}`,
          className: 'text-lg p-4' // Increased toast font size
        });
      } else {
        toast.error('Update Failed', {
          description: `Failed to update purchase order: ${String(err)}`,
          className: 'text-lg' // Increased toast font size
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAdminEdit = () => {
    setIsEditing(false);
    if (purchaseOrder) {
      setEditableItems(purchaseOrder.items);
      setEditableDeliveryDate(new Date(purchaseOrder.deliveryDate).toISOString().split('T')[0]);
      setEditableStatus(purchaseOrder.status);
    }
    setError(null);
    setSuccessMessage(null);
  };

  const handleApproveVendorEdit = async () => {
    if (!purchaseOrder) return;
    setIsProcessingApproval(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const apiUrl = `/api/purchaseorders/${purchaseOrder._id}/approve-vendor-edit`;
      console.log('Approve Vendor Edit Request URL:', apiUrl);
      await axios.post(apiUrl);
      toast.success('Vendor Edits Approved', {
        description: 'Vendor edits approved successfully!',
       className: 'text-lg p-4' // Increased toast font size
      });
      fetchPurchaseOrder();
    } catch (err: unknown) {
      console.error('Error approving vendor edits:', err);
      if (isAxiosError(err)) {
        toast.error('Approval Failed', {
          description: err.response?.data?.message || `Failed to approve vendor edits: ${err.response?.status}`,
          className: 'text-lg p-4' // Increased toast font size
        });
      } else {
        toast.error('Approval Failed', {
          description: `Failed to approve vendor edits: ${String(err)}`,
          className: 'text-lg' // Increased toast font size
        });
      }
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // NEW: Handle opening the Reject Vendor Edit Dialog
  const handleOpenRejectModal = () => {
    setIsRejectModalOpen(true);
    setRejectionReason(''); // Clear previous reason
  };

  // NEW: Handle Admin Rejecting Vendor Edits (from Dialog)
  const handleConfirmRejectVendorEdit = async () => {
    if (!purchaseOrder) return;
    if (!rejectionReason.trim()) {
      toast.error('Reason Required', {
        description: 'Please provide a reason for rejection.',
        className: 'text-lg p-4' // Increased toast font size
      });
      return;
    }

    setIsRejecting(true); // Spinner for modal button
    setError(null);
    setSuccessMessage(null);
    try {
      const apiUrl = `/api/purchaseorders/${purchaseOrder._id}/reject-vendor-edit`;
      const payload = { reason: rejectionReason };
      console.log('Reject Vendor Edit Request URL:', apiUrl);
      console.log('Reject Vendor Edit Request Payload:', payload);
      await axios.post(apiUrl, payload);
      toast.success('Vendor Edits Rejected', {
        description: 'Vendor edits rejected successfully!',
        className: 'text-lg p-4' // Increased toast font size
      });
      setIsRejectModalOpen(false); // Close dialog
      setRejectionReason(''); // Clear reason
      fetchPurchaseOrder(); // Re-fetch to update status
    } catch (err: unknown) {
      console.error('Error rejecting vendor edits:', err);
      if (isAxiosError(err)) {
        toast.error('Rejection Failed', {
          description: err.response?.data?.message || `Failed to reject vendor edits: ${err.response?.status}`,
          className: 'text-lg p-4' // Increased toast font size
        });
      } else {
        toast.error('Rejection Failed', {
          description: `Failed to reject vendor edits: ${String(err)}`,
          className: 'text-lg' // Increased toast font size
        });
      }
    } finally {
      setIsRejecting(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!purchaseOrder) return;

    if (purchaseOrder.status !== 'approved' && purchaseOrder.status !== 'completed') {
      toast.warning('Cannot Generate Bill', {
        description: 'Bill can only be generated for Approved or Completed Purchase Orders.',
        className: 'text-lg p-4'// Increased toast font size
      });
      return;
    }
    if (purchaseOrder.billId) {
      toast.info('Bill Already Generated', {
        description: 'A bill has already been generated for this Purchase Order.',
        className: 'text-lg p-4' // Increased toast font size
      });
      router.push(`/admin/bills/${purchaseOrder.billId}`); // Ensure path is correct
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const billPayload = {
        vendor: purchaseOrder.vendor._id,
        items: purchaseOrder.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        totalAmount: purchaseOrder.totalAmount,
        purchaseOrder: purchaseOrder._id,
        notes: `Bill generated from Purchase Order #${purchaseOrder.orderNumber}`,
        status: 'issued',
        paymentStatus: 'unpaid',
      };

      console.log('Generate Bill Payload:', billPayload);

      const response = await axios.post('/api/bills', billPayload);
      const newBill = response.data;

      toast.success('Bill Generated', {
        description: `Bill #${newBill.billNumber} generated successfully!`,
        className: 'text-lg p-4'// Increased toast font size
      });
      setPurchaseOrder(prev => prev ? { ...prev, status: 'billed', billId: newBill._id } : null);
      router.push(`/admin/bills/${newBill._id}`); // Ensure path is correct

    } catch (err: unknown) {
      console.error('Error generating bill from PO:', err);
      if (isAxiosError(err)) {
        toast.error('Bill Generation Failed', {
          description: err.response?.data?.message || 'Failed to generate bill from Purchase Order.',
          className: 'text-lg p-4' // Increased toast font size
        });
      } else {
        toast.error('Bill Generation Failed', {
          description: `Failed to generate bill: ${String(err)}`,
          className: 'text-lg' // Increased toast font size
        });
      }
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <Spinner />;
  }

  if (error && !purchaseOrder) {
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  }

  if (!purchaseOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">Purchase Order not found.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg border-none">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-extrabold text-gray-800">Purchase Order #{purchaseOrder.orderNumber}</CardTitle>
          <span className={`px-4 py-2 rounded-full text-lg font-semibold ${
            purchaseOrder.status === 'approved' ? 'bg-green-100 text-green-800' :
            purchaseOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            purchaseOrder.status === 'rejected' ? 'bg-red-100 text-red-800' :
            purchaseOrder.status === 'billed' ? 'bg-purple-100 text-purple-800' :
            purchaseOrder.status === 'vendor_edited' ? 'bg-blue-100 text-blue-800' : // Example color
            purchaseOrder.status === 'admin_edited' ? 'bg-orange-100 text-orange-800' : // Example color
            purchaseOrder.status === 'completed' ? 'bg-green-200 text-green-900' : // Another completed color
            purchaseOrder.status === 'cancelled' ? 'bg-gray-200 text-gray-700' : // Cancelled color
            'bg-gray-100 text-gray-800'
          }`}>
            {purchaseOrder.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && <p className="text-green-500 mb-4 text-lg text-center">{successMessage}</p>}
          {error && <p className="text-red-500 mb-4 text-lg text-center">{error}</p>}

          {!isEditing ? (
            <>
              <p className="text-lg"><strong className="font-semibold">Vendor:</strong> {purchaseOrder.vendor?.businessName || 'N/A'}</p>
              <p className="text-lg"><strong className="font-semibold">Issue Date:</strong> {new Date(purchaseOrder.issueDate).toLocaleDateString()}</p>
              <p className="text-lg"><strong className="font-semibold">Delivery Date:</strong> {new Date(purchaseOrder.deliveryDate).toLocaleDateString()}</p>
              <p className="text-lg"><strong className="font-semibold">Total Amount:</strong> ${purchaseOrder.totalAmount.toFixed(2)}</p>

              <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Items</h3>
              <div className="overflow-x-auto">
                <Table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="py-3 px-4 text-left text-lg font-semibold text-gray-700">Description</th>
                      <th className="py-3 px-4 text-right text-lg font-semibold text-gray-700">Quantity</th>
                      <th className="py-3 px-4 text-right text-lg font-semibold text-gray-700">Unit Price</th>
                      <th className="px-4 py-2 text-right text-lg font-semibold text-gray-700">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 text-left text-base">{item.description}</td>
                        <td className="py-3 px-4 text-right text-base">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-base">${item.unitPrice}</td>
                        <td className="py-3 px-4 text-right text-base">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <Button onClick={() => router.back()} variant="outline" className="px-6 py-3 text-lg border-gray-300 text-gray-700 hover:bg-gray-100">
                  Back
                </Button>
                <div className="flex space-x-3">
                  {/* Download PO PDF Button */}
                  {purchaseOrder.pdfFileName && (
                    <Button onClick={handleDownloadPOPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-md shadow-md">
                      Download PO PDF
                    </Button>
                  )}

                  {/* Generate Bill Button (Conditional) */}
                  {(purchaseOrder.status === 'approved' || purchaseOrder.status === 'completed') && !purchaseOrder.billId ? (
                    <Button onClick={handleGenerateBill} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg rounded-md shadow-md" disabled={submitting}>
                      {submitting ? <Spinner className="h-5 w-5" /> : 'Generate Bill'}
                    </Button>
                  ) : purchaseOrder.billId ? (
                    <Button onClick={() => router.push(`/admin/bills/${purchaseOrder.billId}`)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 text-lg rounded-md shadow-md">
                      View Bill
                    </Button>
                  ) : null}

                  {/* Edit PO Button (Admin's own edit) */}
                  <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-md shadow-md">Edit PO</Button>

                  {/* Admin Approve/Reject Vendor Edits (Conditional) */}
                  {purchaseOrder.status === 'vendor_edited' && (
                    <>
                      <Button onClick={handleApproveVendorEdit} disabled={isProcessingApproval} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded-md shadow-md">
                        {isProcessingApproval ? <Spinner className="h-5 w-5" /> : 'Approve Vendor Edit'}
                      </Button>
                      <Button onClick={handleOpenRejectModal} disabled={isProcessingApproval} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg rounded-md shadow-md">
                        {isProcessingApproval ? <Spinner className="h-5 w-5" /> : 'Reject Vendor Edit'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Admin Edit Mode
            <form onSubmit={handleAdminSave} className="space-y-6">
              <div>
                <Label htmlFor="deliveryDate" className="text-lg font-semibold text-gray-700 mb-2 block">Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={editableDeliveryDate}
                  onChange={(e) => setEditableDeliveryDate(e.target.value)}
                  className="text-lg p-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-lg font-semibold text-gray-700 mb-2 block">Status</Label>
                <Select value={editableStatus} onValueChange={setEditableStatus}>
                  <SelectTrigger id="status" className="h-12 text-lg">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="text-lg">Pending</SelectItem>
                    <SelectItem value="approved" className="text-lg">Approved</SelectItem>
                    <SelectItem value="rejected" className="text-lg">Rejected</SelectItem>
                    <SelectItem value="completed" className="text-lg">Completed</SelectItem>
                    <SelectItem value="billed" className="text-lg">Billed</SelectItem>
                    <SelectItem value="vendor_edited" className="text-lg">Vendor Edited</SelectItem>
                    <SelectItem value="admin_edited" className="text-lg">Admin Edited</SelectItem>
                    <SelectItem value="cancelled" className="text-lg">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Items</h3>
              {editableItems.map((item, index) => (
                <Card key={index} className="p-6 mb-4 shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor={`description-${index}`} className="text-md font-medium text-gray-700 mb-1 block">Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="text-lg p-2 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${index}`} className="text-md font-medium text-gray-700 mb-1 block">Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="text-lg p-2 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unitPrice-${index}`} className="text-md font-medium text-gray-700 mb-1 block">Unit Price</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="text-lg p-2 h-12"
                      />
                    </div>
                    <div className="flex justify-end items-center">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleRemoveItem(index)}
                        className="mt-2 md:mt-0"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <Button type="button" onClick={handleAddItem} variant="outline" className="mb-6">
                Add Item
              </Button>

              <div className="flex justify-between items-center mt-8">
                <Button onClick={handleCancelAdminEdit} type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Spinner /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* NEW: Rejection Reason Dialog for Admin */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[480px]"> {/* Increased max-width */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Reason for Rejection</DialogTitle> {/* Increased font size */}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="rejectionReason" className="text-base"> {/* Increased font size */}
              Please briefly explain why you are rejecting the vendor's edits.
            </Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., 'Quantity discrepancy on item X', 'Delivery date is too early'"
              className="w-full text-base h-32" // Increased height and font size
              rows={6} // Explicitly set rows for better control
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRejectVendorEdit}
              disabled={isRejecting || !rejectionReason.trim()} // Disable if empty or processing
            >
              {isRejecting ? <Spinner className="h-4 w-4" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPurchaseOrderDetailPage;