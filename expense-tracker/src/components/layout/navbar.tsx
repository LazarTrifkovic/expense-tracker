"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Menu, LogOut, User, Settings, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:inline">
          ExpenseTracker
        </span>
      </Link>
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-purple-100 hover:ring-purple-200 transition-all">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          <DropdownMenuLabel className="p-3 bg-slate-50 rounded-lg mb-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
              <p className="text-xs text-slate-500">{session?.user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            <Link href="/settings" className="flex items-center py-2">
              <User className="mr-3 h-4 w-4 text-slate-500" />
              Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            <Link href="/settings" className="flex items-center py-2">
              <Settings className="mr-3 h-4 w-4 text-slate-500" />
              Podešavanja
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-red-600 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Odjavi se
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
