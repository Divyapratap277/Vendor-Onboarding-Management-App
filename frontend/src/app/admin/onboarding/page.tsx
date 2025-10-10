'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { configuredAxios, getAdminToken } from '@/lib/auth';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import Link from 'next/link';

interface Submission {
  _id: string;
  businessName: string;
  contactPerson: string;
  contactEmail: string;
  status: string;
  createdAt: string;
}

const AdminOnboardingDashboard = () => {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const response = await configuredAxios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/admin/onboarding`);
        setSubmissions(response.data.submissions);
      } catch (err: unknown) {
        console.error('Error fetching onboarding submissions:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch submissions.');
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
        <p className="ml-2">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Vendor Onboarding Submissions</CardTitle>
          <CardDescription>Review and manage pending vendor applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p>No pending onboarding submissions found.</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission._id} className="p-4">
                  <h3 className="text-lg font-semibold">{submission.businessName}</h3>
                  <p>Contact: {submission.contactPerson} ({submission.contactEmail})</p>
                  <p>Status: <span className="font-medium text-blue-600">{submission.status}</span></p>
                  <p className="text-sm text-gray-500">Submitted on: {new Date(submission.createdAt).toLocaleDateString()}</p>
                  <Link href={`/admin/onboarding/${submission._id}`}>
                    <Button className="mt-2">View Details</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOnboardingDashboard;

