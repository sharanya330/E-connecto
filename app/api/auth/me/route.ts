import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            console.log('❌ No token found');
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const payload = await verifyJWT(token);
        if (!payload) {
            console.log('❌ Invalid token');
            return NextResponse.json({ user: null }, { status: 200 });
        }

        console.log('🔍 JWT Payload:', payload);

        await dbConnect();
        const user = await User.findById(payload._id).select("-password");

        if (!user) {
            console.log('❌ User not found in database');
            return NextResponse.json({ user: null }, { status: 200 });
        }

        console.log('✅ User found:', {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("❌ Me error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
