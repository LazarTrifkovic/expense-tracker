import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { settlementSchema } from "@/lib/validators"

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

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(settlements)
  } catch (error) {
    console.error("Get settlements error:", error)
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
    const validatedData = settlementSchema.parse(body)

    const settlement = await prisma.settlement.create({
      data: {
        amount: validatedData.amount,
        groupId,
        payerId: session.user.id,
        receiverId: validatedData.receiverId,
        status: "PENDING",
      },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(settlement, { status: 201 })
  } catch (error) {
    console.error("Create settlement error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
