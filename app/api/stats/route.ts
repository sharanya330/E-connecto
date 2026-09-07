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
        if (!payload) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const userId = payload._id;

        // Get all user's pickups
        const pickups = await Pickup.find({ userId });

        // Calculate statistics
        const totalPickups = pickups.length;
        const completedPickups = pickups.filter((p: any) => p.status === 'completed').length;
        const pendingPickups = pickups.filter((p: any) => p.status === 'pending').length;

        // Calculate total weight
        const totalWeight = pickups
            .filter((p: any) => p.status === 'completed')
            .reduce((sum: number, p: any) => {
                const weight = parseFloat(p.weight) || 0;
                return sum + weight;
            }, 0);

        // Calculate eco points (5 points per kg)
        const ecoPoints = Math.floor(totalWeight * 5);

        // Get user rank (simplified - count users with more eco points)
        // Note: In a real app with many users, this should be optimized (e.g., using countDocuments)
        const allUsers = await User.find({});

        // Calculate eco points for all users to determine rank
        // This is expensive, but matches original logic. 
        // Optimization: User model has ecoPoints field, we should use that.
        // The original code calculated it on the fly for everyone? 
        // "const userPoints = await Promise.all(allUsers.map(async (u) => { ... }))"
        // But the User model HAS ecoPoints field. Let's trust the User model's ecoPoints if possible, 
        // or recalculate if that was the intention. 
        // The original code: "const user = await User.findById(userId); ... const userPoints = ..."
        // It seems it recalculated it. 
        // However, my Admin API updates `user.ecoPoints`. So I can just query `User.countDocuments({ ecoPoints: { $gt: user.ecoPoints } })` + 1.

        const currentUser = await User.findById(userId);
        const currentPoints = currentUser?.ecoPoints || 0;

        const betterUsersCount = await User.countDocuments({ ecoPoints: { $gt: currentPoints } });
        const rank = betterUsersCount + 1;
        const totalUsers = await User.countDocuments();

        return NextResponse.json({
            totalWeight: totalWeight.toFixed(2),
            ecoPoints: currentPoints, // Use stored points
            totalPickups,
            completedPickups,
            pendingPickups,
            rank,
            totalUsers
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
