import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-helper";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        // Optional auth - leaderboard can be public or require login
        let currentUserId: string | null = null;
        if (token) {
            const payload = await verifyJWT(token);
            if (payload) {
                currentUserId = payload._id as string;
            }
        }

        await dbConnect();

        // Fetch top 100 users sorted by ecoPoints
        const topUsers = await User.find({ role: 'user' })
            .select('name email ecoPoints')
            .sort({ ecoPoints: -1 })
            .limit(100)
            .lean();

        // Calculate total weight from completed pickups for each user
        const Pickup = (await import("@/models/Pickup")).default;

        const leaderboard = await Promise.all(
            topUsers.map(async (user, index) => {
                const completedPickups = await Pickup.find({
                    userId: user._id,
                    status: 'completed'
                }).select('weight');

                const totalWeight = completedPickups.reduce((sum, pickup) => {
                    return sum + (parseFloat(pickup.weight) || 0);
                }, 0);

                return {
                    rank: index + 1,
                    _id: user._id.toString(),
                    name: user.name,
                    ecoPoints: user.ecoPoints || 0,
                    totalWeight: totalWeight.toFixed(2),
                    isCurrentUser: currentUserId === user._id.toString()
                };
            })
        );

        // If current user is not in top 100, find their rank
        let currentUserRank = null;
        if (currentUserId) {
            const userInTop100 = leaderboard.find(u => u.isCurrentUser);
            if (!userInTop100) {
                const allUsers = await User.find({ role: 'user' })
                    .select('_id ecoPoints')
                    .sort({ ecoPoints: -1 })
                    .lean();

                const userIndex = allUsers.findIndex(u => u._id.toString() === currentUserId);
                if (userIndex !== -1) {
                    const currentUser = await User.findById(currentUserId).select('name ecoPoints');
                    const completedPickups = await Pickup.find({
                        userId: currentUserId,
                        status: 'completed'
                    }).select('weight');

                    const totalWeight = completedPickups.reduce((sum, pickup) => {
                        return sum + (parseFloat(pickup.weight) || 0);
                    }, 0);

                    currentUserRank = {
                        rank: userIndex + 1,
                        _id: currentUserId,
                        name: currentUser?.name || 'You',
                        ecoPoints: currentUser?.ecoPoints || 0,
                        totalWeight: totalWeight.toFixed(2),
                        isCurrentUser: true
                    };
                }
            }
        }

        return NextResponse.json({
            leaderboard,
            currentUserRank
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
