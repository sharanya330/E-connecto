"use client"

import { Leaf, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-lg">ECONNECTO</span>
            </div>
            <p className="text-sm opacity-90">Sustainable e-waste management for a circular economy in Telangana.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a href="/dashboard" className="hover:opacity-100 transition">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/awareness" className="hover:opacity-100 transition">
                  Awareness
                </a>
              </li>
              <li>
                <a href="/recyclers" className="hover:opacity-100 transition">
                  Recyclers
                </a>
              </li>
              <li>
                <a href="/pickups" className="hover:opacity-100 transition">
                  Schedule Pickup
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a href="/profile" className="hover:opacity-100 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/profile" className="hover:opacity-100 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/awareness" className="hover:opacity-100 transition">
                  E-Waste Awareness
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="hover:opacity-100 transition">
                  Leaderboard
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:srybroiambusy@gmail.com" className="hover:opacity-100 transition">
                  saisharanyagantela@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+917569751897" className="hover:opacity-100 transition">
                  +91-7569751897
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm opacity-90">
            <p>&copy; 2025 ECONNECTO. All rights reserved.</p>
            <p>Committed to sustainable e-waste management and circular economy principles.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
