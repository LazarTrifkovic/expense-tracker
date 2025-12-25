import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateBalances, optimizeTransactions } from "@/lib/balance"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await params

    // Check membership
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 })
    }

    // Get all expenses with splits
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true },
    })

    // Get all settlements
    const settlements = await prisma.settlement.findMany({
      where: { groupId },
    })

    // Get group members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Calculate balances
    const balances = calculateBalances(expenses, settlements)

    // Optimize transactions
    const users = members.map(m => ({ id: m.user.id, name: m.user.name }))
    const optimizedDebts = optimizeTransactions(balances, users)

    // Format member balances
    const memberBalances = members.map(m => ({
      user: m.user,
      balance: balances.get(m.user.id) || 0,
    }))

    return NextResponse.json({
      memberBalances,
      optimizedDebts,
    })
  } catch (error) {
    console.error("Get balances error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
