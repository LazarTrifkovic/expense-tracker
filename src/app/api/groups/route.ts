import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { groupSchema } from "@/lib/validators"

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Dohvati sve grupe korisnika
 *     description: Vraca listu svih grupa u kojima je trenutni korisnik clan
 *     tags:
 *       - Groups
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista grupa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
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

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Kreiraj novu grupu
 *     description: Kreira novu grupu i dodaje trenutnog korisnika kao admina
 *     tags:
 *       - Groups
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Naziv grupe
 *               description:
 *                 type: string
 *                 description: Opis grupe
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, TRIP, PROJECT, OTHER]
 *                 description: Tip grupe
 *     responses:
 *       201:
 *         description: Grupa uspesno kreirana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       401:
 *         description: Korisnik nije ulogovan
 *       500:
 *         description: Greska na serveru
 */
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
