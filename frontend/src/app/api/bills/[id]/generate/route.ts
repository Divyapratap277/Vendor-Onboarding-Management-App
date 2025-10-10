
import { NextResponse } from 'next/server';
import { configuredAxios as axios } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await axios.post(`/api/bills/${params.id}/generate`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as any;
    return new NextResponse(
      JSON.stringify({ message: err.response?.data?.message || 'Failed to generate bill' }),
      { status: err.response?.status || 500 }
    );
  }
}
