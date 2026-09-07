import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signJWT } from "@/lib/auth-helper";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();
        const { id_token } = body;

        if (!id_token) {
            return NextResponse.json({ detail: "Missing Google ID token" }, { status: 400 });
        }

        // Verify Google Token via Google tokeninfo endpoint
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
        if (!googleRes.ok) {
            return NextResponse.json({ detail: "Invalid or expired Google token" }, { status: 400 });
        }

        const googleUser = await googleRes.json();
        const { email, name, sub: googleId, picture } = googleUser;

        if (!email) {
            return NextResponse.json({ detail: "Google account missing email address" }, { status: 400 });
        }

        // Find existing user or create a new user
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            user = await User.create({
                name: name || email.split("@")[0],
                email: email.toLowerCase(),
                role: "user",
                avatar: picture,
                googleId: googleId,
                verificationStatus: "verified"
            });
        }

        // Sign JWT
        const token = await signJWT({
            _id: user._id.toString(),
            role: user.role
        });

        // Set auth cookie
        (await cookies()).set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return NextResponse.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                ecoPoints: user.ecoPoints,
            },
            access_token: token,
            refresh_token: token
        });
    } catch (error: any) {
        console.error("Google Auth error:", error);
        return NextResponse.json({ detail: error.message || "Internal server error" }, { status: 500 });
    }
}
