import { NextResponse } from "next/server"
import { getExchangeRates, convertCurrency, SUPPORTED_CURRENCIES } from "@/lib/external-apis"

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/currency:
 *   get:
 *     summary: Dohvati kursnu listu
 *     description: Vraca trenutne kurseve za zadatu baznu valutu
 *     tags:
 *       - Currency
 *     parameters:
 *       - name: base
 *         in: query
 *         description: Bazna valuta (default EUR)
 *         schema:
 *           type: string
 *           default: EUR
 *     responses:
 *       200:
 *         description: Kursna lista
 *       500:
 *         description: Greska na serveru
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const baseCurrency = searchParams.get("base") || "EUR"

    const rates = await getExchangeRates(baseCurrency)

    return NextResponse.json({
      ...rates,
      supportedCurrencies: SUPPORTED_CURRENCIES,
    })
  } catch (error) {
    console.error("Currency API error:", error)
    return NextResponse.json({ error: "Greska pri dohvatanju kursne liste" }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/currency:
 *   post:
 *     summary: Konvertuj valutu
 *     description: Konvertuje iznos iz jedne valute u drugu
 *     tags:
 *       - Currency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - from
 *               - to
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Iznos za konverziju
 *               from:
 *                 type: string
 *                 description: Izvorna valuta
 *               to:
 *                 type: string
 *                 description: Ciljna valuta
 *     responses:
 *       200:
 *         description: Rezultat konverzije
 *       400:
 *         description: Nedostaju parametri
 *       500:
 *         description: Greska na serveru
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, from, to } = body

    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: "Nedostaju parametri: amount, from, to" },
        { status: 400 }
      )
    }

    const result = await convertCurrency(amount, from, to)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Currency conversion error:", error)
    return NextResponse.json({ error: "Greska pri konverziji" }, { status: 500 })
  }
}
