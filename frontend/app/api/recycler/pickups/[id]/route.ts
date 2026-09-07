import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import Pickup from "@/models/Pickup";
import User from "@/models/User";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'recycler') {
            return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
        }

        await dbConnect();
        const { action, weight } = await req.json(); // 'accept', 'complete', 'reject'
        const { id } = await params;

        const pickup = await Pickup.findById(id);
        if (!pickup) return NextResponse.json({ detail: "Pickup not found" }, { status: 404 });

        if (action === 'accept') {
            if (pickup.status !== 'pending') {
                return NextResponse.json({ detail: "Pickup already processed" }, { status: 400 });
            }
            pickup.status = 'scheduled';
            pickup.recyclerId = payload._id;
        } else if (action === 'complete') {
            if (pickup.recyclerId.toString() !== payload._id) {
                return NextResponse.json({ detail: "Not authorized for this pickup" }, { status: 403 });
            }
            pickup.status = 'completed';
            if (weight) pickup.weight = weight; // Update actual weight

            // Award eco points to user
            const points = Math.floor(parseFloat(pickup.weight) * 5);
            pickup.ecoPointsAwarded = points;

            await User.findByIdAndUpdate(pickup.userId, {
                $inc: { ecoPoints: points }
            });
        } else if (action === 'reject') {
            if (pickup.recyclerId && pickup.recyclerId.toString() !== payload._id) {
                return NextResponse.json({ detail: "Not authorized for this pickup" }, { status: 403 });
            }
            pickup.status = 'rejected';
            // If rejected by recycler, maybe it goes back to pending? Or hard reject?
            // Let's say hard reject for now.
        } else {
            return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
        }

        await pickup.save();
        return NextResponse.json(pickup);
    } catch (error) {
        console.error("Recycler action error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
