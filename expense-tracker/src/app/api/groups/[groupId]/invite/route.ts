import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inviteSchema } from "@/lib/validators"

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

    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: "ADMIN",
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = inviteSchema.parse(body)

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      const existingMember = await prisma.groupMember.findFirst({
        where: { groupId, userId: existingUser.id },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: "Korisnik je već član grupe" },
          { status: 400 }
        )
      }

      // Add existing user directly
      await prisma.groupMember.create({
        data: {
          groupId,
          userId: existingUser.id,
          role: "MEMBER",
        },
      })

      return NextResponse.json({ message: "Korisnik je dodat u grupu" })
    }

    // Create invitation for non-existing user
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email: validatedData.email,
        groupId,
        expiresAt,
      },
    })

    // TODO: Send invitation email when RESEND_API_KEY is set

    return NextResponse.json({
      message: "Pozivnica poslata",
      invitationId: invitation.id,
    })
  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
