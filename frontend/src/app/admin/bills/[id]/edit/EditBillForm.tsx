// src/app/admin/bills/[id]/edit/EditBillForm.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { configuredAxios as axios } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner'; // Corrected import for Sonner

// --- Type Definitions ---
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
  status: string; // This is the billStatus from backend
  paymentStatus: string;
  items: BillItem[];
  vendor?: { _id: string, businessName: string, contactEmail: string, address: any };
  billNumber?: string;
  purchaseOrder?: string;
}

// Define the static enum values for dropdowns
const billWorkflowStatuses = ['draft', 'issued', 'sent', 'overdue', 'cancelled', 'completed'];
const paymentCollectionStatuses = ['unpaid', 'partially_paid', 'paid', 'refunded'];


const EditBillForm = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Kept for initial fetch error
  const [validationErrors, setValidationErrors] = useState<any>({});

  // State to manage the available and disabled state of Bill Workflow Status dropdown
  const [availableBillStatuses, setAvailableBillStatuses] = useState<string[]>(billWorkflowStatuses);
  const [isBillStatusDisabled, setIsBillStatusDisabled] = useState(false);


  // --- Helper to format date for input[type="date"] ---
  const formatDateForInput = (dateString: string | Date) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  // --- Logic to enforce client-side status consistency ---
  const enforceStatusConsistency = useCallback((currentBill: Bill) => {
    let newBillStatus = currentBill.status; // Start with the bill's current status
    let isDisabled = false;
    let filteredStatuses = billWorkflowStatuses; // Start with all possible admin statuses

    if (currentBill.paymentStatus === 'paid') {
      newBillStatus = 'completed';
      isDisabled = true;
    } else if (currentBill.paymentStatus === 'partially_paid') {
        // When partially paid, billStatus should be an active workflow state, not completed, overdue, draft, or cancelled.
        // If the current bill status is one of these "fixed" states, we set it to 'issued'
        if (currentBill.status === 'draft' || currentBill.status === 'completed' || currentBill.status === 'cancelled' || currentBill.status === 'overdue') {
            newBillStatus = 'issued'; 
        } else {
            newBillStatus = currentBill.status; // Keep its current active state (issued/sent)
        }
        isDisabled = true;
    } else if (currentBill.paymentStatus === 'unpaid' || currentBill.paymentStatus === 'refunded') {
      isDisabled = false; // Enabled for unpaid/refunded
      // Filter out statuses that don't make sense if unpaid/refunded (e.g., 'completed' should not be selectable)
      filteredStatuses = billWorkflowStatuses.filter(s => 
        s !== 'completed' 
      );
      // If current status somehow became 'completed' due to an old bug,
      // revert it to a valid state when paymentStatus is unpaid/refunded
      if (currentBill.status === 'completed') {
        newBillStatus = 'issued'; 
      }
    }

    // Apply the enforced status and options to state
    setBill(prev => prev ? { ...prev, status: newBillStatus } : null);
    setAvailableBillStatuses(filteredStatuses);
    setIsBillStatusDisabled(isDisabled);

  }, []); // Empty dependency array means this function is created once

  // --- Handler for general input changes (dates, totalAmount, notes) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let updatedValue: string | number = value;

    if (name === 'totalAmount') {
      updatedValue = parseFloat(value) || 0;
    }

    setBill((prevBill) => {
      if (!prevBill) return prevBill;
      const updatedBill = {
        ...prevBill,
        [name]: updatedValue,
      };
      return updatedBill;
    });
  };

  // --- Handler for Select component changes (status, paymentStatus) ---
  const handleSelectChange = (name: string, value: string) => {
    setBill((prevBill) => {
      if (!prevBill) return prevBill;
      const updatedBill = {
        ...prevBill,
        [name]: value,
      };
      // If paymentStatus changes, immediately enforce consistency for billStatus dropdown
      if (name === 'paymentStatus') {
        const tempBillForConsistency = { ...updatedBill, paymentStatus: value };
        enforceStatusConsistency(tempBillForConsistency);
      }
      return updatedBill;
    });
  };

  // --- Handler for changes within the dynamic 'items' array ---
  const handleItemChange = (index: number, field: keyof BillItem, value: string) => {
    setBill((prevBill) => {
      if (!prevBill) return prevBill;
      const newItems = [...prevBill.items];
      let parsedValue: string | number = value;

      if (field === 'quantity' || field === 'unitPrice') {
        parsedValue = parseInt(value) || 0;
      }

      newItems[index] = {
        ...newItems[index],
        [field]: parsedValue,
      };
      return { ...prevBill, items: newItems } as Bill;
    });
  };

  const addItem = () => {
    setBill((prevBill) => {
      if (!prevBill) return prevBill;
      return {
        ...prevBill,
        items: [...prevBill.items, { _id: `new-${Date.now()}-${Math.random()}`, description: '', quantity: 0, unitPrice: 0 }],
      } as Bill;
    });
  };

  const removeItem = (index: number) => {
    setBill((prevBill) => {
      if (!prevBill) return prevBill;
      const newItems = [...prevBill.items];
      newItems.splice(index, 1);
      return { ...prevBill, items: newItems } as Bill;
    });
  };

  // --- Effect Hook to Fetch Bill Data on Component Mount or ID Change ---
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await axios.get(`/api/bills/${id}`);
        const fetchedBill: Bill = {
          ...response.data,
          issueDate: formatDateForInput(response.data.issueDate),
          dueDate: formatDateForInput(response.data.dueDate),
          purchaseOrder: response.data.purchaseOrder ? response.data.purchaseOrder._id : null,
        };
        setBill(fetchedBill);
        setLoading(false);
        enforceStatusConsistency(fetchedBill);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch bill');
        setLoading(false);
      }
    };

    if (id) {
      fetchBill();
    }
  }, [id, enforceStatusConsistency]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!bill) {
    return <div className="text-center py-4">Bill not found</div>;
  }

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    const errors: any = {};

    // Client-side Validation
    if (!bill.issueDate) errors.issueDate = 'Issue Date is required';
    if (!bill.dueDate) errors.dueDate = 'Due Date is required';
    if (typeof bill.totalAmount !== 'number' || isNaN(bill.totalAmount) || bill.totalAmount < 0) {
      errors.totalAmount = 'Total Amount must be a non-negative number';
    }
    if (!bill.status) errors.status = 'Bill Workflow Status is required';
    if (!bill.paymentStatus) errors.paymentStatus = 'Payment Collection Status is required';

    bill.items.forEach((item, index) => {
      if (!item.description) errors[`items[${index}].description`] = 'Description is required';
      if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
        errors[`items[${index}].quantity`] = 'Quantity must be a positive number';
      }
      if (typeof item.unitPrice !== 'number' || isNaN(item.unitPrice) || item.unitPrice < 0 || !Number.isInteger(item.unitPrice)) {
        errors[`items[${index}].unitPrice`] = 'Unit Price must be a non-negative whole number';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      // --- Sonner Toast Update ---
      toast.error("Validation Error", {
        description: "Please correct the highlighted fields.",
        className: 'text-lg p-4'
      });
      return;
    }

    try {
      const dataToSend = {
        ...bill,
        issueDate: new Date(bill.issueDate).toISOString(),
        dueDate: new Date(bill.dueDate).toISOString(),
        purchaseOrder: bill.purchaseOrder,
        vendor: bill.vendor?._id,
        items: bill.items.map(item => ({
          ...(item._id && item._id.startsWith('new-') ? {} : { _id: item._id }),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      };

      await axios.put(`/api/bills/${id}`, dataToSend);
      // --- Sonner Toast Update ---
      toast.success("Bill Updated", {
        description: "Bill updated successfully!",
        className: 'text-lg p-4'
      });
      router.push(`/admin/bills/${id}`);
    } catch (error: any) {
      console.error("Failed to update bill:", error.response?.data || error.message);
      if (error.response?.data?.errors) {
        const backendErrors: any = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.path || err.param] = err.msg;
        });
        setValidationErrors(backendErrors);
        // --- Sonner Toast Update ---
        toast.error("Validation Failed", {
          description: error.response.data.message || 'Validation failed. Please check the form.',
          className: 'text-lg p-4'
        });
      } else {
        // --- Sonner Toast Update ---
        toast.error("Error Updating Bill", {
          description: error.response?.data?.message || 'Failed to update bill.',
          className: 'text-lg p-4'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Edit Bill</CardTitle>
            <CardDescription className="text-lg">
              Manage and update bill details, statuses, and items.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-base">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Bill Details Section */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-2xl">Bill Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="issueDate" className="mb-1 font-semibold text-lg">Issue Date</Label>
                    <Input
                      type="date"
                      id="issueDate"
                      name="issueDate"
                      value={bill?.issueDate || ''}
                      onChange={handleInputChange}
                      className="w-full text-xl p-5"
                      disabled={bill?.status !== 'draft'}
                    />
                    {validationErrors?.issueDate && <p className="text-red-500 text-sm mt-1">{validationErrors?.issueDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="mb-1 font-semibold text-lg">Due Date</Label>
                    <Input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={bill?.dueDate || ''}
                      onChange={handleInputChange}
                      className="w-full text-xl p-5"
                      disabled={bill?.status !== 'draft'}
                    />
                    {validationErrors?.dueDate && <p className="text-red-500 text-sm mt-1">{validationErrors?.dueDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="totalAmount" className="mb-1 font-semibold text-lg">Total Amount</Label>
                    <Input
                      type="number"
                      id="totalAmount"
                      name="totalAmount"
                      value={bill?.totalAmount || 0}
                      onChange={handleInputChange}
                      className="w-full text-xl p-5"
                      disabled={bill?.status !== 'draft'}
                    />
                    {validationErrors?.totalAmount && <p className="text-red-500 text-sm mt-1">{validationErrors?.totalAmount}</p>}
                  </div>
                  <div className="col-span-full">
                    <Label htmlFor="notes" className="mb-1 font-semibold text-lg">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={bill?.notes || ''}
                      onChange={handleInputChange}
                      className="w-full text-xl p-5"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status Management Section */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-2xl">Status Management</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status" className="mb-1 font-semibold text-lg">Bill Workflow Status</Label>
                    <Select value={bill?.status || ''} onValueChange={(value: string) => handleSelectChange('status', value)} disabled={isBillStatusDisabled}>
                      <SelectTrigger className="w-full text-xl p-5">
                        <SelectValue placeholder="Select Bill Workflow Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBillStatuses.map(statusOption => (
                          <SelectItem key={statusOption} value={statusOption} className="text-lg">{statusOption.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors?.status && <p className="text-red-500 text-sm mt-1">{validationErrors?.status}</p>}
                  </div>
                  <div>
                    <Label htmlFor="paymentStatus" className="mb-1 font-semibold text-lg">Payment Collection Status</Label>
                    <Select value={bill?.paymentStatus || ''} onValueChange={(value: string) => handleSelectChange('paymentStatus', value)}>
                      <SelectTrigger className="w-full text-xl p-5">
                        <SelectValue placeholder="Select Payment Collection Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentCollectionStatuses.map(statusOption => (
                          <SelectItem key={statusOption} value={statusOption} className="text-lg">{statusOption.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors?.paymentStatus && <p className="text-red-500 text-sm mt-1">{validationErrors?.paymentStatus}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Items Section */}
              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl">Items</CardTitle>
                  <Button onClick={addItem} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={bill?.status !== 'draft'}>Add Item</Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-base">
                        {bill?.items?.map((item, index) => (
                          <tr key={item._id || `new-item-${index}`} className="even:bg-gray-50">
                            <td className="px-6 py-4">
                              <Input
                                type="text"
                                name="description"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="w-full text-xl p-5"
                                disabled={bill?.status !== 'draft'}
                              />
                              {validationErrors[`items[${index}].description`] && <p className="text-red-500 text-sm mt-1">{validationErrors?.[`items[${index}].description`]}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <Input
                                type="number"
                                name="quantity"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-full text-xl p-5"
                                disabled={bill?.status !== 'draft'}
                              />
                              {validationErrors[`items[${index}].quantity`] && <p className="text-red-500 text-sm mt-1">{validationErrors?.[`items[${index}].quantity`]}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <Input
                                type="number"
                                name="unitPrice"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                className="w-full text-xl p-5"
                                disabled={bill?.status !== 'draft'}
                              />
                              {validationErrors[`items[${index}].unitPrice`] && <p className="text-red-500 text-sm mt-1">{validationErrors?.[`items[${index}].unitPrice`]}</p>}
                            </td>
                            <td className="px-6 py-4 text-base font-medium">
                              <Button onClick={() => removeItem(index)} variant="destructive" size="lg" disabled={bill?.status !== 'draft'}>Remove</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end mt-8">
                <Button type="submit" disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg">
                  {loading ? <Spinner className="h-6 w-6" /> : 'Update Bill'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditBillForm;