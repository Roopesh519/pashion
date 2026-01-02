import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return forbiddenResponse('Admin access required');

    await dbConnect();
    const data = await request.json();

    const allowed = {} as any;
    if (data.role) allowed.role = data.role;

    const user = await User.findByIdAndUpdate(params.id, { $set: allowed }, { new: true }).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'User updated', user });
  } catch (error: any) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
  }
}
