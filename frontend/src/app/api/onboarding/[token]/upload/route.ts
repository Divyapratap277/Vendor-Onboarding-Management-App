
import { NextResponse } from 'next/server';
import { configuredAxios as axios } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const formData = await request.formData();
    const response = await axios.post(`/api/onboarding/${params.token}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as any;
    return new NextResponse(
      JSON.stringify({ message: err.response?.data?.message || 'Failed to upload document' }),
      { status: err.response?.status || 500 }
    );
  }
}
