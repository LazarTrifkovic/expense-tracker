import { NextResponse } from "next/server"
import { getApiDocs } from "@/lib/swagger"

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Vrati OpenAPI specifikaciju
 *     description: Vraća kompletnu OpenAPI/Swagger specifikaciju za API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: OpenAPI JSON specifikacija
 */
export async function GET() {
  const spec = await getApiDocs()
  return NextResponse.json(spec)
}
