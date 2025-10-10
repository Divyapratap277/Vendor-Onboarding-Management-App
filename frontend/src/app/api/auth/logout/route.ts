import { NextResponse } from 'next/server';
import { configuredAxios as axios } from '@/lib/auth';

export async function POST() {
  try {
    const response = await axios.post('/api/auth/logout');
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as any;
    return new NextResponse(
      JSON.stringify({ message: err.response?.data?.message || 'Failed to logout' }),
      { status: err.response?.status || 500 }
    );
  }
}