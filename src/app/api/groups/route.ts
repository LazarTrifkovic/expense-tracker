import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { groupSchema } from "@/lib/validators"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId: session.user.id } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Get groups error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = groupSchema.parse(body)

    const group = await prisma.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error("Create group error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
