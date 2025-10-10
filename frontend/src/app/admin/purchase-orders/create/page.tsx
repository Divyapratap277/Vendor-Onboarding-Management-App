'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ShoppingCart,
  Building2,
  Package,
  Calendar,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calculator,
  DollarSign,
  Search,
  Edit3
} from 'lucide-react';
import Link from 'next/link';

// Schema for a single item in the purchase order
const itemSchema = z.object({
  description: z.string().min(1, { message: 'Description is required.' }),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1' }),
  unitPrice: z.coerce.number().min(0, { message: 'Unit price must be a non-negative whole number' }).int({ message: 'Unit price must be a whole number' }),
});

// Main schema for the Purchase Order form
const purchaseOrderSchema = z.object({
  vendor: z.string().min(1, { message: 'Vendor is required.' }),
  items: z.array(itemSchema).min(1, { message: 'At least one item is required.' }),
  deliveryDate: z.string().min(1, { message: 'Delivery Date is required.' }),
});

type PurchaseOrderFormInput = z.input<typeof purchaseOrderSchema>;
type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface VendorOption {
  _id: string;
  businessName: string;
  status: string;
}

const CreatePurchaseOrderPage = () => {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PurchaseOrderFormInput>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      vendor: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      deliveryDate: '',
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch form values for real-time calculations
  const watchedItems = watch('items');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/admin/login');
          return;
        }
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/admin/vendors/approved`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVendors(response.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setErrorMessage('Failed to load vendors.');
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, [router]);

  const onSubmit = async (data: PurchaseOrderFormValues) => {
    setErrorMessage('');
    setSuccessMessage('');
    console.log("Form Data:", data);
    console.log("Form Data Type:", typeof data);
    console.log("Form Data (stringified):", JSON.stringify(data));
    console.log("Quantity type:", typeof data.items[0].quantity);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/purchaseorders`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        setSuccessMessage('Purchase Order created successfully!');
        reset(); // Clear form
      } else {
        setErrorMessage(response.data.message || 'Failed to create Purchase Order.');
      }
    } catch (error: unknown) {
      console.error('Create PO error:', error);
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'An unexpected error occurred.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  if (loadingVendors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border-0 p-8 flex flex-col items-center max-w-md w-full">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl mb-6 shadow-lg">
            <Spinner className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Loading Vendors</h2>
          <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">Fetching approved vendors...</p>
        </Card>
      </div>
    );
  }

  const calculateTotal = () => {
    return watchedItems?.reduce((total, item) => {
      const quantity = Number(item?.quantity || 0);
      const unitPrice = Number(item?.unitPrice || 0);
      return total + (quantity * unitPrice);
    }, 0) || 0;
  };

  const calculateItemTotal = (index: number) => {
    const item = watchedItems?.[index];
    if (!item) return 0;
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    return quantity * unitPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-8xl mx-auto p-6">

        {/* Header Section */}
        <div className="mb-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/admin/purchase-orders">
              <Button
                variant="ghost"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-200 rounded-xl px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Purchase Orders
              </Button>
            </Link>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Purchase Order</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Generate a new purchase order for approved vendors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Two-Column Layout */}
          <div className="grid xl:grid-cols-12 gap-8">

            {/* Left Column - Form Fields */}
            <div className="xl:col-span-7 space-y-8">

              {/* Vendor Selection */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Vendor Selection
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Choose from your approved vendor list
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Label htmlFor="vendor" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Select Vendor
                    </Label>
                    <Controller
                      name="vendor"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200">
                            <SelectValue placeholder="Search and select a vendor..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl">
                            {vendors.map((vendor) => (
                              <SelectItem
                                key={vendor._id}
                                value={vendor._id}
                                className="rounded-lg my-1 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                              >
                                <div className="flex items-center gap-3">
                                  <Building2 className="h-4 w-4 text-slate-400" />
                                  <span className="font-medium">{vendor.businessName}</span>
                                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">
                                    Approved
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.vendor && (
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {errors.vendor.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Delivery Information
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Set expected delivery timeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Label htmlFor="deliveryDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Expected Delivery Date
                    </Label>
                    <Controller
                      name="deliveryDate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="deliveryDate"
                          type="date"
                          {...field}
                          className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        />
                      )}
                    />
                    {errors.deliveryDate && (
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {errors.deliveryDate.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Order Items
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {fields.length} item{fields.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Add and configure items for your purchase order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((item, index) => (
                    <Card
                      key={item.id}
                      className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md transition-all duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg shadow-sm">
                              <Package className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Item #{index + 1}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Configure item details</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal</p>
                              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                ₹{calculateItemTotal(index).toLocaleString()}
                              </p>
                            </div>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          {/* Description */}
                          <div className="lg:col-span-6">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                              Description
                            </Label>
                            <Controller
                              name={`items.${index}.description` as const}
                              control={control}
                              render={({ field }) => (
                                <Textarea
                                  placeholder="Describe the item or service..."
                                  {...field}
                                  value={field.value as string}
                                  rows={3}
                                  className="bg-white/50 dark:bg-slate-600/50 border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 resize-none"
                                />
                              )}
                            />
                            {errors.items?.[index]?.description && (
                              <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-2 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.items[index].description.message}
                              </p>
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="lg:col-span-3">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                              Quantity
                            </Label>
                            <Controller
                              name={`items.${index}.quantity` as const}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  value={field.value as number}
                                  className="h-12 bg-white/50 dark:bg-slate-600/50 border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                                />
                              )}
                            />
                            {errors.items?.[index]?.quantity && (
                              <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-2 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.items[index].quantity.message}
                              </p>
                            )}
                          </div>

                          {/* Unit Price */}
                          <div className="lg:col-span-3">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                              Unit Price (₹)
                            </Label>
                            <Controller
                              name={`items.${index}.unitPrice` as const}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  {...field}
                                  value={field.value as number}
                                  className="h-12 bg-white/50 dark:bg-slate-600/50 border-slate-200 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                                />
                              )}
                            />
                            {errors.items?.[index]?.unitPrice && (
                              <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-2 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.items[index].unitPrice.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add Item Button */}
                  <Button
                    type="button"
                    onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                    Add Another Item
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sticky Order Summary */}
            <div className="xl:col-span-5">
              <div className="sticky top-6 space-y-6">

                {/* Order Summary */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                      <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {fields.map((_, index) => {
                        const itemTotal = calculateItemTotal(index);
                        const item = watchedItems?.[index];
                        return (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-slate-600/50 last:border-b-0">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                Item #{index + 1}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item?.quantity || 0} × ₹{(item?.unitPrice || 0).toLocaleString()}
                              </p>
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              ₹{itemTotal.toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Total</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          ₹{calculateTotal().toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {fields.length} item{fields.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Create Purchase Order Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="h-5 w-5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Create Purchase Order
                      </>
                    )}
                  </Button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/admin/purchase-orders">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reset()}
                      disabled={isSubmitting}
                      className="w-full bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPage;