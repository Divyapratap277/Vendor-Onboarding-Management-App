'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const VendorLoginPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage('');
    try {
      const response = await axios.post('/api/auth/vendor-login', data);

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token); // Store the token in localStorage
        router.push('/vendor/dashboard'); // Redirect to vendor dashboard
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'An unexpected error occurred during login.');
      } else {
        setErrorMessage('An unexpected error occurred during login.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Vendor Portal</h1>
          <p className="text-lg text-gray-700">Welcome back. Please log in to continue.</p>
        </div>
        <Card className="shadow-2xl border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-blue-600 p-6">
            <CardTitle className="text-3xl font-bold text-white text-center">Login</CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-medium text-gray-700">Email Address</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input id="email" type="email" placeholder="vendor@example.com" {...field} className="py-3 px-4 text-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg" />}
                />
                {errors.email && <p className="text-red-600 text-sm font-medium mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg font-medium text-gray-700">Password</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => <Input id="password" type="password" placeholder="Enter your password" {...field} className="py-3 px-4 text-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg" />}
                />
                {errors.password && <p className="text-red-600 text-sm font-medium mt-1">{errors.password.message}</p>}
              </div>
              {errorMessage && <p className="text-red-600 text-center font-semibold text-base">{errorMessage}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg rounded-lg transition ease-in-out duration-200 transform hover:-translate-y-0.5" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorLoginPage;
