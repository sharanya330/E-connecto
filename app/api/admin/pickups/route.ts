import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import Pickup from "@/models/Pickup";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== "admin") {
            return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
        }

        await dbConnect();
        const pickups = await Pickup.find()
            .populate("userId", "name email")
            .populate("recyclerId", "name email");
        return NextResponse.json(pickups);
    } catch (error) {
        console.error("Admin pickups GET error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
