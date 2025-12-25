import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validators"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Korisnik sa ovom email adresom već postoji" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    const verifyToken = crypto.randomUUID()

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        verifyToken,
      },
    })

    // TODO: Send verification email when RESEND_API_KEY is set
    // await sendVerificationEmail(user.email, verifyToken)

    return NextResponse.json(
      { message: "Korisnik uspešno kreiran", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Greška pri registraciji" },
      { status: 500 }
    )
  }
}
