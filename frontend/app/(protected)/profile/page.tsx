"use client";

import Profile from "@/components/profile";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
    const { logout } = useAuth();
    return <Profile onLogout={logout} />;
}
