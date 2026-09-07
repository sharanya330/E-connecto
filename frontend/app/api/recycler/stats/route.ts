import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth-helper';
import dbConnect from '@/lib/db';
import Pickup from '@/models/Pickup';

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
        const recyclerId = payload.sub; // assuming sub contains user id

        const totalPickups = await Pickup.countDocuments({ recyclerId, status: { $in: ['scheduled', 'completed'] } });
        const completedPickups = await Pickup.countDocuments({ recyclerId, status: 'completed' });
        const recycledWeightAgg = await Pickup.aggregate([
            { $match: { recyclerId, status: 'completed' } },
            { $group: { _id: null, totalWeight: { $sum: { $toDouble: '$weight' } } } }
        ]);
        const recycledWeight = recycledWeightAgg[0]?.totalWeight || 0;

        return NextResponse.json({ totalPickups, completedPickups, recycledWeight });
    } catch (error) {
        console.error('Recycler stats error:', error);
        return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
    }
}
