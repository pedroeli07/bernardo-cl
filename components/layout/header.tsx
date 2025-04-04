"use client"

import Link from "next/link"
import { Trophy, BarChart3, TrendingUp, DollarSign, Calendar, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { label: "Dashboard", href: "/", icon: BarChart3 },
  { label: "Big Hits", href: "/big-hits", icon: Trophy },
  { label: "ROI Médio", href: "/roi-medio", icon: TrendingUp },
  { label: "Análise Mensal", href: "/analise-mensal", icon: Calendar },
  { label: "Dossiê", href: "/dossie", icon: DollarSign },
]

export function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 py-2"
          : "bg-transparent py-4",
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear", repeatDelay: 5 }}
          >
            <Trophy className="h-7 w-7 text-steelersGold" />
          </motion.div>
          <Link href="/" className="flex items-center space-x-1">
            <span className="text-xl font-bold">Bernardo</span>
            <motion.span
              className="text-xl font-bold text-steelersGold"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            >
              Poker
            </motion.span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex">
          <ul className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative group",
                      isActive
                        ? "text-steelersGold bg-steelersGold/10"
                        : "text-muted-foreground hover:text-steelersGold hover:bg-steelersGold/5",
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-steelersGold"
                        layoutId="navbar-indicator"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-steelersGold"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="container py-6">
                <ul className="flex flex-col space-y-4">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-3 text-lg font-medium rounded-md transition-colors",
                            isActive
                              ? "text-steelersGold bg-steelersGold/10"
                              : "text-muted-foreground hover:text-steelersGold hover:bg-steelersGold/5",
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

