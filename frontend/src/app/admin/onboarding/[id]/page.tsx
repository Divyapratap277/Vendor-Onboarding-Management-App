'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { configuredAxios as configuredAxiosInstance } from '@/lib/auth';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  PenTool,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertTriangle,
  Calendar,
  Briefcase,
  Eye
} from 'lucide-react';

interface Vendor {
  _id: string;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface Document {
  fileName: string;
  fileKey: string;
  fileType: string;
}

interface SubmissionDetail {
  _id: string;
  businessName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  servicesOffered: string[];
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  documents: Document[];
  signedOnboardingPdf?: Document;
  digitalSignature?: string;
  rejectionReason?: string;
}

const AdminOnboardingDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<{ [key: string]: string }>({});
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc);
    setZoomLevel(1);
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
  };

  const fetchDownloadUrl = useCallback(async (fileKey: string) => {
    const directUrl = `/uploads/${fileKey.split('uploads/')[1]}`;
    setDownloadUrls((prev) => ({ ...prev, [fileKey]: directUrl }));
  }, []);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchSubmission = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await configuredAxiosInstance.get(`/api/admin/onboarding/${id}`);
        setSubmission(response.data.submission);
        if (response.data.submission.documents) {
          response.data.submission.documents.forEach((doc: Document) => {
            fetchDownloadUrl(doc.fileKey);
          });
        }
        if (response.data.submission.signedOnboardingPdf) {
          fetchDownloadUrl(response.data.submission.signedOnboardingPdf.fileKey);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch submission details.');
          if (err.response?.status === 401) {
            router.push('/admin/login');
          } else if (err.response?.status === 404) {
            setError('Vendor submission not found.');
          }
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [id, fetchDownloadUrl, router]);

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    setError(null);
    try {
      const url = `/api/admin/onboarding/${id}/${action}`;
      const payload = action === 'reject' ? { reason: rejectionReason } : {};

      if (action === 'reject' && !rejectionReason.trim()) {
        setError('Rejection reason cannot be empty.');
        setIsProcessing(false);
        return;
      }

      await configuredAxiosInstance.put(url, payload);
      alert(`Submission ${action}d successfully!`);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || `Failed to ${action} submission.`);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-600 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-500 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col items-center max-w-md w-full">
          <div className="bg-blue-600 p-4 rounded-full mb-6">
            <Spinner className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Loading Vendor Details
          </h2>
          <p className="text-lg text-slate-600 text-center">
            Please wait while we fetch the onboarding information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          <CardHeader className="bg-red-500 text-white p-8 text-center">
            <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold mb-3">
              Error Loading Details
            </CardTitle>
            <CardDescription className="text-red-100 text-lg leading-relaxed">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          <CardHeader className="bg-slate-500 text-white p-8 text-center">
            <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold mb-3">
              Submission Not Found
            </CardTitle>
            <CardDescription className="text-slate-100 text-lg leading-relaxed">
              The requested vendor submission could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Link href="/admin/dashboard" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/admin/dashboard" passHref>
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <Card className="bg-white shadow-sm border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                      Vendor Application Review
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mt-1">
                      Complete onboarding details for {submission.businessName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getStatusColor(
                      submission.status
                    )} px-4 py-2 text-lg font-bold border`}
                  >
                    {getStatusIcon(submission.status)}
                    {submission.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Rejection Reason Alert */}
          {submission?.rejectionReason && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-red-500 mb-2">
                  Application Rejected
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong>Reason:</strong> {submission.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Contact Information */}
              <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
                <CardHeader className="bg-slate-50 rounded-t-lg p-4">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <User className="h-6 w-6 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600">Contact Person</p>
                      <p className="text-base font-semibold text-slate-900">
                        {submission?.contactPerson}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600">Email Address</p>
                      <p className="text-base font-semibold text-slate-900">
                        {submission?.contactEmail}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600">Phone Number</p>
                      <p className="text-base font-semibold text-slate-900">
                        {submission?.contactPhone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
                <CardHeader className="bg-slate-50 rounded-t-lg p-4">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-green-500" />
                    Business Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {submission?.address?.street}
                        </p>
                        <p className="text-sm text-slate-600">
                          {submission?.address?.city}, {submission?.address?.state}{' '}
                          {submission?.address?.zipCode}
                        </p>
                        <p className="text-sm text-slate-600">
                          {submission?.address?.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services Offered */}
              <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
                <CardHeader className="bg-slate-50 rounded-t-lg p-4">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                    Services Offered
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {submission?.servicesOffered?.map((service, index) => (
                      <Badge
                        key={index}
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2 text-sm font-medium border border-blue-200 transition-colors duration-200"
                      >
                        <Briefcase className="h-3 w-3 mr-1" />
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Bank Details */}
              <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
                <CardHeader className="bg-slate-50 rounded-t-lg p-4">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-green-500" />
                    Banking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600">
                        Account Holder
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {submission?.bankDetails?.accountHolderName}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600">
                        Account Number
                      </p>
                      <p className="text-base font-semibold text-slate-900 font-mono">
                        {submission?.bankDetails?.accountNumber}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600">IFSC Code</p>
                      <p className="text-base font-semibold text-slate-900 font-mono uppercase">
                        {submission?.bankDetails?.ifscCode}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600">Bank Name</p>
                      <p className="text-base font-semibold text-slate-900">
                        {submission?.bankDetails?.bankName}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">
                      Branch Location
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {submission?.bankDetails?.branch}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Uploaded Documents */}
              <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
                <CardHeader className="bg-slate-50 rounded-t-lg p-4">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Business Documents
                    {submission?.documents && submission.documents.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                        {submission.documents.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {submission?.documents && submission.documents.length > 0 ? (
                    <div className="space-y-4">
                      {submission.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-medium text-slate-900 truncate">
                                {doc.fileName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {doc.fileType}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(doc)}
                            className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300 transition-all duration-200 flex items-center gap-2 flex-shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-base text-slate-600">
                        No additional documents uploaded
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Digital Signature */}
              <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
                <CardHeader className="bg-slate-50 rounded-t-lg p-4">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <PenTool className="h-6 w-6 text-blue-600" />
                    Digital Signature
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {submission?.digitalSignature ? (
                    <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <img
                        src={submission.digitalSignature}
                        alt="Vendor Signature"
                        className="border border-slate-200 rounded-lg bg-white shadow-sm mx-auto"
                        style={{ maxWidth: '400px', height: 'auto' }}
                      />
                      <p className="text-sm text-slate-600 mt-3">
                        Verified digital signature
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <PenTool className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-base text-slate-600">
                        No digital signature provided
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Signed Onboarding PDF */}
          {submission?.signedOnboardingPdf && (
            <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
              <CardHeader className="bg-slate-50 rounded-t-lg p-6">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <Download className="h-6 w-6 text-blue-600" />
                  Completed Application
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 mt-2">
                  Signed and processed onboarding document
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900">
                      {submission.signedOnboardingPdf.fileName}
                    </p>
                    <p className="text-base text-slate-600">
                      Complete vendor application with digital signatures
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {submission.signedOnboardingPdf &&
                      !downloadUrls[submission.signedOnboardingPdf.fileKey] && (
                        <Spinner className="h-5 w-5 text-blue-600" />
                      )}
                    <Button
                      onClick={(e) => {
                        if (
                          submission.signedOnboardingPdf &&
                          !downloadUrls[submission.signedOnboardingPdf.fileKey]
                        ) {
                          e.preventDefault();
                          fetchDownloadUrl(
                            submission.signedOnboardingPdf.fileKey
                          );
                        } else if (submission.signedOnboardingPdf) {
                          window.open(
                            downloadUrls[
                              submission.signedOnboardingPdf.fileKey
                            ] || '#',
                            '_blank'
                          );
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      View PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons for Pending Status */}
          {submission?.status === 'pending' && (
            <Card className="bg-white shadow-sm border border-slate-200 rounded-lg">
              <CardHeader className="bg-slate-50 rounded-t-lg p-8">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-slate-900">
                      Pending Review
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600 mt-2">
                      This vendor application requires your approval or rejection
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label
                    htmlFor="rejectionReason"
                    className="text-base font-semibold text-slate-900 flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Rejection Reason
                    <span className="text-sm text-slate-500 font-normal">
                      (Required if rejecting)
                    </span>
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason if you decide to reject this application..."
                    rows={4}
                    className="w-full text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200 resize-none"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-base font-semibold py-4 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="h-5 w-5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Approve Application
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-base font-semibold py-4 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <Spinner className="h-5 w-5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        Reject Application
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Document Viewer Dialog */}
      {viewingDocument && (
        <Dialog open onOpenChange={handleCloseViewer}>
          <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-6 bg-white shadow-sm border border-slate-200 rounded-lg">
            <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-200">
              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      {viewingDocument.fileName}
                    </DialogTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Document Viewer
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel((prev) => Math.max(0.2, prev - 0.1))}
                    className="bg-white hover:bg-slate-50 border-slate-300 text-slate-600 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <ZoomOut className="h-4 w-4" />
                    Zoom Out
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(1)}
                    className="bg-white hover:bg-slate-50 border-slate-300 text-slate-600 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <RotateCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel((prev) => prev + 0.1)}
                    className="bg-white hover:bg-slate-50 border-slate-300 text-slate-600 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <ZoomIn className="h-4 w-4" />
                    Zoom In
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 w-full h-full overflow-auto bg-slate-50 rounded-lg border border-slate-200">
              <div
                style={{
                  width: `${100 / zoomLevel}%`,
                  height: `${100 / zoomLevel}%`,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                }}
              >
                <iframe
                  src={`${
                    process.env.NEXT_PUBLIC_BACKEND_URI
                  }/uploads/${viewingDocument.fileKey.split(/[/]/).pop()}`}
                  className="w-full h-full border-0 rounded-lg"
                  title={viewingDocument.fileName}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminOnboardingDetail;