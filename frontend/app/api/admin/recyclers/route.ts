import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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
        const pendingRecyclers = await User.find({
            role: 'recycler',
            verificationStatus: 'pending'
        }).select('-password');

        return NextResponse.json(pendingRecyclers);
    } catch (error) {
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
