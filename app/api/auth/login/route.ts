import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { signJWT } from "@/lib/auth-helper";
import { cookies } from "next/headers";
import { rateLimit, sanitizeString } from "@/lib/security";

export async function POST(req: Request) {
    try {
        // Rate limiting - 10 attempts per minute per IP
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (!rateLimit(`login:${ip}`, 10, 60000)) {
            return NextResponse.json(
                { detail: "Too many login attempts. Please try again later." },
                { status: 429 }
            );
        }

        await dbConnect();

        const body = await req.json();

        // Validate input
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ detail: result.error.errors[0].message }, { status: 400 });
        }

        const { email, password } = result.data;

        // Find user - sanitize email
        const user = await User.findOne({ email: sanitizeString(email.toLowerCase()) });

        if (!user || !user.password) {
            return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
        }

        // Check if recycler is verified
        if (user.role === 'recycler' && user.verificationStatus !== 'verified') {
            return NextResponse.json(
                { detail: "Your account is pending verification. Please wait for admin approval." },
                { status: 403 }
            );
        }

        // Generate token
        const token = await signJWT({
            _id: user._id.toString(),
            role: user.role
        });

        // Set cookie
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
        });
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
