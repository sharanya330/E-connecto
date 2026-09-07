"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"

interface RecyclerProfileData {
    businessName: string
    contactPerson: string
    phone: string
    address: string
    operatingHours: string
    certifications: string
    website: string
}

export default function RecyclerProfile() {
    const [profile, setProfile] = useState<RecyclerProfileData>({
        businessName: '',
        contactPerson: '',
        phone: '',
        address: '',
        operatingHours: '',
        certifications: '',
        website: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/recycler/profile')
            if (response.ok) {
                const data = await response.json()
                setProfile({
                    businessName: data.businessName || '',
                    contactPerson: data.contactPerson || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    operatingHours: data.operatingHours || '',
                    certifications: data.certifications || '',
                    website: data.website || ''
                })
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            setMessage({ type: 'error', text: 'Failed to load profile data.' })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const response = await fetch('/api/recycler/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            })

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile.' })
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage({ type: 'error', text: 'An error occurred while saving.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Organization Profile</CardTitle>
                    <CardDescription>Manage your recycling organization's details.</CardDescription>
                </CardHeader>
                <CardContent>
                    {message && (
                        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    name="businessName"
                                    value={profile.businessName}
                                    onChange={handleChange}
                                    placeholder="e.g. Green Earth Recycling"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input
                                    id="contactPerson"
                                    name="contactPerson"
                                    value={profile.contactPerson}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. +1 234 567 890"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    value={profile.website}
                                    onChange={handleChange}
                                    placeholder="e.g. https://example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                placeholder="Full business address"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="operatingHours">Operating Hours</Label>
                            <Input
                                id="operatingHours"
                                name="operatingHours"
                                value={profile.operatingHours}
                                onChange={handleChange}
                                placeholder="e.g. Mon-Fri 9AM-5PM"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certifications">Certifications</Label>
                            <Textarea
                                id="certifications"
                                name="certifications"
                                value={profile.certifications}
                                onChange={handleChange}
                                placeholder="List any relevant certifications or licenses"
                            />
                        </div>

                        <Button type="submit" className="w-full md:w-auto" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
