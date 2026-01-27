"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Receipt, Users, ArrowRightLeft, Settings } from "lucide-react"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { CATEGORY_LABELS, GROUP_TYPE_LABELS, type Category, type GroupType } from "@/types"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { InviteDialog } from "@/components/groups/invite-dialog"
import { SettlementDialog } from "@/components/settlements/settlement-dialog"

interface GroupMember {
  id: string
  role: string
  user: { id: string; name: string | null; email: string; image: string | null; role?: string }
}

interface Expense {
  id: string
  title: string
  amount: number
  currency?: string
  date: string
  category: Category
  paidBy: { id: string; name: string | null; email: string; role?: string }
  splits: { userId: string; amount: number; user: { name: string | null } }[]
}

interface GroupData {
  id: string
  name: string
  description: string | null
  type: GroupType
  members: GroupMember[]
  expenses: Expense[]
}

interface BalanceData {
  memberBalances: { user: { id: string; name: string | null }; balance: number }[]
  optimizedDebts: { odUser: { id: string; name: string | null }; kaUser: { id: string; name: string | null }; iznos: number }[]
}

export default function GroupPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [group, setGroup] = useState<GroupData | null>(null)
  const [balances, setBalances] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      const [groupRes, balancesRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/balances`),
      ])

      if (groupRes.ok) {
        setGroup(await groupRes.json())
      }
      if (balancesRes.ok) {
        setBalances(await balancesRes.json())
      }
    } catch (error) {
      console.error("Failed to fetch group:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [groupId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!group) {
    return <div>Grupa nije pronađena</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">
            {GROUP_TYPE_LABELS[group.type]} - {group.members.length} članova
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Pozovi
          </Button>
          <Button onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novi trošak
          </Button>
        </div>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">
            <Receipt className="mr-2 h-4 w-4" />
            Troškovi
          </TabsTrigger>
          <TabsTrigger value="balances">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Dugovi
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Članovi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          {group.expenses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nema troškova</h3>
                <p className="text-muted-foreground mb-4">Dodajte prvi trošak u grupu</p>
                <Button onClick={() => setExpenseDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj trošak
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {group.expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.paidBy.name || expense.paidBy.email} je platio/la - {CATEGORY_LABELS[expense.category]}
                          {expense.paidBy.role === "BOSS" && (
                            <span className="ml-2 text-amber-600 font-medium">(šef - bez dugovanja)</span>
                          )}
                          {group.type === "TRIP" && group.members.some(m => m.user.role === "TATA") && expense.paidBy.role !== "BOSS" && (
                            <span className="ml-2 text-blue-600 font-medium">(tata plaća)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(expense.amount, expense.currency || "RSD")}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="balances" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stanje po članovima</CardTitle>
              <CardDescription>Pozitivan balans = duguju vama, Negativan = dugujete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {balances?.memberBalances.map((mb) => (
                  <div key={mb.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(mb.user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{mb.user.name || "Nepoznato"}</span>
                    </div>
                    <span className={`font-bold ${mb.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {mb.balance >= 0 ? "+" : ""}{formatCurrency(mb.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Optimizovane transakcije</CardTitle>
                  <CardDescription>Minimalan broj uplata za izjednačenje</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSettlementDialogOpen(true)}>
                  Evidentiraj uplatu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {balances?.optimizedDebts && balances.optimizedDebts.length > 0 ? (
                <div className="space-y-3">
                  {balances.optimizedDebts.map((debt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{debt.odUser.name || "?"}</span>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{debt.kaUser.name || "?"}</span>
                      </div>
                      <span className="font-bold text-primary">{formatCurrency(debt.iznos)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Svi dugovi su izmireni!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Članovi grupe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.user.role === "BOSS" && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 font-medium">
                          Šef
                        </span>
                      )}
                      {member.user.role === "TATA" && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                          Tata
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${member.role === "ADMIN" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {member.role === "ADMIN" ? "Admin" : "Član"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        groupId={groupId}
        members={group.members.map(m => m.user)}
        onSuccess={fetchData}
      />

      <InviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        groupId={groupId}
      />

      <SettlementDialog
        open={settlementDialogOpen}
        onOpenChange={setSettlementDialogOpen}
        groupId={groupId}
        members={group.members.map(m => m.user)}
        onSuccess={fetchData}
      />
    </div>
  )
}
