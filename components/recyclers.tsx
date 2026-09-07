"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Globe, Star, Award, Search, Clock, CheckCircle } from "lucide-react"

interface Recycler {
  _id: string
  businessName: string
  contactPerson: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    pinCode: string
  }
  ewasteTypes: string[]
  operatingHours: string
  certifications?: string
  website?: string
  verificationStatus: string
}

export default function Recyclers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)
  const [recyclers, setRecyclers] = useState<Recycler[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecyclers()
  }, [])

  const fetchRecyclers = async () => {
    try {
      const response = await fetch('/api/recyclers')
      if (response.ok) {
        const data = await response.json()
        setRecyclers(data)
      }
    } catch (error) {
      console.error('Failed to fetch recyclers:', error)
    } finally {
      setLoading(false)
    }
  }

  const allSpecializations = Array.from(new Set(recyclers.flatMap((r) => r.ewasteTypes)))

  const filteredRecyclers = recyclers.filter((recycler) => {
    const matchesSearch =
      recycler.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recycler.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recycler.address.state.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !selectedSpecialization || recycler.ewasteTypes.includes(selectedSpecialization)
    return matchesSearch && matchesSpecialization
  })

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

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-muted-foreground">Loading recyclers...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold text-foreground mb-2">Verified Recyclers</h2>
          <p className="text-muted-foreground">Find certified e-waste recycling centers near you</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {allSpecializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSpecialization(null)}
                className={`px-4 py-2 rounded-lg transition-all ${selectedSpecialization === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
              >
                All
              </button>
              {allSpecializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-4 py-2 rounded-lg transition-all ${selectedSpecialization === spec
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.div variants={itemVariants}>
          <p className="text-sm text-muted-foreground">
            Showing {filteredRecyclers.length} of {recyclers.length} verified recyclers
          </p>
        </motion.div>

        {/* Recyclers Grid */}
        {filteredRecyclers.length > 0 ? (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecyclers.map((recycler) => (
              <motion.div key={recycler._id} variants={itemVariants}>
                <Card className="border-border hover:border-primary/50 transition-all h-full flex flex-col hover:shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{recycler.businessName}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Verified Recycler
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <p className="flex items-start gap-2 text-sm text-foreground">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          {recycler.address.street}, {recycler.address.city}, {recycler.address.state} - {recycler.address.pinCode}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-foreground">
                        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                        <a href={`tel:${recycler.phone}`} className="hover:text-primary transition">
                          {recycler.phone}
                        </a>
                      </p>
                      {recycler.website && (
                        <p className="flex items-center gap-2 text-sm text-foreground">
                          <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                          <a
                            href={recycler.website.startsWith('http') ? recycler.website : `https://${recycler.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition truncate"
                          >
                            {recycler.website}
                          </a>
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-sm text-foreground">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        {recycler.operatingHours}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">Accepts:</p>
                      <div className="flex flex-wrap gap-1">
                        {recycler.ewasteTypes.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {recycler.certifications && (
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Certifications:
                        </p>
                        <p className="text-xs text-muted-foreground">{recycler.certifications}</p>
                      </div>
                    )}

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                      onClick={() => window.open(`tel:${recycler.phone}`, '_self')}
                    >
                      Contact Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {recyclers.length === 0
                ? "No verified recyclers available yet. Check back soon!"
                : "No recyclers found matching your criteria."}
            </p>
            {recyclers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Recyclers need to register and get verified by admin to appear here.
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
