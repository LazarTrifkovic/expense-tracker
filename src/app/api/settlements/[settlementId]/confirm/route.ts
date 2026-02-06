import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { settlementId } = await params

    // Get settlement and check if current user is the receiver
    const settlement = await prisma.settlement.findFirst({
      where: {
        id: settlementId,
        receiverId: session.user.id,
        status: "PENDING",
      },
    })

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found or already confirmed" },
        { status: 404 }
      )
    }

    const updatedSettlement = await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(updatedSettlement)
  } catch (error) {
    console.error("Confirm settlement error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
