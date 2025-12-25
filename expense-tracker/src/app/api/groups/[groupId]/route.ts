import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { groupSchema } from "@/lib/validators"

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

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: { some: { userId: session.user.id } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        expenses: {
          include: {
            paidBy: { select: { id: true, name: true, email: true } },
            splits: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { date: "desc" },
        },
        _count: { select: { expenses: true } },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error("Get group error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(
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
    const validatedData = groupSchema.parse(body)

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("Update group error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
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

    await prisma.group.delete({ where: { id: groupId } })

    return NextResponse.json({ message: "Group deleted" })
  } catch (error) {
    console.error("Delete group error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
