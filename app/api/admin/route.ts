import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import Pickup from "@/models/Pickup";
import User from "@/models/User";
import { adminActionSchema } from "@/lib/validations";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
        }

        await dbConnect();
        const pickups = await Pickup.find({ status: 'pending' }).populate('userId', 'name email');
        return NextResponse.json(pickups);
    } catch (error) {
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
        }

        await dbConnect();
        const body = await req.json();

        const result = adminActionSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ detail: result.error.errors[0].message }, { status: 400 });
        }

        const { requestId, action } = result.data;
        const status = action === 'approve' ? 'scheduled' : 'rejected';

        const pickup = await Pickup.findByIdAndUpdate(requestId, { status }, { new: true });

        if (!pickup) {
            return NextResponse.json({ detail: "Pickup not found" }, { status: 404 });
        }

        // Award points if approved
        if (action === 'approve') {
            const weight = parseFloat(pickup.weight) || 0;
            const points = Math.floor(weight * 5); // 5 points per kg
            await User.findByIdAndUpdate(pickup.userId, { $inc: { ecoPoints: points } });
        }

        return NextResponse.json(pickup);
    } catch (error) {
        console.error("Admin action error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
