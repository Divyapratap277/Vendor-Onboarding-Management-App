
import { NextResponse } from 'next/server';
import { configuredAxios as axios } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const response = await axios.get(`/api/onboarding/${params.token}`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as any;
    return new NextResponse(
      JSON.stringify({ message: err.response?.data?.message || 'Failed to fetch onboarding' }),
      { status: err.response?.status || 500 }
    );
  }
}
