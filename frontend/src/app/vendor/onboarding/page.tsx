'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { User, Building2, Mail, Phone, MapPin, CreditCard, Upload, FileText, PenTool, CheckCircle, ArrowRight, ArrowLeft, Edit, Eye, Trash2, RotateCcw, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';


// Define Zod schema for form validation
const onboardingFormSchema = z.object({
  businessName: z.string().min(1, { message: 'Business Name is required.' }),
  businessRegistrationNumber: z.string().optional(),
  contactPerson: z.string().min(1, { message: 'Full Name is required.' }),
  contactEmail: z.string().email({ message: 'Invalid email address.' }),
  contactPhone: z.string().min(10, { message: 'Contact Phone is required and must be at least 10 digits.' }),
  alternatePhone: z.string().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Confirm Password must be at least 6 characters.' }),
  address: z.object({
    street: z.string().min(1, { message: 'Street is required.' }),
    city: z.string().min(1, { message: 'City is required.' }),
    state: z.string().min(1, { message: 'State is required.' }),
    zipCode: z.string().min(1, { message: 'Zip Code is required.' }),
    country: z.string().min(1, { message: 'Country is required.' }),
  }),
  servicesOffered: z.array(z.string()).min(1, { message: 'At least one service must be offered.' }),
  bankDetails: z.object({
    accountHolderName: z.string().min(1, { message: 'Account Holder Name is required.' }),
    accountNumber: z.string().min(1, { message: 'Account Number is required.' }),
    ifscCode: z.string().min(1, { message: 'IFSC Code is required.' }),
    bankName: z.string().min(1, { message: 'Bank Name is required.' }),
    branch: z.string().min(1, { message: 'Branch is required.' }),
  }),
  digitalSignature: z.string().optional(),
  uploadedDocuments: z.array(z.object({
    fileName: z.string(),
    fileKey: z.string(),
    fileType: z.string(),
    fileUrl: z.string(), // Add fileUrl to the Zod schema
  })).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

interface UploadedDocument {
  fileName: string;
  fileKey: string;
  fileType: string;
  fileUrl: string; // Add fileUrl to the interface
}

const steps = [
  { id: 'step1', name: 'Basic Information' },
  { id: 'step2', name: 'Business Info' },
  { id: 'step3', name: 'Address Info' },
  { id: 'step4', name: 'Bank Details' },
  { id: 'step5', name: 'Documents & Signature' },
  { id: 'review', name: 'Review & Submit' },
];

const VendorOnboardingPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; vendorName?: string; vendorEmail?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [signatureImageFile, setSignatureImageFile] = useState<File | null>(null);
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw');
  const sigCanvas = useRef<unknown>(null);
  const [viewingDocument, setViewingDocument] = useState<UploadedDocument | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleViewDocument = (doc: UploadedDocument) => {
    setViewingDocument(doc);
    setZoomLevel(1);
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
  };

  const handleRemoveDocument = (fileKeyToRemove: string) => {
    setUploadedDocuments((prevDocs) =>
      prevDocs.filter((doc) => doc.fileKey !== fileKeyToRemove)
    );
  };

  const handleClearSignature = () => {
    sigCanvas.current.clear();
    setValue('digitalSignature', '');
  };

  const handleSaveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    setValue('digitalSignature', sigCanvas.current.toDataURL('image/png'));
  };

  const handleSignatureImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSignatureImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('digitalSignature', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    getValues,
    setValue,
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      businessName: '',
      businessRegistrationNumber: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      alternatePhone: '',
      password: '',
      confirmPassword: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
      },
      servicesOffered: [],
      bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branch: '',
      },
      digitalSignature: '',
      uploadedDocuments: [],
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/onboarding/${token}`);
        setValidationResult(response.data);
        if (response.data.valid) {
          setValue('contactEmail', response.data.vendorEmail || '');
          setValue('contactPerson', response.data.vendorName || '');
        } else {
          setErrorMessage('Token is invalid or expired.');
        }
      } catch (error) {
        setValidationResult(null);
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data?.message || 'An unexpected error occurred during token validation.');
        } else {
          setErrorMessage('An unexpected error occurred during token validation.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setValidationResult(null);
      setErrorMessage('Token is missing in the URL. Please use the secure link provided by the admin.');
      setIsLoading(false);
    }
  }, [token, setValue]);

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await trigger(['contactPerson', 'contactEmail', 'contactPhone', 'alternatePhone', 'password', 'confirmPassword']);
    } else if (currentStep === 1) {
      isValid = await trigger(['businessName', 'businessRegistrationNumber', 'servicesOffered']);
    } else if (currentStep === 2) {
      isValid = await trigger(['address.street', 'address.city', 'address.state', 'address.zipCode', 'address.country']);
    } else if (currentStep === 3) {
      isValid = await trigger(['bankDetails.accountHolderName', 'bankDetails.accountNumber', 'bankDetails.ifscCode', 'bankDetails.bankName', 'bankDetails.branch']);
    } else if (currentStep === 4) {
      isValid = await trigger(['digitalSignature']);
      if (!getValues('digitalSignature')) {
        setErrorMessage('Digital Signature is required.');
        isValid = false;
      } else {
        setErrorMessage('');
      }
      if (uploadedDocuments.length === 0) {
        setErrorMessage('At least one document must be uploaded.');
        isValid = false;
      } else {
        setErrorMessage('');
      }
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !token) return;

    setIsUploading(true);
    setErrorMessage('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('token', token);
        formData.append('document', file);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/onboarding/confirm-upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Add the new document with its URL to the state
        setUploadedDocuments((prev) => [...prev, {
          fileName: response.data.fileName,
          fileKey: response.data.fileKey,
          fileType: response.data.fileType,
          fileUrl: response.data.fileUrl, // Save the URL
        }]);

      } catch (error: unknown) {
        console.error('Document upload error:', error);
        if (axios.isAxiosError(error)) {
          setErrorMessage(`Failed to upload ${file.name}: ${error?.response?.data?.message || error.message}`);
        } else {
          setErrorMessage(`Failed to upload ${file.name}: An unexpected error occurred.`);
        }
        break;
      }
    }
    setIsUploading(false);
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    setSubmissionStatus(null);
    setErrorMessage('');
    try {
      const payload = {
        ...data,
        token: token,
        documents: uploadedDocuments,
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/onboarding/complete`, payload);

      if (response.data.message) {
        setSubmissionStatus('success');
      } else {
        setSubmissionStatus('error');
        setErrorMessage(response.data.message || 'Submission failed.');
      }
    } catch (error: unknown) {
      console.error('Vendor onboarding submission error:', error);
      setSubmissionStatus('error');
      if (axios.isAxiosError(error)) {
        setErrorMessage(error?.response?.data?.message || 'An unexpected error occurred during submission.');
      } else {
        setErrorMessage('An unexpected error occurred during submission.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8 flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full mb-6">
            <Spinner className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Validating Access</h2>
          <p className="text-lg text-gray-600 text-center">Please wait while we verify your onboarding link...</p>
        </div>
      </div>
    );
  }

  if (!validationResult?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 text-center">
            <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 rotate-45" />
            </div>
            <CardTitle className="text-3xl font-bold mb-3">Access Denied</CardTitle>
            <CardDescription className="text-red-100 text-lg leading-relaxed">
              This onboarding link is invalid or has expired. Please contact your administrator for a new secure link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submissionStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
            <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold mb-3">Application Submitted!</CardTitle>
            <CardDescription className="text-green-100 text-lg leading-relaxed">
              Your vendor onboarding application has been successfully submitted for review.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-800 mb-2">What&apos;s Next?</h3>
              <p className="text-green-700 text-base">Our admin team will review your application and contact you within 2-3 business days.</p>
            </div>
            <p className="text-lg text-gray-600">Thank you for choosing to partner with us!</p>
          </CardContent>
        </Card>
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
        <div className="max-w-5xl mx-auto">
          {/* Hero Header with Modern Design */}
          <div className="mb-12 relative">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Hero Brand Element */}
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl blur opacity-30 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Vendor Onboarding Portal
                  </h1>
                  <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mt-2 shadow-lg shadow-blue-500/50" />
                </div>
              </div>
              <p className="text-slate-600 text-xl max-w-2xl mx-auto">
                Complete your vendor registration to join our trusted partner network
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <Card className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Progress Tracker</h3>
                    <p className="text-base text-slate-600">Step {currentStep + 1} of {steps.length}</p>
                  </div>
                </div>
                <div className="text-base text-slate-500">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </div>
              </div>

              <div className="flex justify-between items-center space-x-2 md:space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex-1 text-center transition-all duration-300">
                    <div className="relative flex items-center justify-center mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl shadow-blue-500/25 transform scale-110'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`absolute left-full top-1/2 w-full h-1 -translate-y-1/2 transition-colors duration-300 rounded-full ${
                          index < currentStep ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-slate-200'
                        }`} />
                      )}
                    </div>
                    <p className={`text-sm md:text-base font-semibold transition-colors duration-300 ${
                      index <= currentStep ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Form Card */}
          <Card className="border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                {currentStep === 0 && <><User className="h-6 w-6 text-blue-600" />Basic Information</>}
                {currentStep === 1 && <><Building2 className="h-6 w-6 text-blue-600" />Business Information</>}
                {currentStep === 2 && <><MapPin className="h-6 w-6 text-blue-600" />Address Details</>}
                {currentStep === 3 && <><CreditCard className="h-6 w-6 text-blue-600" />Banking Information</>}
                {currentStep === 4 && <><Upload className="h-6 w-6 text-blue-600" />Documents & Signature</>}
                {currentStep === 5 && <><CheckCircle className="h-6 w-6 text-blue-600" />Review & Submit</>}
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 mt-2">
                {currentStep === 0 && 'Enter your personal contact details'}
                {currentStep === 1 && 'Provide your business registration details'}
                {currentStep === 2 && 'Enter your complete business address'}
                {currentStep === 3 && 'Add your banking details for payments'}
                {currentStep === 4 && 'Upload required documents and signature'}
                {currentStep === 5 && 'Review all information before submission'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {currentStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="contactPerson" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Full Name
                  </Label>
                  <Controller
                    name="contactPerson"
                    control={control}
                    render={({ field }) => <Input id="contactPerson" placeholder="Enter your full name" {...field} className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.contactPerson && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.contactPerson.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="contactEmail" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-600" />
                    Contact Email
                  </Label>
                  <Controller
                    name="contactEmail"
                    control={control}
                    render={({ field }) => <Input id="contactEmail" type="email" placeholder="your.email@company.com" {...field} disabled={!!validationResult?.vendorEmail} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200 disabled:bg-gray-100" />}
                  />
                  {errors.contactEmail && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="contactPhone" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-indigo-600" />
                    Contact Phone
                  </Label>
                  <Controller
                    name="contactPhone"
                    control={control}
                    render={({ field }) => <Input id="contactPhone" type="tel" placeholder="+91 98765 43210" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.contactPhone && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.contactPhone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="alternatePhone" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    Alternate Phone <span className="text-sm text-gray-500">(Optional)</span>
                  </Label>
                  <Controller
                    name="alternatePhone"
                    control={control}
                    render={({ field }) => <Input id="alternatePhone" type="tel" placeholder="+91 98765 43210" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.alternatePhone && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.alternatePhone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-600" />
                    Password
                  </Label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => <Input id="password" type="password" placeholder="Create a secure password" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-600" />
                    Confirm Password
                  </Label>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => <Input id="confirmPassword" type="password" placeholder="Re-enter your password" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="businessName" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    Business Name
                  </Label>
                  <Controller
                    name="businessName"
                    control={control}
                    render={({ field }) => <Input id="businessName" placeholder="Your Company Name" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.businessName && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.businessName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="businessRegistrationNumber" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    Registration Number <span className="text-sm text-gray-500">(Optional)</span>
                  </Label>
                  <Controller
                    name="businessRegistrationNumber"
                    control={control}
                    render={({ field }) => <Input id="businessRegistrationNumber" placeholder="Business registration or UAN" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.businessRegistrationNumber && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.businessRegistrationNumber.message}
                    </p>
                  )}
                </div>
                <div className="col-span-full space-y-3">
                  <Label htmlFor="servicesOffered" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    Services Offered
                  </Label>
                  <Controller
                    name="servicesOffered"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="servicesOffered"
                        placeholder="e.g., Web Development, Graphic Design, Digital Marketing, Consulting"
                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                        onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0))}
                        className="min-h-[120px] text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200 resize-none"
                      />
                    )}
                  />
                  {errors.servicesOffered && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.servicesOffered.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">Separate multiple services with commas</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full space-y-3">
                  <Label htmlFor="street" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    Street Address
                  </Label>
                  <Controller
                    name="address.street"
                    control={control}
                    render={({ field }) => <Input id="street" placeholder="Enter your complete street address" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.address?.street && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.address.street.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    City
                  </Label>
                  <Controller
                    name="address.city"
                    control={control}
                    render={({ field }) => <Input id="city" placeholder="Your city" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.address?.city && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.address.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="state" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    State/Province
                  </Label>
                  <Controller
                    name="address.state"
                    control={control}
                    render={({ field }) => <Input id="state" placeholder="Your state or province" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.address?.state && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.address.state.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="zipCode" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-600" />
                    Postal Code
                  </Label>
                  <Controller
                    name="address.zipCode"
                    control={control}
                    render={({ field }) => <Input id="zipCode" placeholder="ZIP or postal code" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.address?.zipCode && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.address.zipCode.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="country" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    Country
                  </Label>
                  <Controller
                    name="address.country"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="country" className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">🇮🇳 India</SelectItem>
                          <SelectItem value="USA">🇺🇸 United States</SelectItem>
                          <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                          <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.address?.country && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.address.country.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="accountHolderName" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-600" />
                    Account Holder Name
                  </Label>
                  <Controller
                    name="bankDetails.accountHolderName"
                    control={control}
                    render={({ field }) => <Input id="accountHolderName" placeholder="Full name as per bank records" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.bankDetails?.accountHolderName && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.bankDetails.accountHolderName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="accountNumber" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-indigo-600" />
                    Account Number
                  </Label>
                  <Controller
                    name="bankDetails.accountNumber"
                    control={control}
                    render={({ field }) => <Input id="accountNumber" placeholder="Your bank account number" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.bankDetails?.accountNumber && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.bankDetails.accountNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="ifscCode" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    IFSC Code
                  </Label>
                  <Controller
                    name="bankDetails.ifscCode"
                    control={control}
                    render={({ field }) => <Input id="ifscCode" placeholder="Bank IFSC code (e.g., HDFC0001234)" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200 uppercase" />}
                  />
                  {errors.bankDetails?.ifscCode && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.bankDetails.ifscCode.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="bankName" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    Bank Name
                  </Label>
                  <Controller
                    name="bankDetails.bankName"
                    control={control}
                    render={({ field }) => <Input id="bankName" placeholder="Name of your bank" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.bankDetails?.bankName && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.bankDetails.bankName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="branch" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    Branch Location
                  </Label>
                  <Controller
                    name="bankDetails.branch"
                    control={control}
                    render={({ field }) => <Input id="branch" placeholder="Bank branch location" {...field} className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm transition-all duration-200" />}
                  />
                  {errors.bankDetails?.branch && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 rotate-45" />
                      {errors.bankDetails.branch.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-indigo-600" />
                    Document Upload
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Upload required business documents and provide your digital signature to complete the verification process.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="documents" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Business Documents
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-400 transition-colors duration-300 bg-gray-50 hover:bg-indigo-50">
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <Input 
                        id="documents" 
                        type="file" 
                        multiple 
                        onChange={handleDocumentUpload} 
                        disabled={isUploading} 
                        className="hidden" 
                      />
                      <label htmlFor="documents" className="cursor-pointer">
                        <div className="text-base font-medium text-gray-700 mb-1">
                          {isUploading ? 'Uploading documents...' : 'Choose files or drag and drop'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Business License, Tax ID, Registration Certificate, etc.
                        </div>
                        <div className="mt-3">
                          <Button 
                            type="button" 
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg" 
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <><Spinner className="h-4 w-4 mr-2" />Uploading...</>
                            ) : (
                              <><Upload className="h-4 w-4 mr-2" />Select Files</>
                            )}
                          </Button>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {uploadedDocuments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Uploaded Documents ({uploadedDocuments.length})
                      </p>
                      <div className="grid gap-3">
                        {uploadedDocuments.map((doc, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{doc.fileName}</p>
                                <p className="text-sm text-gray-500">{doc.fileType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument(doc)}
                                className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 px-3 py-2 rounded-lg"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveDocument(doc.fileKey)}
                                className="bg-white hover:bg-red-50 text-red-600 border-red-200 px-3 py-2 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <Label htmlFor="digitalSignature" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-indigo-600" />
                    Digital Signature
                  </Label>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant={signatureMethod === 'draw' ? 'default' : 'outline'}
                        onClick={() => {
                          setSignatureMethod('draw');
                          setSignatureImageFile(null);
                          setValue('digitalSignature', '');
                        }}
                        className={`px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                          signatureMethod === 'draw' 
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg' 
                            : 'bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-200'
                        }`}
                      >
                        <PenTool className="h-4 w-4" />
                        Draw Signature
                      </Button>
                      <Button
                        type="button"
                        variant={signatureMethod === 'upload' ? 'default' : 'outline'}
                        onClick={() => {
                          setSignatureMethod('upload');
                          if (sigCanvas.current) {
                            sigCanvas.current.clear();
                          }
                          setValue('digitalSignature', '');
                        }}
                        className={`px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                          signatureMethod === 'upload' 
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg' 
                            : 'bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-200'
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Signature
                      </Button>
                    </div>

                    {signatureMethod === 'draw' ? (
                      <div className="space-y-4">
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner">
                          <SignatureCanvas
                            ref={sigCanvas}
                            penColor="#1f2937"
                            canvasProps={{ width: 600, height: 250, className: 'sigCanvas w-full h-full' }}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            type="button" 
                            onClick={handleClearSignature} 
                            variant="outline" 
                            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Clear
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleSaveSignature} 
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Save Signature
                          </Button>
                        </div>
                        {errors.digitalSignature && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 rotate-45" />
                            {errors.digitalSignature.message}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Use your mouse or touch screen to draw your signature in the box above.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Input
                          id="signatureImageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureImageUpload}
                          className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                        />
                        {signatureImageFile && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <p className="text-base text-green-800 font-medium">Selected: {signatureImageFile.name}</p>
                          </div>
                        )}
                        {errors.digitalSignature && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 rotate-45" />
                            {errors.digitalSignature.message}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Upload a clear image of your signature (JPG, PNG formats supported).</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Review Your Information</h3>
                <p className="text-lg text-gray-700">Please review all the details you have entered before submitting. Ensure all information is accurate.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Basic Information</h4>
                    <p className="text-lg text-gray-700"><strong>Contact Person:</strong> <span className="font-medium">{getValues('contactPerson')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Contact Email:</strong> <span className="font-medium">{getValues('contactEmail')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Contact Phone:</strong> <span className="font-medium">{getValues('contactPhone')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Alternate Phone:</strong> <span className="font-medium">{getValues('alternatePhone') || 'N/A'}</span></p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Business Information</h4>
                    <p className="text-lg text-gray-700"><strong>Business Name:</strong> <span className="font-medium">{getValues('businessName')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Business Registration Number:</strong> <span className="font-medium">{getValues('businessRegistrationNumber') || 'N/A'}</span></p>
                    <p className="text-lg text-gray-700"><strong>Services Offered:</strong> <span className="font-medium">{getValues('servicesOffered').join(', ') || 'N/A'}</span></p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Address Information</h4>
                    <p className="text-lg text-gray-700"><strong>Street:</strong> <span className="font-medium">{getValues('address.street')}</span></p>
                    <p className="text-lg text-gray-700"><strong>City:</strong> <span className="font-medium">{getValues('address.city')}</span></p>
                    <p className="text-lg text-gray-700"><strong>State:</strong> <span className="font-medium">{getValues('address.state')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Zip Code:</strong> <span className="font-medium">{getValues('address.zipCode')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Country:</strong> <span className="font-medium">{getValues('address.country')}</span></p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Bank Details</h4>
                    <p className="text-lg text-gray-700"><strong>Account Holder Name:</strong> <span className="font-medium">{getValues('bankDetails.accountHolderName')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Account Number:</strong> <span className="font-medium">{getValues('bankDetails.accountNumber')}</span></p>
                    <p className="text-lg text-gray-700"><strong>IFSC Code:</strong> <span className="font-medium">{getValues('bankDetails.ifscCode')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Bank Name:</strong> <span className="font-medium">{getValues('bankDetails.bankName')}</span></p>
                    <p className="text-lg text-gray-700"><strong>Branch:</strong> <span className="font-medium">{getValues('bankDetails.branch')}</span></p>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <h4 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Uploaded Documents</h4>
                    {uploadedDocuments.length > 0 ? (
                      <ul className="space-y-3">
                        {uploadedDocuments.map((doc, index) => (
                          <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
                            <span className="text-lg text-gray-800 font-medium">{doc.fileName}</span>
                            <Button type="button" variant="default" size="lg" onClick={() => handleViewDocument(doc)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-base font-semibold transition-colors duration-200">
                              View
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-lg text-gray-500">No documents uploaded.</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <h4 className="font-bold text-xl text-gray-800 border-b pb-2 mb-3">Digital Signature</h4>
                    {getValues('digitalSignature') ? (
                      <img src={getValues('digitalSignature')} alt="Digital Signature" className="border border-gray-300 rounded-md shadow-sm" style={{ maxWidth: '250px', height: 'auto' }} />
                    ) : (
                      <p className="text-lg text-gray-500">No digital signature provided.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 rotate-45" />
                <p className="font-medium text-lg">{errorMessage}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 px-8 py-4 text-lg font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Previous Step
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < steps.length - 1 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    variant="outline"
                    className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 px-6 py-4 text-lg font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit className="h-5 w-5" />
                    Edit Information
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 flex items-center gap-2"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Spinner className="h-5 w-5" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            </form>
          </CardContent>
          </Card>
        </div>
      </div>

      {viewingDocument && (
        <Dialog open onOpenChange={handleCloseViewer}>
          <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
            <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-800">{viewingDocument.fileName}</DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">Document Viewer</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.1))}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <ZoomOut className="h-4 w-4" />
                    Zoom Out
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoomLevel(1)}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <RotateCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setZoomLevel(prev => prev + 0.1)}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <ZoomIn className="h-4 w-4" />
                    Zoom In
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 w-full h-full overflow-auto bg-gray-50 rounded-lg border border-gray-200">
              <div style={{ width: `${100 / zoomLevel}%`, height: `${100 / zoomLevel}%`, transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
                <iframe src={viewingDocument.fileUrl} className="w-full h-full border-0 rounded-lg" title={viewingDocument.fileName} />
              </div>
            </div>
            <div className="flex-shrink-0 pt-4 border-t border-gray-200">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 px-6 py-3 text-base font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2" 
                  onClick={handleCloseViewer}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Close Viewer
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
export default VendorOnboardingPage;
''



