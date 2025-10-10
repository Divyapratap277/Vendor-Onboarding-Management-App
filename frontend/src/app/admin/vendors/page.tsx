'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { configuredAxios as configuredAxiosInstance } from '@/lib/auth';
import baseAxios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { Users, Building2, Mail, User, CheckCircle, XCircle, Clock, Eye, ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Vendor {
  _id: string;
  businessName: string; // Changed from companyName to businessName to match backend
  contactPerson: string;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  // Add other fields you might want to display or use for navigation,
  // e.g., address, servicesOffered, etc., if your backend's getAllVendors returns them.
}

const ApprovedVendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await configuredAxiosInstance.get('/api/admin/vendors');
        setVendors(response.data);
        setFilteredVendors(response.data);
      } catch (err: unknown) {
        console.error('Error fetching vendors:', err);
        if (baseAxios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch vendors.');
          if (err.response?.status === 401) {
            router.push('/admin/login');
          }
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [router]);

  // Filter vendors based on search term and status
  useEffect(() => {
    let filtered = vendors;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }
    
    setFilteredVendors(filtered);
  }, [vendors, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusCounts = {
    total: vendors.length,
    approved: vendors.filter(v => v.status === 'approved').length,
    pending: vendors.filter(v => v.status === 'pending').length,
    rejected: vendors.filter(v => v.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center max-w-md w-full">
          <Spinner className="h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Loading Vendors</h2>
          <p className="text-slate-600 text-center">Please wait while we fetch the vendor database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white shadow-sm border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">Error Loading Vendors</CardTitle>
            <CardDescription className="text-slate-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Vendor Management</h1>
          <p className="text-slate-600">Manage and oversee all vendor registrations and partnerships</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                  <p className="text-3xl font-bold text-slate-900">{statusCounts.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-3xl font-bold text-slate-900">{statusCounts.approved}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-slate-900">{statusCounts.pending}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Rejected</p>
                  <p className="text-3xl font-bold text-slate-900">{statusCounts.rejected}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Section */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-600" />
              Search & Filter
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find vendors by company name, contact person, or email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white text-slate-900"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Showing {filteredVendors.length} of {vendors.length} vendors
            </div>
          </CardContent>
        </Card>

        {/* Vendor Directory */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-600" />
              Vendor Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVendors.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredVendors.map((vendor) => (
                  <Card 
                    key={vendor._id} 
                    className="border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/admin/onboarding/${vendor._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-slate-900 truncate flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            {vendor.businessName}
                          </CardTitle>
                        </div>
                        <Badge className={`${getStatusColor(vendor.status)} flex items-center gap-1 px-2 py-1 text-xs font-medium border`}>
                          {getStatusIcon(vendor.status)}
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm truncate">{vendor.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm truncate">{vendor.contactEmail}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 p-6 bg-slate-100 rounded-full w-fit">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Vendors Found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No vendors have been registered yet'}
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button 
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApprovedVendorsPage;
