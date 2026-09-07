import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import Pickup from "@/models/Pickup";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'recycler') {
            return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
        }

        await dbConnect();

        // Fetch pickups that are either:
        // 1. Pending (available for any recycler to pick up?) 
        //    OR assigned to this recycler?
        //    Let's assume 'pending' means unassigned. 
        //    But wait, users schedule pickups. Who assigns them? 
        //    Maybe recyclers can "claim" them?
        //    Or maybe they are assigned by admin?
        //    Let's allow recyclers to see ALL 'pending' pickups in their city (simplified: all pending).
        //    AND pickups assigned to them (scheduled/completed).

        const pickups = await Pickup.find({
            $or: [
                { status: 'pending' }, // Available to claim
                { recyclerId: payload._id } // Assigned to me
            ]
        }).populate('userId', 'name email phone address');

        return NextResponse.json(pickups);
    } catch (error) {
        console.error("Recycler pickups error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
