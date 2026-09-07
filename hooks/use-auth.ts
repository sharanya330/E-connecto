"use client"

import { useState, useEffect } from "react"

interface User {
    _id: string
    name: string
    email: string
    role: string
    verificationStatus?: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me')
                if (response.ok) {
                    const data = await response.json()
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error('Failed to fetch user:', error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    return { user, loading }
}
