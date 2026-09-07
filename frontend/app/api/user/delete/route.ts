import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function DELETE(req: Request) {
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
        const { password } = body;

        if (!password) {
            return NextResponse.json({ detail: "Password is required" }, { status: 400 });
        }

        // Verify user and password
        const user = await User.findById(payload._id);
        if (!user) {
            return NextResponse.json({ detail: "User not found" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ detail: "Invalid password" }, { status: 401 });
        }

        // Delete user (hard delete)
        await User.findByIdAndDelete(payload._id);

        // Also delete related pickups
        const Pickup = (await import("@/models/Pickup")).default;
        await Pickup.deleteMany({ userId: payload._id });

        // Clear authentication cookie
        (await cookies()).delete("token");

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
