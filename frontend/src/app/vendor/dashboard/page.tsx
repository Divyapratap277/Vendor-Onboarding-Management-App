'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { configuredAxios as configuredAxiosInstance } from '@/lib/auth';
import baseAxios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationList, { Notification } from '@/components/ui/Notificationlist';
import { TrendingUp, ShoppingCart, FileText, Bell, CheckCircle, Clock, Package, ArrowRight, Eye, Calendar, DollarSign } from 'lucide-react';

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; }>;
  deliveryDate: string;
  vendor: { businessName: string };
  pdfFileName?: string;
  pdfPath?: string;
}

interface PendingAction {
  id: string;
  description: string;
  dueDate: string;
}

interface Bill {
  _id: string;
  billNumber: string;
  billDate: string;
  totalAmount: number;
  status: string;
  purchaseOrder: { orderNumber: string };
  pdfFileName?: string;
}




interface VendorDashboardData {
  newPurchaseOrders: PurchaseOrder[];
  pendingActions: PendingAction[];
  billStatus: Bill[];
  notifications: Notification[]; // Add notifications to the dashboard data interface
}

const VendorDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<VendorDashboardData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]); // State to hold notifications
  const router = useRouter();

  useEffect(() => {
    console.log('useEffect hook in VendorDashboardPage is running');
    const fetchDashboardData = async () => {
      console.log('fetchDashboardData function is running');
      try {
        console.log('Attempting to fetch vendor dashboard data...');
        const response = await configuredAxiosInstance.get('/api/purchaseorders/vendor');
        console.log('Response from /api/purchaseorders/vendor:', response.data);

        const purchaseOrders: PurchaseOrder[] = response.data.purchaseOrders.map((po: unknown) => {
          const poData = po as any;
          return {
            _id: poData._id,
            orderNumber: poData.orderNumber,
            totalAmount: poData.totalAmount,
            status: poData.status,
            items: poData.items,
            deliveryDate: poData.deliveryDate,
            vendor: { businessName: poData.vendor?.businessName || 'N/A' },
            pdfFileName: poData.pdfFileName,
            pdfPath: poData.pdfPath,
          };
        });

        const bills: Bill[] = response.data.bills.map((bill: unknown) => {
          const billData = bill as any;
          return {
            _id: billData._id,
            billNumber: billData.billNumber,
            billDate: billData.billDate,
            totalAmount: billData.totalAmount,
            status: billData.status,
            purchaseOrder: { orderNumber: billData.purchaseOrder?.orderNumber || 'N/A' },
            pdfFileName: billData.pdfFileName,
          };
        });

        // --- NEW: Fetch Notifications ---
        console.log('Attempting to fetch notifications from /api/notifications...');
        const notificationsRes = await configuredAxiosInstance.get('/api/notifications');
        console.log('Response from /api/notifications:', notificationsRes.data);
        setNotifications(notificationsRes.data); // Update notifications state

        setDashboardData({
          newPurchaseOrders: purchaseOrders,
          pendingActions: [], // Your original code had this empty, keeping it as is
          billStatus: bills,
          notifications: notificationsRes.data, // Also include in dashboardData if you prefer
        });
        console.log('Dashboard data set successfully. New POs:', purchaseOrders);
        console.log('Dashboard data set successfully. Bills:', bills);
        console.log('Dashboard data set successfully. Notifications:', notificationsRes.data);

      } catch (err: unknown) {
        setError('Failed to fetch dashboard data.');
        console.error('Error fetching dashboard data:', err);
        if (baseAxios.isAxiosError(err)) {
          console.log('Axios error response:', err.response);
          setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
          if (err.response?.status === 401) {
            router.push('/vendor/login');
          }
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
        console.log('fetchDashboardData function completed');
      }
    };

    console.log('Calling fetchDashboardData from useEffect');
    fetchDashboardData(); // Initial fetch

    // Set up a refresh interval for notifications (e.g., every 30 seconds)
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 text-blue-500">
            <Spinner />
          </div>
          <p className="ml-2 text-lg">Loading dashboard...</p>
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

  return (
    <div className="bg-slate-50 relative">
      {/* Clean Light Background with Subtle Accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 -z-10" />
      <div className="absolute inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)'
      }} />

      <div className="relative z-10 p-8">
        {/* Hero Header with Electric Blue Accent */}
        <div className="mb-12 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* Hero Brand Element */}
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl blur opacity-30 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Vendor Dashboard
                  </h1>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full mt-2 shadow-lg shadow-emerald-500/50" />
                </div>
              </div>
              <p className="text-slate-600 ml-20 text-lg">Your centralized vendor management and activity hub</p>
            </div>

            {/* Premium Status Glass Card */}
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-4 border border-slate-200/50 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping" />
                </div>
                <span className="text-sm text-slate-900 font-semibold">LIVE SYNC</span>
              </div>
              <div className="w-px h-6 bg-slate-300" />
              <div className="text-right">
                <p className="text-xs text-slate-500">Last sync</p>
                <p className="text-sm text-slate-900 font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <p className="text-base font-medium">{error}</p>
          </div>
        )}

        {/* Premium Data Visualization Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card
            className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group relative overflow-hidden cursor-pointer"
          >
            {/* Dynamic glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">New Orders</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{dashboardData?.newPurchaseOrders.length || 0}</p>
                  <p className="text-xs text-emerald-600 flex items-center font-semibold">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    READY FOR REVIEW
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/20">
                  <ShoppingCart className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">Bill Status</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{dashboardData?.billStatus.length || 0}</p>
                  <p className="text-xs text-blue-600 flex items-center font-semibold">
                    <FileText className="h-3 w-3 mr-1" />
                    ACTIVE BILLS
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">Notifications</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{notifications.length || 0}</p>
                  <p className="text-xs text-purple-600 flex items-center font-semibold">
                    <Bell className="h-3 w-3 mr-1" />
                    RECENT UPDATES
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/20">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">Pending Actions</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{dashboardData?.pendingActions.length || 0}</p>
                  <p className="text-xs text-amber-600 flex items-center font-semibold">
                    <Clock className="h-3 w-3 mr-1" />
                    {dashboardData?.pendingActions.length === 0 ? 'ALL CLEAR' : 'NEEDS ATTENTION'}
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-500/20">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content Column */}
          <div className="xl:col-span-8 space-y-6">
            {/* New Purchase Orders */}
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">New Purchase Orders</CardTitle>
                      <CardDescription className="text-slate-600">Recent orders requiring your attention</CardDescription>
                    </div>
                  </div>
                  <Link href="/vendor/purchase-orders">
                    <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6 relative">
                {dashboardData?.newPurchaseOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <ShoppingCart className="h-12 w-12 mb-3 text-slate-400" />
                    <p className="text-lg font-medium">No new purchase orders</p>
                    <p className="text-slate-600">Purchase orders will appear here when available</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {dashboardData?.newPurchaseOrders.slice(0, 3).map((po) => (
                        <div key={po._id} className="group bg-slate-50 rounded-lg p-4 border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <Link href={`/vendor/purchase-orders/${po._id}`}>
                                    <span className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer">
                                      PO #{po.orderNumber}
                                    </span>
                                  </Link>
                                  <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    po.status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : po.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                      : po.status === 'rejected'
                                      ? 'bg-red-100 text-red-700 border border-red-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-slate-600">
                                  <span className="font-medium">${po.totalAmount.toFixed(2)}</span>
                                  <span>{new Date(po.deliveryDate).toLocaleDateString()}</span>
                                  <span className="text-xs bg-slate-200 px-2 py-1 rounded">{po.items.length} items</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {po.pdfPath && (
                                <Button
                                  onClick={() => {
                                    const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/uploads/${po.pdfPath}`;
                                    window.open(pdfUrl, '_blank');
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                              <Link href={`/vendor/purchase-orders/${po._id}`}>
                                <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bill Status */}
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">Bill Status</CardTitle>
                      <CardDescription className="text-slate-600">Track your submitted bills</CardDescription>
                    </div>
                  </div>
                  <Link href="/vendor/bills">
                    <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6 relative">
                {dashboardData?.billStatus.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mb-3 text-slate-400" />
                    <p className="text-lg font-medium">No bills to display</p>
                    <p className="text-slate-600">Bill statuses will appear here when available</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {dashboardData?.billStatus.slice(0, 3).map((bill) => (
                        <div key={bill._id} className="group bg-slate-50 rounded-lg p-4 border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-slate-900">
                                    Bill #{bill.billNumber}
                                  </span>
                                  <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    bill.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : bill.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                      : bill.status === 'overdue'
                                      ? 'bg-red-100 text-red-700 border border-red-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-slate-600">
                                  <span className="font-medium">${bill.totalAmount.toFixed(2)}</span>
                                  <span>{new Date(bill.billDate).toLocaleDateString()}</span>
                                  <span className="text-xs bg-slate-200 px-2 py-1 rounded">PO #{bill.purchaseOrder?.orderNumber || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {bill.pdfFileName && (
                                <Button
                                  onClick={() => {
                                    const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URI}/uploads/bills/${bill.pdfFileName}`;
                                    window.open(pdfUrl, '_blank');
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                              <Link href={`/bills/${bill._id}`}>
                                <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            {/* Notifications */}
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">Notifications</CardTitle>
                      <CardDescription className="text-slate-600 text-sm">Latest updates</CardDescription>
                    </div>
                  </div>
                  {notifications.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                      {notifications.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 relative">
                <div className="max-h-80 overflow-y-auto">
                  <NotificationList notifications={notifications.slice(0, 5)} />
                </div>
                {notifications.length > 5 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 transition-colors text-sm">
                      View All Notifications ({notifications.length})
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Actions */}
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">Pending Actions</CardTitle>
                      <CardDescription className="text-slate-600 text-sm">Items needing attention</CardDescription>
                    </div>
                  </div>
                  {dashboardData?.pendingActions && dashboardData.pendingActions.length > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                      {dashboardData.pendingActions.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 relative">
                {dashboardData?.pendingActions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <CheckCircle className="h-12 w-12 mb-3 text-slate-400" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-slate-600">No pending actions at this time</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {dashboardData?.pendingActions.slice(0, 3).map((action) => (
                        <div key={action.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">{action.description}</h4>
                          <div className="flex items-center gap-2 text-xs text-amber-700">
                            <Clock className="h-3 w-3" />
                            <span>Due: {action.dueDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {dashboardData.pendingActions.length > 3 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 transition-colors text-sm">
                          View All Actions ({dashboardData.pendingActions.length})
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;