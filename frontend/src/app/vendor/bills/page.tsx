// frontend/src/app/vendor/bills/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { configuredAxios as axios } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileText, Download, Search, Filter, ChevronUp, ChevronDown, AlertCircle, MoreHorizontal, Eye } from 'lucide-react';

interface Bill {
  _id: string;
  billNumber: string;
  vendor: {
    _id: string;
    businessName: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  issueDate: string;
  pdfPath?: string;
}

const VendorBillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Bill | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const handleDownloadPdf = async (billPath: string, billNumber: string) => {
    try {
      window.open(`${process.env.NEXT_PUBLIC_BACKEND_URI}/uploads/${billPath}`, '_blank');
    } catch (error) {
      console.error('Error downloading Bill PDF:', error);
    }
  };

  const handleSort = (field: keyof Bill) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Bill) => {
    if (sortField !== field) {
      return <MoreHorizontal className="h-4 w-4 text-slate-400" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="h-4 w-4 text-slate-600" /> :
      <ChevronDown className="h-4 w-4 text-slate-600" />;
  };

  const filteredAndSortedBills = useMemo(() => {
    let filtered = bills.filter(bill => {
      const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === 'all' || bill.paymentStatus === paymentStatusFilter;

      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'vendor') {
          aValue = a.vendor.businessName;
          bValue = b.vendor.businessName;
        }

        if (sortField === 'totalAmount') {
          return sortDirection === 'asc' ?
            (a.totalAmount - b.totalAmount) :
            (b.totalAmount - a.totalAmount);
        }

        if (sortField === 'issueDate') {
          return sortDirection === 'asc' ?
            new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime() :
            new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ?
            aValue.localeCompare(bValue) :
            bValue.localeCompare(aValue);
        }

        return 0;
      });
    }

    return filtered;
  }, [bills, searchTerm, statusFilter, paymentStatusFilter, sortField, sortDirection]);

  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBills.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedBills, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedBills.length / itemsPerPage);

  const getStatusBadge = (status: string, type: 'status' | 'payment') => {
    if (type === 'status') {
      return (
        <Badge className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
          status === 'issued'
            ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
            : status === 'sent'
            ? 'bg-green-50 text-green-600 border-green-200 shadow-sm'
            : status === 'cancelled'
            ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
            : 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    } else {
      return (
        <Badge className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
          status === 'paid'
            ? 'bg-green-50 text-green-600 border-green-200 shadow-sm'
            : status === 'unpaid'
            ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
            : status === 'partially_paid'
            ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
            : status === 'overdue'
            ? 'bg-red-100 text-red-700 border-red-300 shadow-sm'
            : 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm'
        }`}>
          {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
        </Badge>
      );
    }
  };

  useEffect(() => {
    const fetchVendorBills = async () => {
      try {
        const response = await axios.get('/api/bills/vendor'); 
        setBills(response.data); 
      } catch (err: unknown) {
        console.error('Failed to fetch vendor bills:', err);
        const error = err as any;
        setError(error.response?.data?.message || 'Failed to fetch vendor bills.');
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendorBills();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-slate-50 relative min-h-screen flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 -z-10" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 text-blue-500">
            <Spinner />
          </div>
          <p className="text-lg text-slate-600">Loading your bills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 relative min-h-screen flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 -z-10" />
        <Card className="w-full max-w-md border border-red-200 bg-white/80 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Error Loading Bills</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section with Gradient */}
        <div className="mb-8 p-8 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bills</h1>
              <p className="text-slate-600 text-lg">Track and manage all your submitted bills with ease</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by bill number or vendor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 rounded-lg focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-lg focus:border-blue-300 transition-all">
                    <Filter className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Filter */}
              <div className="sm:w-48">
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-lg focus:border-blue-300 transition-all">
                    <Filter className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bills Table */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-slate-200/50">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-slate-50/50 to-white/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">Bills Overview</CardTitle>
                <CardDescription className="text-slate-600">
                  Showing {paginatedBills.length} of {filteredAndSortedBills.length} bills
                </CardDescription>
              </div>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Total: ${filteredAndSortedBills.reduce((sum, bill) => sum + bill.totalAmount, 0).toFixed(2)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAndSortedBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="bg-slate-100 rounded-full p-6 mb-6">
                  <FileText className="h-16 w-16 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No Bills Found</h3>
                <p className="text-slate-600 text-center max-w-md">
                  {bills.length === 0
                    ? "You haven't submitted any bills yet. Bills will appear here once they're created."
                    : "No bills match your current search criteria. Try adjusting your filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white hover:bg-slate-50/80 transition-colors">
                        <TableHead
                          className="cursor-pointer select-none font-semibold text-slate-700 px-6 py-4 hover:text-blue-600 transition-colors"
                          onClick={() => handleSort('billNumber')}
                        >
                          <div className="flex items-center gap-2">
                            Bill Number
                            {getSortIcon('billNumber')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none font-semibold text-slate-700 px-6 py-4 hover:text-blue-600 transition-colors"
                          onClick={() => handleSort('vendor' as keyof Bill)}
                        >
                          <div className="flex items-center gap-2">
                            Vendor
                            {getSortIcon('vendor' as keyof Bill)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none font-semibold text-slate-700 px-6 py-4 hover:text-blue-600 transition-colors"
                          onClick={() => handleSort('totalAmount')}
                        >
                          <div className="flex items-center gap-2">
                            Total Amount
                            {getSortIcon('totalAmount')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none font-semibold text-slate-700 px-6 py-4 hover:text-blue-600 transition-colors"
                          onClick={() => handleSort('issueDate')}
                        >
                          <div className="flex items-center gap-2">
                            Issue Date
                            {getSortIcon('issueDate')}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 px-6 py-4">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700 px-6 py-4">Payment</TableHead>
                        <TableHead className="font-semibold text-slate-700 px-6 py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBills.map((bill, index) => (
                        <TableRow
                          key={bill._id}
                          className={`border-b border-gray-200 hover:bg-blue-50/50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                          }`}
                        >
                          <TableCell className="px-6 py-5">
                            <div className="font-semibold text-slate-900">{bill.billNumber}</div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="text-slate-900 font-medium">{bill.vendor.businessName}</div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="font-bold text-slate-900 text-lg">${bill.totalAmount.toFixed(2)}</div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="text-slate-700 font-medium">{new Date(bill.issueDate).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            {getStatusBadge(bill.status, 'status')}
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            {getStatusBadge(bill.paymentStatus, 'payment')}
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {bill.pdfPath && (
                                <Button
                                  onClick={() => handleDownloadPdf(bill.pdfPath!, bill.billNumber)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 p-2 rounded-lg"
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 p-2 rounded-lg"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-slate-50/30 to-white/30">
                    <div className="text-sm text-slate-600 font-medium">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedBills.length)} of {filteredAndSortedBills.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={currentPage === page ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"}
                            >
                              {page}
                            </Button>
                          );
                        })}
                        {totalPages > 5 && (
                          <>
                            <span className="px-2 text-slate-400">...</span>
                            <Button
                              onClick={() => setCurrentPage(totalPages)}
                              variant={currentPage === totalPages ? "default" : "outline"}
                              size="sm"
                              className={currentPage === totalPages ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorBillsPage;
