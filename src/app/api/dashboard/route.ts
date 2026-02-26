import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateBalances } from "@/lib/balance"

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Dohvati dashboard statistike
 *     description: Vraca pregled dugovanja, grupa i poslednjih troskova za ulogovanog korisnika
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard podaci
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOwed:
 *                   type: number
 *                   description: Ukupno vam duguju
 *                 totalOwes:
 *                   type: number
 *                   description: Ukupno dugujete
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       memberCount:
 *                         type: number
 *                 recentExpenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Korisnik nije ulogovan
 *       500:
 *         description: Greska na serveru
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's groups
    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true } },
      },
    })

    // Get recent expenses from user's groups
    const recentExpenses = await prisma.expense.findMany({
      where: {
        groupId: { in: groups.map((g: any) => g.id) },
      },
      include: {
        group: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Calculate total balances
    let totalOwed = 0
    let totalOwes = 0

    for (const group of groups) {
      const expenses = await prisma.expense.findMany({
        where: { groupId: group.id },
        include: { splits: true },
      })

      const settlements = await prisma.settlement.findMany({
        where: { groupId: group.id },
      })

      // Pronadji BOSS i TATA korisnike u grupi
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId: group.id },
        include: { user: { select: { id: true, role: true } } },
      })
      const bossUserIds = new Set<string>(
        groupMembers.filter((m: any) => m.user.role === "BOSS").map((m: any) => m.user.id)
      )
      // TATA preuzima troskove samo u TRIP grupama
      const tataUserIds = group.type === "TRIP"
        ? new Set<string>(groupMembers.filter((m: any) => m.user.role === "TATA").map((m: any) => m.user.id))
        : new Set<string>()

      const balances = calculateBalances(expenses, settlements, bossUserIds, tataUserIds)
      const userBalance = balances.get(userId) || 0

      if (userBalance > 0) {
        totalOwed += userBalance
      } else {
        totalOwes += Math.abs(userBalance)
      }
    }

    // Dohvati sve troskove za grafike
    const allExpenses = await prisma.expense.findMany({
      where: {
        groupId: { in: groups.map((g: any) => g.id) },
      },
      select: {
        amount: true,
        category: true,
        currency: true,
        date: true,
        group: { select: { name: true } },
      },
    })

    // Grupisi po kategorijama za pie chart
    const categoryTotals = allExpenses.reduce((acc: Record<string, number>, expense: any) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = 0
      }
      // Konvertuj u RSD za konzistentnost (pojednostavljena konverzija)
      const amountInRSD = expense.currency === "EUR" ? expense.amount * 117 : expense.amount
      acc[category] += amountInRSD
      return acc
    }, {} as Record<string, number>)

    const expensesByCategory = Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total: Math.round(total as number),
    }))

    // Grupisi po mesecima za bar chart (poslednjih 6 meseci)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTotals = allExpenses
      .filter((e: any) => new Date(e.date) >= sixMonthsAgo)
      .reduce((acc: Record<string, number>, expense: any) => {
        const month = new Date(expense.date).toLocaleDateString("sr-RS", { month: "short", year: "2-digit" })
        if (!acc[month]) {
          acc[month] = 0
        }
        const amountInRSD = expense.currency === "EUR" ? expense.amount * 117 : expense.amount
        acc[month] += amountInRSD
        return acc
      }, {} as Record<string, number>)

    const expensesByMonth = Object.entries(monthlyTotals).map(([month, total]) => ({
      month,
      total: Math.round(total as number),
    }))

    // Grupisi po grupama za uporedni prikaz
    const groupTotals = allExpenses.reduce((acc: Record<string, number>, expense: any) => {
      const groupName = expense.group.name
      if (!acc[groupName]) {
        acc[groupName] = 0
      }
      const amountInRSD = expense.currency === "EUR" ? expense.amount * 117 : expense.amount
      acc[groupName] += amountInRSD
      return acc
    }, {} as Record<string, number>)

    const expensesByGroup = Object.entries(groupTotals).map(([name, total]) => ({
      name,
      total: Math.round(total as number),
    }))

    return NextResponse.json({
      totalOwed,
      totalOwes,
      groups: groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        memberCount: g._count.members,
      })),
      recentExpenses: recentExpenses.map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        currency: e.currency,
        groupName: e.group.name,
        date: e.date.toISOString(),
      })),
      // Podaci za grafike
      expensesByCategory,
      expensesByMonth,
      expensesByGroup,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
