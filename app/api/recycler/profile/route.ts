import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth-helper';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'recycler') {
            return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const recycler = await User.findById(payload.sub).select('-password');
        if (!recycler) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
        return NextResponse.json(recycler);
    } catch (error) {
        console.error('Recycler profile GET error:', error);
        return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'recycler') {
            return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const allowedFields = ['businessName', 'contactPerson', 'phone', 'address', 'operatingHours', 'certifications', 'website'];
        const update: any = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) update[key] = body[key];
        }

        await dbConnect();
        const updated = await User.findByIdAndUpdate(payload.sub, update, { new: true }).select('-password');
        if (!updated) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Recycler profile PATCH error:', error);
        return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
    }
}
