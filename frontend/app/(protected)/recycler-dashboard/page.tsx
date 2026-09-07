"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, MapPin, Phone, Package, Truck } from "lucide-react"

interface Pickup {
    _id: string
    userId: {
        name: string
        email: string
        phone: string
        address: string
    }
    items: string[]
    weight: string
    location: string
    status: string
    date: string
    time: string
}

export default function RecyclerDashboard() {
    const [pickups, setPickups] = useState<Pickup[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        fetchPickups()
    }, [])

    const fetchPickups = async () => {
        try {
            const response = await fetch('/api/recycler/pickups')
            if (response.ok) {
                const data = await response.json()
                setPickups(data)
            }
        } catch (error) {
            console.error('Failed to fetch pickups:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: string, action: 'accept' | 'complete' | 'reject') => {
        setProcessing(id)
        try {
            const body: any = { action }
            if (action === 'complete') {
                const weight = prompt("Enter final weight (kg):")
                if (weight) body.weight = weight
            }

            const response = await fetch(`/api/recycler/pickups/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                fetchPickups() // Refresh list
            } else {
                alert('Action failed')
            }
        } catch (error) {
            console.error('Action error:', error)
        } finally {
            setProcessing(null)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    const pendingPickups = pickups.filter(p => p.status === 'pending')
    const myPickups = pickups.filter(p => p.status === 'scheduled')
    const completedPickups = pickups.filter(p => p.status === 'completed')

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Recycler Dashboard</h1>

            {/* Available Pickups */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Package className="text-primary" /> Available Pickups
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingPickups.map(pickup => (
                        <Card key={pickup._id} className="border-l-4 border-l-yellow-500">
                            <CardHeader>
                                <CardTitle className="text-lg">{pickup.location}</CardTitle>
                                <CardDescription>{new Date(pickup.date).toLocaleDateString()} at {pickup.time}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-2"><strong>Items:</strong> {pickup.items.join(', ')}</p>
                                <p className="text-sm mb-4"><strong>Est. Weight:</strong> {pickup.weight}</p>
                                <Button
                                    className="w-full"
                                    onClick={() => handleAction(pickup._id, 'accept')}
                                    disabled={!!processing}
                                >
                                    {processing === pickup._id ? 'Processing...' : 'Accept Pickup'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {pendingPickups.length === 0 && <p className="text-muted-foreground">No new pickups available.</p>}
                </div>
            </section>

            {/* My Scheduled Pickups */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Truck className="text-blue-500" /> My Scheduled Pickups
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myPickups.map(pickup => (
                        <Card key={pickup._id} className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle className="text-lg">{pickup.userId?.name}</CardTitle>
                                <CardDescription>{pickup.userId?.phone}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-2"><MapPin className="inline w-4 h-4 mr-1" /> {pickup.location}</p>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(pickup._id, 'complete')}
                                        disabled={!!processing}
                                    >
                                        Complete
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleAction(pickup._id, 'reject')}
                                        disabled={!!processing}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {myPickups.length === 0 && <p className="text-muted-foreground">No scheduled pickups.</p>}
                </div>
            </section>
        </div>
    )
}
