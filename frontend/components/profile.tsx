"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trophy, Award, TrendingUp, Leaf, Edit2, LogOut, Save, X, Trash2, Loader2, Medal } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

// Leaderboard Preview Component
function LeaderboardPreview() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        // Show only top 5
        setLeaderboard(data.leaderboard.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return ""
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {leaderboard.map((entry) => (
            <div
              key={entry._id}
              className={`px-6 py-4 transition-colors ${entry.isCurrentUser ? 'bg-primary/5' : 'hover:bg-muted/50'
                }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10">
                    <span className="text-lg font-bold text-muted-foreground">#{entry.rank}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {getRankBadge(entry.rank) || getInitials(entry.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {entry.name}
                        {entry.isCurrentUser && <span className="text-primary ml-2">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.totalWeight} kg collected</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{entry.ecoPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">eco points</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


interface ProfileProps {
  onLogout: () => void
}

interface Stats {
  totalWeight: string
  ecoPoints: number
  totalPickups: number
  completedPickups: number
  pendingPickups: number
  rank: number
  totalUsers: number
}

export default function Profile({ onLogout }: ProfileProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Edit form fields
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (user) {
      setEditName(user.name || '')
      setEditPhone(user.phone || '')
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditName(user?.name || '')
      setEditPhone(user?.phone || '')
      setError('')
      setSuccess('')
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
        }),
      })

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Reload to get updated user data
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to update profile')
      }
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password')
      return
    }

    setDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })

      if (response.ok) {
        // Account deleted, redirect to home
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to delete account')
        setDeleting(false)
      }
    } catch (error) {
      setError('Failed to delete account')
      setDeleting(false)
    }
  }

  const achievements = [
    { icon: Leaf, title: "Eco Warrior", description: "Recycled 50 kg of e-waste", unlocked: (parseFloat(stats?.totalWeight || '0') >= 50) },
    { icon: Trophy, title: "Top Contributor", description: "In top 10 recyclers", unlocked: (stats?.rank || 999) <= 10 },
    { icon: Award, title: "Certified Green", description: "Completed awareness course", unlocked: false },
    { icon: TrendingUp, title: "Rising Star", description: "Earned 1000+ eco points", unlocked: (stats?.ecoPoints || 0) >= 1000 },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getMemberSince = () => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
    return 'Recently'
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-gradient-to-r from-primary/10 to-secondary/10 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl">
                    {getUserInitial()}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Welcome, {user?.name || 'User'}!</CardTitle>
                    <CardDescription>Member since {getMemberSince()} • Rank #{stats?.rank || '-'}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={handleEditToggle} variant="outline" size="sm" className="border-border hover:bg-muted bg-transparent gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </Button>
                      <Button onClick={handleEditToggle} variant="outline" size="sm" className="gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted bg-transparent gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Edit Form or Display */}
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Read-only)</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-background/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Eco Points</p>
                    <p className="text-3xl font-bold text-primary">{stats?.ecoPoints?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">5 points per kg</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">E-Waste Recycled</p>
                    <p className="text-3xl font-bold text-secondary">{stats?.totalWeight || 0} kg</p>
                    <p className="text-xs text-muted-foreground mt-1">Total collected</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Pickups Completed</p>
                    <p className="text-3xl font-bold text-accent">{stats?.completedPickups || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats?.pendingPickups || 0} pending</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                    <p className="text-3xl font-bold text-orange-600">#{stats?.rank || '-'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Out of {stats?.totalUsers || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Your Achievements</h3>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, idx) => {
              const Icon = achievement.icon
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card
                    className={`border-border text-center hover:border-primary/50 transition-all hover:shadow-lg ${!achievement.unlocked ? "opacity-50" : ""
                      }`}
                  >
                    <CardContent className="pt-6">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${achievement.unlocked ? "bg-primary/10" : "bg-muted"
                          }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${achievement.unlocked ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <p className="font-semibold text-foreground">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Locked</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Leaderboard Preview */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Leaderboard</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/leaderboard')}
            >
              View Full Leaderboard
            </Button>
          </div>
          <LeaderboardPreview />
        </motion.div>

        {/* Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border-border hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="delete-password">Enter your password to confirm</Label>
            <Input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
              className="mt-2"
            />
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeletePassword('')
              setError('')
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting || !deletePassword}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
