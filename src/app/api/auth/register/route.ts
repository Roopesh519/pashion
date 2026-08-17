import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || normalizedName.length > 60 || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: 'Please provide a valid name, email, and a password of at least 12 characters' }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name: normalizedName, email: normalizedEmail, password: hashed });

    return NextResponse.json({ message: 'User created', user: { id: user._id.toString(), name: user.name, email: user.email } }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
