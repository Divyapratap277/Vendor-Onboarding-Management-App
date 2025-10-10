'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configuredAxios as axios } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { ShoppingCart, FileText, Eye, XCircle, Calendar, DollarSign, Building2, Package, Search, Filter, MoreVertical } from 'lucide-react';

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
  pdfPath?: string; // This should be the relative path like 'purchase_orders/filename.pdf'
}

const PurchaseOrdersPage = () => {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null); // State to track which PO is being cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        // This GET request will now automatically filter out 'cancelled' POs
        const response = await axios.get('/api/purchaseorders');
        setPurchaseOrders(response.data);
      } catch (err: unknown) {
        console.error('Error fetching purchase orders:', err);
        const error = err as any;
        setError(error.response?.data?.message || 'Failed to load purchase orders.');
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrders();
  }, [router]);

  const handleGeneratePdf = async (id: string) => {
    try {
      const response = await axios.post(`/api/purchaseorders/${id}/generate-pdf`, {});
      if (response.status === 200) {
        console.log('PDF generated successfully. Path:', response.data.pdfPath);
        const updatedPurchaseOrders = purchaseOrders.map(po =>
          po._id === id ? { ...po, pdfPath: response.data.pdfPath } : po
        );
        setPurchaseOrders(updatedPurchaseOrders);
      }
    } catch (err: unknown) {
      console.error('Error generating PDF:', err);
      const error = err as any;
      if (error.response) {
        console.error('PDF Generation Error Response Data:', error.response.data);
        console.error('PDF Generation Error Response Status:', error.response.status);
        setError(error.response.data.message || 'Failed to generate PDF.');
      } else {
        setError('Failed to generate PDF: Network error or unexpected issue.');
      }
    }
  };

  // Function to navigate to individual PO detail page
  const handleViewPODetail = (poId: string) => {
    router.push(`/admin/purchase-orders/${poId}`);
  };

  // NEW: Handle Cancel PO (Soft Delete)
  const handleCancelPO = async (poId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the card's onClick from firing

    // IMPORTANT: Replace window.confirm with a custom modal/dialog UI for production
    if (!window.confirm('Are you sure you want to cancel this Purchase Order? It will be moved to the cancelled POs section.')) {
      return;
    }

    setCancellingId(poId); // Set loading state for this specific PO
    try {
      // Send a PUT request to change status to 'cancelled'
      await axios.put(`/api/purchaseorders/${poId}/cancel`);
      // Filter out the cancelled PO from the current list
      setPurchaseOrders(prevPOs => prevPOs.filter(po => po._id !== poId));
      console.log(`Purchase Order ${poId} cancelled successfully.`);
    } catch (err: unknown) {
      console.error('Error cancelling purchase order:', err);
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to cancel purchase order.');
    } finally {
      setCancellingId(null); // Clear loading state
    }
  };

  // Filter purchase orders based on search and status
  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const matchesSearch = searchTerm === '' ||
      po.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="bg-slate-50 relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 -z-10" />
        <div className="relative z-10 p-8 flex items-center justify-center min-h-screen">
          <Card className="border border-red-200/50 bg-white/50 backdrop-blur-xl shadow-2xl max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Purchase Orders</h3>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl blur opacity-30 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Purchase Orders
                  </h1>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mt-2 shadow-lg shadow-blue-500/50" />
                </div>
              </div>
              <p className="text-slate-600 ml-20 text-xl">Manage and track all purchase order activities</p>
            </div>

            {/* Create New PO Button - Premium Style */}
            <Button
              onClick={() => router.push('/admin/purchase-orders/create')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 border-0 font-semibold tracking-wide"
            >
              <Package className="h-5 w-5 mr-2" />
              Create New PO
            </Button>
          </div>
        </div>

        {/* Search & Filter Section */}
        <Card className="border border-gray-400/50 bg-gradient-to-r from-gray-200/90 to-slate-200/90 backdrop-blur-xl shadow-xl mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-gray-600/30 to-slate-700/30 rounded-xl flex items-center justify-center border border-gray-600/30">
                  <Search className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Search & Filter</h3>
                  <p className="text-base text-slate-600">Find purchase orders quickly</p>
                </div>
              </div>
              <div className="text-base text-slate-500">
                {filteredPurchaseOrders.length} of {purchaseOrders.length} orders
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by order number or vendor..."
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="billed">Billed</option>
                  <option value="completed">Completed</option>
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

        {/* Purchase Orders Grid */}
        <div className="space-y-6">
          {filteredPurchaseOrders.length === 0 ? (
            <Card className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-16 text-center">
                <div className="flex flex-col items-center justify-center text-slate-500">
                  {purchaseOrders.length === 0 ? (
                    <>
                      <ShoppingCart className="h-16 w-16 mb-6 text-slate-400" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">No Purchase Orders Found</h3>
                      <p className="text-xl text-slate-600">Create your first purchase order to get started</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-16 w-16 mb-6 text-slate-400" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">No Matching Orders</h3>
                      <p className="text-xl text-slate-600">Try adjusting your search or filter criteria</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPurchaseOrders.map((po) => (
              <Card
                key={po._id}
                className="border border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Dynamic glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-0 relative">
                  {/* Header Section - Always Visible */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                          <FileText className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">{po.orderNumber}</h3>
                          <p className="text-slate-600 text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {po.vendor.businessName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Amount Display */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">${po.totalAmount.toFixed(2)}</p>
                          <p className="text-base text-slate-500">Total Amount</p>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={`px-4 py-2 text-base font-bold rounded-full border-2 ${
                            po.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : po.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : po.status === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : po.status === 'billed'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : po.status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </Badge>

                        {/* Actions Menu */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPODetail(po._id);
                          }}
                          className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info Row */}
                  <div className="p-6 bg-white/80">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-base text-slate-500">Issue Date</p>
                          <p className="font-semibold text-lg text-slate-900">{new Date(po.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-base text-slate-500">Items</p>
                          <p className="font-semibold text-lg text-slate-900">{po.items.length} item{po.items.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-base text-slate-500">Document</p>
                          <p className="font-semibold text-lg text-slate-900">{po.pdfPath ? 'Generated' : 'Pending'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Section */}
                  <div className="border-t border-slate-100 bg-slate-50/30">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" />
                          Order Details
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPODetail(po._id);
                          }}
                          className="border-blue-200 text-base text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>

                      {/* Condensed Items Table */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="max-h-48 overflow-y-auto">
                          <table className="w-full text-base">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="text-left py-3 px-4 font-semibold text-base text-slate-700">Item</th>
                                <th className="text-center py-3 px-4 font-semibold text-base text-slate-700">Qty</th>
                                <th className="text-right py-3 px-4 font-semibold text-base text-slate-700">Unit Price</th>
                                <th className="text-right py-3 px-4 font-semibold text-base text-slate-700">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {po.items.map((item, index) => (
                                <tr key={index} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                                  <td className="py-3 px-4 text-slate-900">{item.description}</td>
                                  <td className="py-3 px-4 text-center text-slate-700">{item.quantity}</td>
                                  <td className="py-3 px-4 text-right text-slate-700">${item.unitPrice}</td>
                                  <td className="py-3 px-4 text-right font-semibold text-slate-900">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-base text-slate-500">
                        <span>Last updated: {new Date(po.issueDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Generate PDF Button */}
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleGeneratePdf(po._id); }}
                          disabled={!!po.pdfPath}
                          size="sm"
                          className={`px-4 py-2 text-base font-semibold rounded-lg transition-all duration-300 ${
                            po.pdfPath
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {po.pdfPath ? 'Generated' : 'Generate PDF'}
                        </Button>

                        {/* View PDF Button */}
                        {po.pdfPath && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URI}/uploads/${po.pdfPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-4 py-2 text-base font-semibold rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View PDF
                            </Button>
                          </a>
                        )}

                        {/* Cancel PO Button */}
                        <Button
                          onClick={(e) => handleCancelPO(po._id, e)}
                          disabled={cancellingId === po._id}
                          size="sm"
                          variant="destructive"
                          className="px-4 py-2 text-base font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
                        >
                          {cancellingId === po._id ? (
                            <Spinner className="h-4 w-4 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          {cancellingId === po._id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;
