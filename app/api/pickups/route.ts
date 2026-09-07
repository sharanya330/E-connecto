import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import Pickup from "@/models/Pickup";
import { pickupSchema } from "@/lib/validations";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        await dbConnect();

        // If admin, return pending pickups? Or should that be separate?
        // The original app had /api/ewaste/my-pickups and /api/ewaste/pending
        // Let's keep this for "my pickups" for now, or handle query param.

        const pickups = await Pickup.find({ userId: payload._id }).sort({ createdAt: -1 });
        return NextResponse.json(pickups);
    } catch (error) {
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        console.log('\n📦 PICKUP SUBMISSION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            console.log('❌ No token found');
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload) {
            console.log('❌ Invalid token');
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        console.log('✅ User authenticated:', payload._id);

        await dbConnect();
        const body = await req.json();

        console.log('📝 Request body:', body);

        // Validate
        const result = pickupSchema.safeParse(body);
        if (!result.success) {
            console.log('❌ Validation failed:', result.error.errors);
            return NextResponse.json({ detail: result.error.errors[0].message }, { status: 400 });
        }

        console.log('✅ Validation passed');

        const pickup = await Pickup.create({
            ...body,
            userId: payload._id,
            status: 'pending'
        });

        console.log('✅ Pickup created:', pickup._id);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return NextResponse.json(pickup, { status: 201 });
    } catch (error: any) {
        console.error("❌ Pickup submit error:", error);
        console.error("Error details:", error.message);
        console.error("Stack:", error.stack);
        return NextResponse.json({ detail: error.message || "Internal server error" }, { status: 500 });
    }
}
