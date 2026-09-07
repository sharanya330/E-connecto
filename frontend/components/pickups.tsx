"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
} from "lucide-react";

interface Pickup {
  _id: string;
  date: string;
  time: string;
  location: string;
  status: "pending" | "scheduled" | "completed" | "rejected";
  items: string[];
  weight: string;
  ecoPoints?: number;
}

interface PickupsProps {
  onSchedulePickup: () => void;
}

export default function Pickups({ onSchedulePickup }: PickupsProps) {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const response = await fetch('/api/pickups');

      if (response.ok) {
        const data = await response.json();
        setPickups(data);
      }
    } catch (error) {
      console.error("Failed to fetch pickups:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Pickups",
      value: pickups.length,
      icon: Truck,
    },
    {
      label: "Completed",
      value: pickups.filter((p) => p.status === "completed").length,
      icon: CheckCircle,
    },
    {
      label: "Total Weight",
      value: pickups
        .reduce(
          (sum, p) => sum + parseFloat(p.weight.replace(" kg", "").trim()),
          0
        )
        .toFixed(1) + " kg",
      icon: AlertCircle,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">Loading your pickups...</div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground">Your Pickups</h2>
            <p className="text-muted-foreground mt-1">
              Manage and track your e-waste collection requests.
            </p>
          </div>
          <Button
            onClick={onSchedulePickup}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            New Pickup
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card
                key={i}
                className="border-border hover:border-primary/60 transition-all duration-200"
              >
                <CardContent className="pt-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold mt-1 text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-primary/50" />
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Pickups list */}
        <motion.div variants={container} className="space-y-5">
          {pickups.map((pickup) => (
            <motion.div key={pickup._id} variants={item}>
              <Card className="border-border hover:border-primary/60 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-semibold">
                        {pickup.location}
                      </CardTitle>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${pickup.status === "completed"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/20 text-secondary"
                          }`}
                      >
                        {pickup.status === "completed"
                          ? "Completed"
                          : "Scheduled"}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(pickup.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {pickup.time}
                      </span>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div>
                    <p className="text-sm font-medium mb-2 text-foreground">
                      Items:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pickup.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Total Weight:{" "}
                      <span className="font-semibold text-foreground">
                        {pickup.weight}
                      </span>
                    </span>
                    {pickup.status === "completed" && (
                      <span className="text-sm text-primary flex items-center gap-1 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        +{pickup.ecoPoints} eco points
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
