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
        if (!payload) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(payload._id).select("-password");

        if (!user) {
            return NextResponse.json({ detail: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // Fields that can be updated
        const allowedFields = ['name', 'phone', 'address'];
        const updateData: any = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const user = await User.findByIdAndUpdate(
            payload._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return NextResponse.json({ detail: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
