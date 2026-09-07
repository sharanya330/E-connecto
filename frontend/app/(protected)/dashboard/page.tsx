"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Dashboard from "@/components/dashboard";
import RecyclerDashboard from "@/components/recycler-dashboard";
import PickupModal from "@/components/modals/pickup-modal";
import { useState } from "react";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [showPickupModal, setShowPickupModal] = useState(false);

    useEffect(() => {
        // Redirect admins to admin dashboard
        if (!loading && user?.role === 'admin') {
            router.push('/admin');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    // Show recycler-specific dashboard
    if (user?.role === 'recycler') {
        return <RecyclerDashboard />;
    }

    // Show user dashboard (default)
    return (
        <>
            <Dashboard onSchedulePickup={() => setShowPickupModal(true)} />
            <PickupModal open={showPickupModal} onOpenChange={setShowPickupModal} />
        </>
    );
}
