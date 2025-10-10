
import { NextResponse } from 'next/server';
import { configuredAxios as axios } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await axios.put(`/api/admin/onboarding/${params.id}/approve`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as any;
    return new NextResponse(
      JSON.stringify({ message: err.response?.data?.message || 'Failed to approve onboarding' }),
      { status: err.response?.status || 500 }
    );
  }
}
