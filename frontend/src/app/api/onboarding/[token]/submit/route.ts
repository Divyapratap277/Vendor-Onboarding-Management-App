
import { NextResponse } from 'next/server';
import { configuredAxios as axios } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const body = await request.json();
    const response = await axios.post(`/api/onboarding/${params.token}/submit`, body);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as any;
    return new NextResponse(
      JSON.stringify({ message: err.response?.data?.message || 'Failed to submit onboarding' }),
      { status: err.response?.status || 500 }
    );
  }
}
