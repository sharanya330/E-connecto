"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import RecyclerProfile from "@/components/recycler-profile"
import { Loader2 } from "lucide-react"

export default function RecyclerProfilePage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (user.role !== 'recycler') {
                router.push('/dashboard')
            }
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user || user.role !== 'recycler') {
        return null
    }

    return (
        <div className="container py-8">
            <RecyclerProfile />
        </div>
    )
}
