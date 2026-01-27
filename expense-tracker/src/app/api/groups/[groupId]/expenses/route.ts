import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { expenseSchema } from "@/lib/validators"

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

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: { select: { id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Get expenses error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(
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

    const body = await request.json()
    const validatedData = expenseSchema.parse(body)

    // Get group members for equal split
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    })

    // Calculate splits based on split type
    let splits: { userId: string; amount: number; percentage?: number; shares?: number }[] = []

    if (validatedData.splitType === "EQUAL") {
      const splitAmount = validatedData.amount / members.length
      splits = members.map(m => ({
        userId: m.userId,
        amount: Math.round(splitAmount * 100) / 100,
      }))
    } else if (validatedData.splits) {
      splits = validatedData.splits.map(s => ({
        userId: s.userId,
        amount: s.amount || 0,
        percentage: s.percentage,
        shares: s.shares,
      }))
    }

    const expense = await prisma.expense.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        amount: validatedData.amount,
        currency: validatedData.currency,
        date: new Date(validatedData.date),
        category: validatedData.category,
        splitType: validatedData.splitType,
        groupId,
        paidById: session.user.id,
        splits: {
          create: splits,
        },
      },
      include: {
        paidBy: { select: { id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
