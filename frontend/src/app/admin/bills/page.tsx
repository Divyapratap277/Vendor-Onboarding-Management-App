// frontend/src/app/admin/bills/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { configuredAxios as axios } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { FileText, Plus, Search, Filter, Edit, Trash2, Download, Eye, MoreVertical } from 'lucide-react';

interface Bill {
  _id: string;
  billNumber: string;
  vendor: {
    _id: string;
    businessName: string;
  };
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: string; // This is the Bill Workflow Status (e.g., issued, cancelled, completed)
  paymentStatus: string; // This is the Payment Collection Status (e.g., unpaid, paid, partially_paid)
  pdfPath?: string;
  pdfFileName?: string;
}

const AdminBillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/bills');
      setBills(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch bills:', err);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch bills.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
        }
      } else {
        setError('An unexpected error occurred while fetching bills.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDeleteBill = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this bill?'); // Consider replacing with Shadcn AlertDialog
    if (!confirmed) {
      return;
    }
    setDeletingBillId(id);
    try {
      await axios.delete(`/api/bills/${id}`);
      // --- Sonner Toast Update ---
      toast.success("Bill Deleted", {
        description: "Bill deleted successfully!",
        className: 'text-lg p-4'
      });
      fetchBills(); // Re-fetch bills after deletion
    } catch (err: unknown) {
      console.error('Failed to delete bill:', err);
      if (isAxiosError(err)) {
        // --- Sonner Toast Update ---
        toast.error("Error Deleting Bill", {
          description: err.response?.data?.message || 'Failed to delete bill.',
          className: 'text-lg p-4'
        });
      } else {
        // --- Sonner Toast Update ---
        toast.error("Error Deleting Bill", {
          description: 'An unexpected error occurred during deletion.',
        });
      }
    } finally {
      setDeletingBillId(null);
    }
  };

  const handleGenerateBillDocument = async (id: string) => {
    setGeneratingPdfId(id);
    try {
      const response = await axios.put(`/api/bills/${id}/generate-pdf`);
      // --- Sonner Toast Update ---
      toast.success("PDF Generated", {
        description: response.data.message || 'Bill PDF generated successfully!',
        className: 'text-lg p-4'
      });
      fetchBills(); // Re-fetch bills to update PDF status (e.g., pdfPath)
    } catch (err: unknown) {
      console.error('Failed to generate bill document:', err);
      if (isAxiosError(err)) {
        // --- Sonner Toast Update ---
        toast.error("Error Generating PDF", {
          description: err.response?.data?.message || 'Failed to generate bill document.',
          className: 'text-lg p-4'
        });
      } else {
        // --- Sonner Toast Update ---
        toast.error("Error Generating PDF", {
          description: 'An unexpected error occurred during PDF generation.',
        });
      }
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDownloadPdf = (bill: Bill) => {
    if (bill.pdfFileName) {
      const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/uploads/bills/${bill.pdfFileName}`; 
      window.open(pdfUrl, '_blank');
    } else {
      // --- Sonner Toast Update ---
      toast.warning("PDF Not Available", {
        description: 'PDF not available for this bill. Please generate it first.',
        className: 'text-lg p-4'
      });
    }
  };

  // --- Helper to get combined display status and its variant ---
  const getCombinedStatusDisplay = (bill: Bill) => {
    let statusText: string;
    let variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';

    if (bill.paymentStatus === 'paid') {
      statusText = 'Paid';
      variant = 'success';
    } else if (bill.paymentStatus === 'partially_paid') {
      statusText = 'Partially Paid';
      variant = 'warning';
    } else if (bill.paymentStatus === 'refunded') {
      statusText = 'Refunded';
      variant = 'default'; // Or 'destructive' depending on refund policy
    } else { // bill.paymentStatus is 'unpaid'
      switch (bill.status) { // This is bill.status (workflow status)
        case 'overdue':
          statusText = 'Overdue';
          variant = 'destructive';
          break;
        case 'cancelled':
          statusText = 'Cancelled';
          variant = 'destructive';
          break;
        case 'draft':
          statusText = 'Draft';
          variant = 'secondary';
          break;
        case 'issued':
          statusText = 'Issued';
          variant = 'outline';
          break;
        case 'sent':
          statusText = 'Sent';
          variant = 'outline';
          break;
        case 'completed': // Should only happen if paymentStatus is paid (as per backend logic)
          statusText = 'Completed';
          variant = 'success';
          break;
        default:
          statusText = bill.status.replace(/_/g, ' ').toUpperCase();
          variant = 'default';
      }
    }
    return { statusText, variant };
  };

  // Filter bills based on search and status
  const filteredBills = bills.filter((bill) => {
    const matchesSearch = searchTerm === '' ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor?.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const { statusText } = getCombinedStatusDisplay(bill);
    const matchesStatus = statusFilter === 'all' ||
      statusText.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 relative min-h-screen">
      {/* Clean Light Background with Subtle Accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 -z-10" />
      <div className="absolute inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)'
      }} />

      <div className="relative z-10 p-8">
        {/* Hero Header with Modern Design */}
        <div className="mb-12 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* Hero Brand Element */}
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl blur opacity-30 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Manage Bills
                  </h1>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mt-2 shadow-lg shadow-blue-500/50" />
                </div>
              </div>
              <p className="text-slate-600 ml-20 text-xl">Track and manage all vendor bills and payments</p>
            </div>

            {/* Create New Bill Button - Premium Style */}
            <Button
              onClick={() => router.push('/admin/bills/create')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 border-0 font-semibold tracking-wide"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Bill
            </Button>
          </div>
        </div>

        {/* Search & Filter Section */}
        <Card className="border border-gray-400/50 bg-gradient-to-r from-gray-200/90 to-slate-200/90 backdrop-blur-xl shadow-xl mb-8">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-gray-600/30 to-slate-700/30 rounded-xl flex items-center justify-center border border-gray-600/30">
                  <Search className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Search & Filter</h3>
                  <p className="text-base text-slate-600">Find bills quickly</p>
                </div>
              </div>
              <div className="text-base text-slate-500">
                {filteredBills.length} of {bills.length} bills
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by bill number or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-base text-slate-900 placeholder-slate-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-base text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="issued">Issued</option>
                  <option value="overdue">Overdue</option>
                  <option value="partially paid">Partially Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== 'all') && (
                <div className="flex items-center">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    variant="outline"
                    className="px-4 py-3 border-slate-200 text-base text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bills Content */}
        <Card className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <p className="text-lg font-medium">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner className="h-12 w-12" />
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex flex-col items-center justify-center text-slate-500">
                  {bills.length === 0 ? (
                    <>
                      <FileText className="h-16 w-16 mb-6 text-slate-400" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">No Bills Found</h3>
                      <p className="text-2xl text-slate-600">Create your first bill to get started</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-16 w-16 mb-6 text-slate-400" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">No Matching Bills</h3>
                      <p className="text-2xl text-slate-600">Try adjusting your search or filter criteria</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50/50">
                      <TableHead className="py-4 px-6 text-left text-lg font-bold text-slate-700">Bill #</TableHead>
                      <TableHead className="py-4 px-6 text-left text-lg font-bold text-slate-700">Vendor</TableHead>
                      <TableHead className="py-4 px-6 text-left text-lg font-bold text-slate-700">Total Amount</TableHead>
                      <TableHead className="py-4 px-6 text-left text-lg font-bold text-slate-700">Issue Date</TableHead>
                      <TableHead className="py-4 px-6 text-left text-lg font-bold text-slate-700">Due Date</TableHead>
                      <TableHead className="py-4 px-6 text-left text-lg font-bold text-slate-700">Status</TableHead>
                      <TableHead className="py-4 px-6 text-left text-lg font-bold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredBills.map((bill, index) => {
                        const { statusText, variant } = getCombinedStatusDisplay(bill);
                        return (
                          <TableRow
                            key={bill._id}
                            className={`border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                            }`}
                          >
                            <TableCell className="py-4 px-6 text-lg">
                              <Button
                                variant="link"
                                onClick={() => router.push(`/admin/bills/${bill._id}`)}
                                className="p-0 h-auto text-blue-600 hover:text-blue-800 text-lg font-semibold"
                              >
                                {bill.billNumber}
                              </Button>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-lg font-medium text-slate-900">
                              {bill.vendor?.businessName || 'N/A'}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-lg font-bold text-slate-900">
                              ${bill.totalAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-lg text-slate-700">
                              {new Date(bill.issueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-lg text-slate-700">
                              {new Date(bill.dueDate).toLocaleDateString()}
                            </TableCell>

                            {/* Enhanced Status Column */}
                            <TableCell className="py-4 px-6">
                              <Badge
                                className={`px-3 py-1 text-lg font-bold rounded-full border-2 ${
                                  variant === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : variant === 'warning'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : variant === 'destructive'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : variant === 'outline'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : variant === 'secondary'
                                    ? 'bg-slate-50 text-slate-700 border-slate-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {statusText}
                              </Badge>
                            </TableCell>

                            {/* Modern Action Buttons */}
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {/* Edit Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/bills/${bill._id}/edit`)}
                                  className="px-3 py-2 text-lg font-semibold rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>

                                {/* Delete Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBill(bill._id)}
                                  disabled={deletingBillId === bill._id}
                                  className="px-3 py-2 text-lg font-semibold rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                >
                                  {deletingBillId === bill._id ? (
                                    <Spinner className="h-4 w-4 mr-1" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 mr-1" />
                                  )}
                                  {deletingBillId === bill._id ? 'Deleting...' : 'Delete'}
                                </Button>

                                {/* PDF Actions */}
                                {!bill.pdfFileName ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerateBillDocument(bill._id)}
                                    disabled={generatingPdfId === bill._id}
                                    className="px-3 py-2 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                  >
                                    {generatingPdfId === bill._id ? (
                                      <Spinner className="h-4 w-4 mr-1" />
                                    ) : (
                                      <FileText className="h-4 w-4 mr-1" />
                                    )}
                                    {generatingPdfId === bill._id ? 'Generating...' : 'Generate'}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleDownloadPdf(bill)}
                                    className="px-3 py-2 text-lg font-semibold rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
};

export default AdminBillsPage;