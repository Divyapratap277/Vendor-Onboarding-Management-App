'use client';

import { useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { UserPlus, Mail, User, Copy, CheckCircle, XCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const initiateOnboardingSchema = z.object({
  vendorName: z.string().min(1, { message: 'Vendor Name is required.' }),
  vendorEmail: z.string().email({ message: 'Invalid email address.' }),
});

type InitiateOnboardingFormValues = z.infer<typeof initiateOnboardingSchema>;

const InitiateOnboardingPage = () => {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InitiateOnboardingFormValues>({
    resolver: zodResolver(initiateOnboardingSchema),
    defaultValues: {
      vendorName: '',
      vendorEmail: '',
    },
  });

  const onSubmit = async (data: InitiateOnboardingFormValues) => {
    setGeneratedLink(null);
    setErrorMessage('');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/onboarding/initiate`, {
        vendorName: data.vendorName,
        vendorEmail: data.vendorEmail,
      });

      if (response.data.token) {
        const onboardingUrl = `${window.location.origin}/vendor/onboarding?token=${response.data.token}`;
        setGeneratedLink(onboardingUrl);
        reset(); // Clear form after successful generation
      } else {
        setErrorMessage('Failed to generate onboarding link: No token received.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'An unexpected error occurred.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Onboarding link copied to clipboard!');
    }
  };

  const openLinkInNewTab = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Back to Dashboard Link */}
      <div className="mb-6">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-xl mb-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/20 p-3 rounded-full">
                <UserPlus className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Initiate Vendor Onboarding</h1>
            <p className="text-lg text-blue-100">Generate secure onboarding links for new vendors to complete their registration</p>
          </div>
        </div>

        <div className="flex justify-center">
          {/* Form Section */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 w-full max-w-md">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-indigo-600" />
                Generate Onboarding Link
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Enter vendor details to create a secure onboarding link
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="vendorName" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-600" />
                    Vendor Name
                  </Label>
                  <Controller
                    name="vendorName"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="vendorName" 
                        placeholder="e.g., Acme Corporation" 
                        {...field} 
                        className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm" 
                      />
                    )}
                  />
                  {errors.vendorName && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {errors.vendorName.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="vendorEmail" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-600" />
                    Vendor Email
                  </Label>
                  <Controller
                    name="vendorEmail"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="vendorEmail" 
                        type="email" 
                        placeholder="vendor@company.com" 
                        {...field} 
                        className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm" 
                      />
                    )}
                  />
                  {errors.vendorEmail && (
                    <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {errors.vendorEmail.message}
                    </p>
                  )}
                </div>
                
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="font-medium text-base">{errorMessage}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="h-5 w-5 mr-2" />
                      Generating Link...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Generate Onboarding Link
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Success Card - Generated Link (Centered) */}
        {generatedLink && (
          <div className="flex justify-center mt-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl border-0 animate-in slide-in-from-top-2 duration-300 w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  Onboarding Link Generated Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="font-medium text-green-100 mb-2">Generated Link:</p>
                  <p className="break-all text-sm font-mono bg-white/10 p-3 rounded border border-white/20 select-all">
                    {generatedLink}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={copyToClipboard} 
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold py-3 rounded-lg transition-all duration-200"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button 
                    onClick={openLinkInNewTab} 
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold py-3 rounded-lg transition-all duration-200"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitiateOnboardingPage;

