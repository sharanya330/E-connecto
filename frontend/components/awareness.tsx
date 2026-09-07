"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Lightbulb, BookOpen, Recycle, Leaf, Zap, Users, Shield } from "lucide-react"

export default function Awareness() {
  const resources = [
    {
      id: 1,
      icon: AlertTriangle,
      title: "Environmental Impact of E-Waste",
      description: "E-waste contains hazardous materials like lead, mercury, cadmium, and brominated flame retardants. Improper disposal contaminates soil and groundwater, affecting ecosystems and human health.",
      category: "Health & Safety",
      color: "bg-red-500/10 text-red-600",
      facts: [
        "Contains toxic heavy metals",
        "Pollutes soil and water",
        "Causes respiratory illnesses"
      ],
      link: "#"
    },
    {
      id: 2,
      icon: Recycle,
      title: "How to Properly Dispose E-Waste",
      description: "Never throw electronics in regular trash. Use certified recyclers, manufacturer take-back programs, or retailer recycling services. Always wipe your data before disposal.",
      category: "Recycling Guide",
      color: "bg-green-500/10 text-green-600",
      facts: [
        "Backup and wipe all data",
        "Remove batteries separately",
        "Use certified recyclers"
      ],
      link: "#"
    },
    {
      id: 3,
      icon: Leaf,
      title: "Circular Economy Benefits",
      description: "Recycling e-waste recovers valuable materials like gold, silver, copper, and rare earth elements. This reduces mining needs, saves energy, and creates green jobs.",
      category: "Sustainability",
      color: "bg-primary/10 text-primary",
      facts: [
        "Recovers precious metals",
        "Reduces carbon footprint",
        "Creates employment"
      ],
      link: "#"
    },
    {
      id: 4,
      icon: Shield,
      title: "Data Security in E-Waste",
      description: "Old devices contain sensitive personal and financial data. Professional data wiping prevents identity theft and data breaches when recycling electronics.",
      category: "Security",
      color: "bg-blue-500/10 text-blue-600",
      facts: [
        "Prevents identity theft",
        "Protects financial data",
        "Ensures privacy"
      ]
    },
  ]

  const facts = [
    {
      stat: "1.75M Tonnes",
      description: "E-waste generated in India (2023-24)",
      trend: "+72.5% since 2019"
    },
    {
      stat: "43%",
      description: "E-waste formally recycled in India",
      trend: "Up from 22% in 2019"
    },
    {
      stat: "3rd Largest",
      description: "India's global e-waste ranking",
      trend: "After China and USA"
    },
    {
      stat: "57%",
      description: "E-waste still unprocessed",
      trend: "990,000 tonnes annually"
    },
  ]

  const tips = [
    {
      icon: Zap,
      title: "Extend Device Life",
      description: "Repair and upgrade devices instead of replacing them. This is the most eco-friendly option.",
    },
    {
      icon: Users,
      title: "Donate Working Devices",
      description: "Give functional electronics to schools, charities, or community organizations after wiping data.",
    },
    {
      icon: Recycle,
      title: "Use Certified Recyclers",
      description: "Look for R2 or e-Stewards certification to ensure responsible recycling practices.",
    },
    {
      icon: Shield,
      title: "Secure Your Data",
      description: "Use professional data erasure software before recycling any device with storage.",
    },
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

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">E-Waste Awareness & Education</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about the environmental impact of electronic waste and how you can make a difference
          </p>
        </motion.div>

        {/* Key Statistics */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">India's E-Waste Crisis</h3>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {facts.map((fact, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg text-center h-full">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-primary mb-2">{fact.stat}</p>
                    <p className="text-sm font-medium text-foreground mb-1">{fact.description}</p>
                    <p className="text-xs text-muted-foreground">{fact.trend}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Educational Resources */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Understanding E-Waste</h3>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon
              return (
                <motion.div key={resource.id} variants={itemVariants}>
                  <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg ${resource.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                          {resource.category}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm leading-relaxed">{resource.description}</CardDescription>
                      <ul className="space-y-2">
                        {resource.facts.map((fact, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Practical Tips */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-foreground mb-6">What You Can Do</h3>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tips.map((tip, idx) => {
              const Icon = tip.icon
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg text-center h-full">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground mb-2">{tip.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Hazardous Materials Warning */}
        <motion.div variants={itemVariants}>
          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Hazardous Materials in Electronics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { name: "Lead", danger: "Neurological damage" },
                  { name: "Mercury", danger: "Kidney & brain damage" },
                  { name: "Cadmium", danger: "Cancer & bone disease" },
                  { name: "Arsenic", danger: "Skin lesions & cancer" },
                ].map((material, idx) => (
                  <div key={idx} className="text-center p-3 bg-background rounded-lg">
                    <p className="font-semibold text-foreground mb-1">{material.name}</p>
                    <p className="text-xs text-muted-foreground">{material.danger}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants}>
          <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-secondary/10 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lightbulb className="w-6 h-6 text-primary" />
                Take Action Today
              </CardTitle>
              <CardDescription className="text-base">
                Schedule a pickup for your old electronics and contribute to a cleaner, greener future
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                Schedule E-Waste Pickup
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  )
}
