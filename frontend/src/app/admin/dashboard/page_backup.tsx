'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { configuredAxios as configuredAxiosInstance } from '@/lib/auth';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Spinner from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Users, ShoppingCart, FileText, Bell, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Vendor {
  _id: string;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface Notification {
  _id: string;
  recipient: string;
  message: string;
  type: string;
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
  const router = useRouter();
  console.log("Admin Dashboard component rendered");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Fetch Vendors (existing logic)
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await configuredAxiosInstance.get('/api/admin/onboarding');
        setVendors(res.data.submissions);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch vendors');
          if (err.response?.status === 401) {
            router.push('/admin/login');
          }
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchVendors();
  }, [router]);

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const response = await configuredAxiosInstance.get('/api/notifications');
        setNotifications(response.data);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError(err.response?.data?.message || 'Failed to load notifications.');
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();

    // Set up a refresh interval for notifications (e.g., every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await configuredAxiosInstance.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Optionally, show a toast or alert to the user
    }
  };

  const pendingVendors = vendors.filter((v) => v.status === 'pending');
  const approvedVendors = vendors.filter((v) => v.status === 'approved');
  const rejectedVendors = vendors.filter((v) => v.status === 'rejected');

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;


  const handleLogout = async () => {
    try {
      await configuredAxiosInstance.post('/api/auth/logout');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleInitiateOnboarding = () => {
    router.push('/admin/onboarding/initiate');
  };

  const handleApprove = async (vendorId: string) => {
    setIsProcessingAction(vendorId);
    try {
      await configuredAxiosInstance.put(`/api/admin/onboarding/${vendorId}/approve`);
      setVendors(vendors.map(v => v._id === vendorId ? { ...v, status: 'approved' } : v));
    } catch (error: unknown) {
      console.error('Failed to approve vendor', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to approve vendor');
      } else {
        setError('An unexpected error occurred during approval');
      }
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setIsProcessingAction(vendorId);
    try {
      await configuredAxiosInstance.put(`/api/admin/onboarding/${vendorId}/reject`, { reason });
      setVendors(vendors.map(v => v._id === vendorId ? { ...v, status: 'rejected', rejectionReason: reason } : v));
    } catch (error: unknown) {
      console.error('Failed to reject vendor', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to reject vendor');
      } else {
        setError('An unexpected error occurred during rejection');
      }
    } finally {
      setIsProcessingAction(null);
    }
  };

  // Show spinner if either vendors or notifications are loading
  if (vendors.length === 0 && loadingNotifications) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-base font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-base font-medium">Pending Vendors</p>
                <p className="text-4xl font-bold">{pendingVendors.length}</p>
              </div>
              <div className="bg-blue-400 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-base font-medium">Approved Vendors</p>
                <p className="text-4xl font-bold">{approvedVendors.length}</p>
              </div>
              <div className="bg-green-400 p-3 rounded-full">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-base font-medium">Rejected Vendors</p>
                <p className="text-4xl font-bold">{rejectedVendors.length}</p>
              </div>
              <div className="bg-red-400 p-3 rounded-full">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-base font-medium">Notifications</p>
                <p className="text-4xl font-bold">{unreadNotificationsCount}</p>
              </div>
              <div className="bg-purple-400 p-3 rounded-full">
                <Bell className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 h-[calc(100vh-16rem)]">
        {/* Left Column: Pending and Rejected Vendors */}
        <div className="xl:col-span-4 space-y-6 h-full flex flex-col">
          {/* Pending Vendors */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Pending Vendors
                {pendingVendors.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {pendingVendors.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {pendingVendors.length > 0 ? (
                <div className="space-y-3">
                  {pendingVendors.map((vendor) => (
                    <div key={vendor._id} className="group bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <Button
                          variant="link"
                          onClick={() => router.push(`/admin/onboarding/${vendor._id}`)}
                          className="text-lg font-semibold text-blue-700 hover:text-blue-900 px-0 h-auto group-hover:text-blue-800 transition-colors"
                        >
                          {vendor.companyName}
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(vendor._id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            disabled={isProcessingAction === vendor._id}
                          >
                            {isProcessingAction === vendor._id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleReject(vendor._id)}
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            disabled={isProcessingAction === vendor._id}
                          >
                            {isProcessingAction === vendor._id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No pending vendors</p>
                  <p className="text-base">All vendors have been processed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejected Vendors */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-50 rounded-t-lg">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected Vendors
                {rejectedVendors.length > 0 && (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                    {rejectedVendors.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {rejectedVendors.length > 0 ? (
                <div className="space-y-3">
                  {rejectedVendors.map((vendor) => (
                    <div key={vendor._id} className="group bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200 hover:from-red-100 hover:to-red-200 transition-all duration-200">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="link"
                              onClick={() => router.push(`/admin/onboarding/${vendor._id}`)}
                              className="text-lg font-semibold text-red-700 hover:text-red-900 px-0 h-auto group-hover:text-red-800 transition-colors"
                            >
                              {vendor.companyName}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
                            <p className="text-base font-medium">Rejection Reason:</p>
                            <p className="text-base text-gray-200 mt-1">{vendor.rejectionReason}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <XCircle className="h-12 w-12 mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No rejected vendors</p>
                  <p className="text-base">All vendors are approved or pending</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Approved Vendors and Quick Actions */}
        <div className="xl:col-span-4 space-y-6 h-full flex flex-col">
          {/* Approved Vendors */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-50 rounded-t-lg">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approved Vendors
                {approvedVendors.length > 0 && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    {approvedVendors.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {approvedVendors.length > 0 ? (
                <div className="space-y-3">
                  {approvedVendors.map((vendor) => (
                    <div key={vendor._id} className="group bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200">
                      <Button
                        variant="link"
                        onClick={() => router.push(`/admin/onboarding/${vendor._id}`)}
                        className="text-lg font-semibold text-green-700 hover:text-green-900 px-0 h-auto group-hover:text-green-800 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        {vendor.companyName}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No approved vendors</p>
                  <p className="text-base">Vendors will appear here once approved</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 border-0" onClick={() => router.push('/admin/vendors')}>
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="bg-blue-400 p-2 rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">Manage Vendors</CardTitle>
                      <CardDescription className="text-blue-100 text-base">View and manage all vendor accounts</CardDescription>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 border-0" onClick={() => router.push('/admin/purchase-orders')}>
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="bg-indigo-400 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">Purchase Orders</CardTitle>
                      <CardDescription className="text-indigo-100 text-base">Create and track all purchase orders</CardDescription>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 border-0" onClick={() => router.push('/admin/bills')}>
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="bg-purple-400 p-2 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">Manage Bills</CardTitle>
                      <CardDescription className="text-purple-100 text-base">View and manage all vendor bills</CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Notifications */}
        <Card className="xl:col-span-4 bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 h-full flex flex-col min-h-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              Notifications
            </CardTitle>
            {unreadNotificationsCount > 0 && (
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-base">
                {unreadNotificationsCount} Unread
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto">
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mb-3 text-gray-400" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-base">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`group rounded-lg p-4 border transition-all duration-200 ${
                      notif.isRead 
                        ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                        : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className={`h-4 w-4 ${
                            notif.isRead ? 'text-gray-400' : 'text-purple-600'
                          }`} />
                          <p className={`text-base font-semibold ${
                            notif.isRead ? 'text-gray-600' : 'text-purple-800'
                          }`}>
                            {notif.type.replace(/_/g, ' ')}
                          </p>
                          {!notif.isRead && (
                            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className={`text-base mb-2 ${
                          notif.isRead ? 'text-gray-600' : 'text-gray-800'
                        }`}>
                          {notif.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!notif.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="text-sm h-auto py-2 px-4 hover:bg-purple-100 text-purple-700 hover:text-purple-900 transition-colors"
                          >
                            Mark as Read
                          </Button>
                        )}
                        {notif.relatedId && (
                          <Link 
                            href={`${notif.relatedModel === 'PurchaseOrder' ? '/admin/purchase-orders' : notif.relatedModel === 'Bill' ? '/admin/bills' : '/admin/vendors'}/${notif.relatedId}`}
                            passHref
                          >
                            <Button variant="link" size="sm" className="text-sm h-auto py-2 px-4 text-indigo-600 hover:text-indigo-800 transition-colors">
                              View Details →
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
