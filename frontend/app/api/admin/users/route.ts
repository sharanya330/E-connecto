import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth-helper';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        await dbConnect();
        const users = await User.find().select('-password');
        return NextResponse.json({ users });
    } catch (error) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
