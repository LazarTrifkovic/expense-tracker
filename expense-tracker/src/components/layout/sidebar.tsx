"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Plus, Settings, X, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Grupe", href: "/groups", icon: Users },
  { name: "Nova grupa", href: "/groups/new", icon: Plus },
  { name: "Podešavanja", href: "/settings", icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-slate-200/80 transition-transform duration-300 ease-out md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Menu</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4 mt-2">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigacija
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/80">
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <h4 className="font-semibold text-slate-900 mb-1">Potrebna pomoć?</h4>
            <p className="text-sm text-slate-500 mb-3">
              Pogledajte naša uputstva za korišćenje aplikacije.
            </p>
            <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
              Uputstva
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
