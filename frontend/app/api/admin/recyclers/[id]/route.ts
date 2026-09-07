import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
        }

        await dbConnect();
        const { action } = await req.json(); // 'approve' or 'reject'
        const { id } = await params;

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
        }

        const status = action === 'approve' ? 'verified' : 'rejected';
        const user = await User.findByIdAndUpdate(id, { verificationStatus: status }, { new: true });

        if (!user) {
            return NextResponse.json({ detail: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
