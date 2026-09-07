import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { signJWT } from "@/lib/auth-helper";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Validate input
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ detail: result.error.errors[0].message }, { status: 400 });
        }

        const { name, email, password, role, businessName, phone, address, ewasteTypes } = result.data;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare user data
        const userData: any = {
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
        };

        // Add recycler specific fields if role is recycler
        if (role === 'recycler') {
            userData.businessName = businessName;
            userData.phone = phone;
            userData.verificationStatus = 'pending'; // Explicitly set to pending
            userData.address = address;
            userData.ewasteTypes = ewasteTypes;
        }

        // Create user
        const user = await User.create(userData);

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
        console.error("Registration error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
