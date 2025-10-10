
import { NextResponse } from 'next/server';
import { configuredAxios as axios } from '@/lib/auth';

export async function GET() {
  try {
    const response = await axios.get('/api/admin/onboarding');
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as any;
    return new NextResponse(
      JSON.stringify({ message: err.response?.data?.message || 'Failed to fetch onboardings' }),
      { status: err.response?.status || 500 }
    );
  }
}
