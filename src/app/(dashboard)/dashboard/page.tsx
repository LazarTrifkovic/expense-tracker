"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Plus, Users, TrendingUp, TrendingDown, ArrowUpRight, Calendar, Wallet, PieChart as PieChartIcon, BarChart3 } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Boje za kategorije
const CATEGORY_COLORS: Record<string, string> = {
  FOOD: "#22c55e",
  TRANSPORT: "#3b82f6",
  UTILITIES: "#f59e0b",
  ENTERTAINMENT: "#ec4899",
  SHOPPING: "#8b5cf6",
  OTHER: "#6b7280",
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Hrana",
  TRANSPORT: "Prevoz",
  UTILITIES: "Racuni",
  ENTERTAINMENT: "Zabava",
  SHOPPING: "Kupovina",
  OTHER: "Ostalo",
}

interface DashboardData {
  totalOwed: number
  totalOwes: number
  recentExpenses: {
    id: string
    title: string
    amount: number
    currency?: string
    groupName: string
    date: string
  }[]
  groups: {
    id: string
    name: string
    memberCount: number
  }[]
  expensesByCategory?: {
    category: string
    total: number
  }[]
  expensesByMonth?: {
    month: string
    total: number
  }[]
  expensesByGroup?: {
    name: string
    total: number
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard")
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-slate-500">Ucitavanje...</p>
        </div>
      </div>
    )
  }

  const netBalance = (data?.totalOwed || 0) - (data?.totalOwes || 0)

  // Pripremi podatke za Pie chart
  const pieChartData = data?.expensesByCategory?.map(item => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.total,
    color: CATEGORY_COLORS[item.category] || "#6b7280",
  })) || []

  // Pripremi podatke za Bar chart
  const barChartData = data?.expensesByGroup?.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    total: item.total,
  })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Pregled vaseg finansijskog stanja</p>
        </div>
        <Link href="/groups/new">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25">
            <Plus className="mr-2 h-4 w-4" />
            Nova grupa
          </Button>
        </Link>
      </div>

      {/* Balance cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Duguju vama</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data?.totalOwed || 0)}
            </div>
            <p className="text-green-100 text-sm mt-1">Ukupno potrazivanja</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Dugujete</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data?.totalOwes || 0)}
            </div>
            <p className="text-red-100 text-sm mt-1">Ukupna dugovanja</p>
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden border-0 text-white ${netBalance >= 0 ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-orange-500 to-amber-600'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Neto stanje</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
            </div>
            <p className="opacity-80 text-sm mt-1">
              {netBalance >= 0 ? 'U plusu ste' : 'U minusu ste'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {(pieChartData.length > 0 || barChartData.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart - Troskovi po kategorijama */}
          {pieChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-600" />
                  Troskovi po kategorijama
                </CardTitle>
                <CardDescription>Raspodela troskova po tipu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bar Chart - Troskovi po grupama */}
          {barChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Troskovi po grupama
                </CardTitle>
                <CardDescription>Poredjenje potrosnje izmedju grupa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} layout="vertical">
                      <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Groups and Recent expenses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Vase grupe
              </CardTitle>
              <CardDescription>Grupe u kojima ste clan</CardDescription>
            </div>
            <Link href="/groups">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                Sve grupe
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.groups && data.groups.length > 0 ? (
              <div className="space-y-3">
                {data.groups.slice(0, 4).map((group, index) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg ${
                        index % 4 === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/25' :
                        index % 4 === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/25' :
                        index % 4 === 2 ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/25' :
                        'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/25'
                      }`}>
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">{group.name}</p>
                        <p className="text-sm text-slate-500">
                          {group.memberCount} {group.memberCount === 1 ? 'clan' : group.memberCount < 5 ? 'clana' : 'clanova'}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Nemate jos nijednu grupu</h3>
                <p className="text-slate-500 mb-4">Kreirajte prvu grupu i pocnite sa pracenjem troskova</p>
                <Link href="/groups/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Kreiraj grupu
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Poslednji troskovi
              </CardTitle>
              <CardDescription>Nedavno dodati troskovi</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {data?.recentExpenses && data.recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {data.recentExpenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{expense.title}</p>
                        <p className="text-sm text-slate-500">{expense.groupName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(expense.amount, expense.currency || "RSD")}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(expense.date).toLocaleDateString("sr-RS", { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Nema troskova</h3>
                <p className="text-slate-500">Troskovi ce se pojaviti ovde kada ih dodate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
