import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateBalances } from "@/lib/balance"

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
        groupId: { in: groups.map(g => g.id) },
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

      // Pronadji BOSS korisnike u grupi
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId: group.id },
        include: { user: { select: { id: true, role: true } } },
      })
      const bossUserIds = new Set(
        groupMembers.filter(m => m.user.role === "BOSS").map(m => m.user.id)
      )

      const balances = calculateBalances(expenses, settlements, bossUserIds)
      const userBalance = balances.get(userId) || 0

      if (userBalance > 0) {
        totalOwed += userBalance
      } else {
        totalOwes += Math.abs(userBalance)
      }
    }

    return NextResponse.json({
      totalOwed,
      totalOwes,
      groups: groups.map(g => ({
        id: g.id,
        name: g.name,
        memberCount: g._count.members,
      })),
      recentExpenses: recentExpenses.map(e => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        currency: e.currency,
        groupName: e.group.name,
        date: e.date.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
