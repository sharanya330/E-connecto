"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Leaf, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

interface NavigationProps {
  onLoginClick?: () => void
  onRegisterClick?: () => void
}

export default function Navigation({ onLoginClick, onRegisterClick }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Role-based navigation tabs
  const getTabsForRole = () => {
    const baseTabs = [
      { id: "pickups", label: "Pickups", href: "/pickups" },
      { id: "recyclers", label: "Recyclers", href: "/recyclers" },
      { id: "awareness", label: "Awareness", href: "/awareness" },
      { id: "profile", label: "Profile", href: "/profile" },
    ];

    // Admin gets admin dashboard
    if (user?.role === 'admin') {
      return [
        { id: "admin", label: "Admin Dashboard", href: "/admin" },
        ...baseTabs,
      ];
    }

    // Recycler gets recycler dashboard
    if (user?.role === 'recycler') {
      return [
        { id: "dashboard", label: "Dashboard", href: "/dashboard" },
        { id: "profile", label: "Profile", href: "/recycler/profile" },
      ];
    }

    // Regular user gets regular dashboard
    return [
      { id: "dashboard", label: "Dashboard", href: "/dashboard" },
      ...baseTabs,
    ];
  };

  const tabs = getTabsForRole();

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-primary hidden sm:inline">ECONNECTO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${isActive(tab.href)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-foreground hover:bg-muted"
                  }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-secondary-foreground">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Logout
                </Button>
              </div>
            )}

            {!user && (
              <div className="flex items-center gap-2">
                {onLoginClick ? (
                  <Button
                    variant="ghost"
                    onClick={onLoginClick}
                    className="text-foreground hover:text-primary"
                  >
                    Login
                  </Button>
                ) : (
                  <Link href="/">
                    <Button variant="ghost">Login</Button>
                  </Link>
                )}

                {onRegisterClick ? (
                  <Button
                    onClick={onRegisterClick}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Register
                  </Button>
                ) : (
                  <Link href="/">
                    <Button>Register</Button>
                  </Link>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors font-medium ${isActive(tab.href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
              >
                {tab.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
