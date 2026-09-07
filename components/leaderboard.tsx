"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface LeaderboardEntry {
  rank: number
  _id: string
  name: string
  ecoPoints: number
  totalWeight: string
  isCurrentUser: boolean
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  currentUserRank: LeaderboardEntry | null
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError('Failed to load leaderboard')
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return null
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    )
  }

  const leaderboard = data?.leaderboard || []
  const currentUserRank = data?.currentUserRank

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h2>
          <p className="text-muted-foreground">Top contributors to e-waste recycling</p>
        </motion.div>

        {/* Current User Rank (if not in top 100) */}
        {currentUserRank && !leaderboard.find(e => e.isCurrentUser) && (
          <motion.div variants={itemVariants}>
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10">
                      <span className="text-lg font-bold text-muted-foreground">#{currentUserRank.rank}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {getInitials(currentUserRank.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{currentUserRank.name} (You)</p>
                        <p className="text-xs text-muted-foreground">{currentUserRank.totalWeight} kg collected</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{currentUserRank.ecoPoints.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">eco points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-border overflow-hidden">
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>Ranked by eco-points earned</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No users found. Be the first to recycle e-waste!
                </div>
              ) : (
                <motion.div variants={containerVariants} className="divide-y divide-border">
                  {leaderboard.map((entry) => (
                    <motion.div
                      key={entry._id}
                      variants={itemVariants}
                      className={`px-6 py-4 transition-colors ${entry.isCurrentUser ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-10 h-10">
                            {getRankIcon(entry.rank) || (
                              <span className="text-lg font-bold text-muted-foreground">#{entry.rank}</span>
                            )}
                          </div>

                          {/* Avatar and Name */}
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

                        {/* Stats */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{entry.ecoPoints.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">eco points</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements Section */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Achievements</h3>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🌱", title: "Seedling", description: "Collect 10 kg of e-waste" },
              { icon: "🌿", title: "Sprout", description: "Collect 50 kg of e-waste" },
              { icon: "🌳", title: "Tree", description: "Collect 100 kg of e-waste" },
              { icon: "🌲", title: "Forest", description: "Collect 500 kg of e-waste" },
            ].map((achievement, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="border-border hover:border-primary/50 transition-all text-center">
                  <CardContent className="pt-6">
                    <p className="text-4xl mb-2">{achievement.icon}</p>
                    <p className="font-semibold text-foreground mb-1">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
