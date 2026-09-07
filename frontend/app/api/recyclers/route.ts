import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();
        const recyclers = await User.find({
            role: 'recycler',
            verificationStatus: 'verified'
        }).select('-password');

        return NextResponse.json(recyclers);
    } catch (error) {
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
