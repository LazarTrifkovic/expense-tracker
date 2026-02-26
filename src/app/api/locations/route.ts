import { NextResponse } from "next/server"
import { getLocationCoordinates, POPULAR_DESTINATIONS } from "@/lib/external-apis"

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Dohvati popularne destinacije
 *     description: Vraca listu popularnih destinacija sa koordinatama
 *     tags:
 *       - Locations
 *     parameters:
 *       - name: city
 *         in: query
 *         description: Ime grada za pretragu koordinata
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista destinacija ili koordinate grada
 *       404:
 *         description: Grad nije pronadjen
 *       500:
 *         description: Greska na serveru
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    // Ako je zadat grad, vrati njegove koordinate
    if (city) {
      const location = await getLocationCoordinates(city)

      if (!location) {
        return NextResponse.json(
          { error: `Grad "${city}" nije pronadjen` },
          { status: 404 }
        )
      }

      return NextResponse.json(location)
    }

    // Inace vrati sve popularne destinacije
    const destinations = Object.entries(POPULAR_DESTINATIONS).map(([key, value]) => ({
      id: key.toLowerCase().replace(/\s+/g, "-"),
      ...value,
      displayName: key,
    }))

    return NextResponse.json({
      destinations,
      total: destinations.length,
    })
  } catch (error) {
    console.error("Locations API error:", error)
    return NextResponse.json({ error: "Greska pri dohvatanju lokacija" }, { status: 500 })
  }
}
