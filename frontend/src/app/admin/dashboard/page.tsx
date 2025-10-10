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

  // Dashboard metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState({
    performanceMetrics: {
      conversionRate: 0,
      avgProcessingDays: 0,
      growthRate: 0,
      qualityScore: 'N/A'
    },
    systemHealth: {
      score: 0,
      status: 'Loading...'
    },
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    successRate: 0,
    avgProcessingTime: '0 days',
    chartData: [],
    rejectionReasons: {
      documentation: 0,
      compliance: 0
    }
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

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

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        const response = await configuredAxiosInstance.get('/api/users/dashboard-data');
        if (response.data.success) {
          setDashboardMetrics(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboardData();
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
  const totalVendors = vendors.length;

  // Calculate percentages for progress indicators
  const pendingPercentage = totalVendors > 0 ? (pendingVendors.length / totalVendors) * 100 : 0;
  const approvedPercentage = totalVendors > 0 ? (approvedVendors.length / totalVendors) * 100 : 0;
  const rejectedPercentage = totalVendors > 0 ? (rejectedVendors.length / totalVendors) * 100 : 0;


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

  // Show spinner if vendors, notifications, or dashboard data are loading
  if (vendors.length === 0 && (loadingNotifications || loadingDashboard)) {
    return <Spinner />;
  }

  return (
    <div className="bg-slate-50 relative">
      {/* Clean Light Background with Subtle Accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 -z-10" />
      <div className="absolute inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)'
      }} />
      
      <div className="relative z-10 p-8">
        {/* Hero Header with Electric Teal Accent */}
        <div className="mb-12 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* Hero Brand Element */}
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl blur opacity-30 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Vendor Command Center
                  </h1>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mt-2 shadow-lg shadow-blue-500/50" />
                </div>
              </div>
              <p className="text-slate-600 ml-20 text-lg">Real-time vendor intelligence and management hub</p>
            </div>
            
            {/* Premium Status Glass Card */}
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-4 border border-slate-200/50 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping" />
                </div>
                <span className="text-sm text-slate-900 font-semibold">LIVE SYSTEM</span>
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
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-base font-medium">{error}</p>
        </div>
      )}

        {/* Premium Data Visualization Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card 
            className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group relative overflow-hidden cursor-pointer"
            onClick={() => router.push('/admin/vendors')}
          >
            {/* Dynamic glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">Pending Review</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{pendingVendors.length}</p>
                  <p className="text-xs text-yellow-600 flex items-center font-semibold">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    URGENT ACTION REQUIRED
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-yellow-500/20">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              {/* Premium Ring Chart */}
              <div className="flex items-center justify-between">
                <div className="relative h-16 w-16">
                  <svg className="h-16 w-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray={`${totalVendors > 0 ? (pendingVendors.length / totalVendors) * 175.9 : 0} 175.9`}
                      className="text-yellow-600 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-600">{totalVendors > 0 ? Math.round((pendingVendors.length / totalVendors) * 100) : 0}%</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-slate-500 uppercase">Avg. Processing</p>
                  <p className="text-lg text-slate-900 font-bold">{dashboardMetrics.avgProcessingTime}</p>
                  <p className="text-xs text-yellow-600">⚡ Priority Queue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card 
            className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group relative overflow-hidden cursor-pointer"
            onClick={() => router.push('/admin/vendors')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">Active Partners</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{approvedVendors.length}</p>
                  <p className="text-xs text-emerald-400 flex items-center font-semibold">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    +{dashboardMetrics.weeklyGrowth} THIS WEEK
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              {/* Dynamic Bar Chart */}
              <div className="space-y-3">
                <div className="flex items-end justify-between h-12 gap-1">
                  {[65, 78, 45, 89, 67, 82, 74].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div 
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-sm transition-all duration-1000 delay-100"
                        style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 text-center uppercase tracking-wide">7-day onboarding velocity</p>
              </div>
            </CardContent>
          </Card>
        
          <Card 
            className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl hover:shadow-red-500/10 transition-all duration-500 group relative overflow-hidden cursor-pointer"
            onClick={() => router.push('/admin/vendors')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-400 rounded-full" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">Declined</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{rejectedVendors.length}</p>
                  <p className="text-xs text-red-400 flex items-center font-semibold">
                    <XCircle className="h-3 w-3 mr-1" />
                    REVIEW REQUIRED
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-red-500/20">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              {/* Rejection Reasons Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase">Documentation</span>
                  <div className="flex-1 mx-3 bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${dashboardMetrics.rejectionReasons.documentation}%` }} />
                  </div>
                  <span className="text-xs text-red-400 font-semibold w-8">{dashboardMetrics.rejectionReasons.documentation}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase">Compliance</span>
                  <div className="flex-1 mx-3 bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${dashboardMetrics.rejectionReasons.compliance}%` }} />
                  </div>
                  <span className="text-xs text-red-400 font-semibold w-8">{dashboardMetrics.rejectionReasons.compliance}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="border border-slate-200/50 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-500 group relative overflow-hidden">
            {/* Hero accent glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">System Alerts</p>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{unreadNotificationsCount}</p>
                  <p className="text-xs text-blue-600 flex items-center font-semibold">
                    <Bell className="h-3 w-3 mr-1" />
                    {unreadNotificationsCount > 0 ? 'NEEDS ATTENTION' : 'ALL CLEAR'}
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20 relative">
                  <Bell className="h-8 w-8 text-blue-600" />
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-xs font-bold text-white">{Math.min(unreadNotificationsCount, 9)}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Real-time Activity Pulse */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="h-6 w-1 bg-blue-600 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Live Feed</span>
                </div>
                <p className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HERO: Recent Activity Analytics - Full Width */}
        <Card className="border border-slate-200/50 bg-white/30 backdrop-blur-xl shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-700 mb-12 overflow-hidden relative">
          {/* Dynamic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-600/5" />
          <CardHeader className="border-b border-slate-200/50 pb-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-1">Vendor Intelligence Dashboard</CardTitle>
                  <p className="text-slate-600">30-day analytics, predictive insights, and growth metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{vendors.length}</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Total Network</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-400">+{dashboardMetrics.monthlyGrowth}</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">This Month</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{dashboardMetrics.successRate}%</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Success Rate</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart Area */}
              <div className="lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Vendor Onboarding Velocity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-blue-600 rounded-full" />
                      <span className="text-sm text-slate-600">Applications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-emerald-400 rounded-full" />
                      <span className="text-sm text-slate-600">Approvals</span>
                    </div>
                  </div>
                </div>
                {/* Premium SVG Chart */}
                <div className="h-80 w-full bg-slate-100/50 rounded-2xl p-6 border border-slate-200/30 relative overflow-hidden">
                  {/* Chart background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                  <svg className="w-full h-full relative z-10" viewBox="0 0 800 280">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/> 
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Grid lines */}
                    {[60, 120, 180, 240].map((y) => (
                      <line key={y} x1="40" y1={y} x2="760" y2={y} stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
                    ))}
                    {/* Area fill */}
                    <polygon
                      fill="url(#areaGradient)"
                      points="80,220 150,200 220,160 290,140 360,150 430,120 500,130 570,100 640,110 710,80 750,90 750,260 80,260"
                    />
                    {/* Main trend line */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      filter="url(#glow)"
                      points="80,220 150,200 220,160 290,140 360,150 430,120 500,130 570,100 640,110 710,80 750,90"
                    />
                    {/* Approval line */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      points="80,240 150,230 220,190 290,170 360,180 430,150 500,160 570,130 640,140 710,110 750,120"
                    />
                    {/* Interactive points */}
                    {[[710, 80], [750, 90], [640, 110]].map(([x, y], i) => (
                      <g key={i}>
                        <circle cx={x} cy={y} r="4" fill="#3b82f6" />
                        <circle cx={x} cy={y} r="8" fill="#3b82f6" opacity="0.2" className="animate-ping" />
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
              
              {/* Insights Sidebar */}
              <div className="space-y-6">
                <div className="bg-white/50 rounded-2xl p-6 border border-slate-200/30 backdrop-blur-xl">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Conversion Rate</span>
                      <span className="text-xl font-bold text-emerald-400">{dashboardMetrics.performanceMetrics.conversionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Avg. Processing</span>
                      <span className="text-xl font-bold text-blue-600">{dashboardMetrics.performanceMetrics.avgProcessingDays}d</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Growth Rate</span>
                      <span className="text-xl font-bold text-slate-900">+{dashboardMetrics.performanceMetrics.growthRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Quality Score</span>
                      <span className="text-xl font-bold text-yellow-400">{dashboardMetrics.performanceMetrics.qualityScore}</span>
                    </div>
                  </div>
                </div>
                
                {/* Glassmorphism Performance Score */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20 backdrop-blur-xl relative overflow-hidden">
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)'
                  }} />
                  <h4 className="text-lg font-bold text-slate-900 mb-4 relative">System Health</h4>
                  <div className="flex items-center gap-4 relative">
                    <div className="relative h-16 w-16">
                      <svg className="h-16 w-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                        <circle 
                          cx="32" 
                          cy="32" 
                          r="28" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray="150 175.9"
                          className="text-blue-600 transition-all duration-2000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">{dashboardMetrics.systemHealth.score}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900">{dashboardMetrics.systemHealth.status}</p>
                      <p className="text-sm text-slate-600">All systems operational</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Pending and Rejected Vendors */}
        <div className="xl:col-span-4 space-y-6">
          {/* Pending Vendors */}
          {/* <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
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
            <CardContent className="p-4 max-h-80 overflow-y-auto">
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
          </Card> */}

          {/* Rejected Vendors */}
          {/* <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
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
            <CardContent className="p-4 max-h-80 overflow-y-auto">
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
                          <TooltipContent className="bg-white text-slate-900 p-3 rounded-lg shadow-xl border border-slate-200">
                            <p className="text-base font-medium">Rejection Reason:</p>
                            <p className="text-base text-slate-700 mt-1">{vendor.rejectionReason}</p>
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
          </Card> */}
        </div>

        {/* Center Column: Approved Vendors and Quick Actions */}
        {/* <div className="xl:col-span-4 space-y-6"> */}
          {/* Approved Vendors */}
          {/* <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
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
            <CardContent className="p-4 max-h-80 overflow-y-auto">
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
          </Card> */}

          {/* Quick Actions
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
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
        {/* <Card className="xl:col-span-4 bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              Notifications
            </CardTitle>
            {unreadNotificationsCount > 0 && (
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-base">
                {unreadNotificationsCount} Unread
              </Badge>
            )}
          </CardHeader>  */} 
          {/* <CardContent className="p-4 max-h-96 overflow-y-auto">
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
          </CardContent> */}
        {/* </Card> */}
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
