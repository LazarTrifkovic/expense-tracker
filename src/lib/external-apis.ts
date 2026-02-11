/**
 * Eksterni API servisi za Expense Tracker
 *
 * 1. Exchange Rate API - konverzija valuta
 * 2. Google Maps API - prikaz lokacija
 */

// ===========================================
// EXCHANGE RATE API
// Besplatni API za kursnu listu: exchangerate-api.com
// ===========================================

export interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
}

export interface ConversionResult {
  from: string
  to: string
  amount: number
  result: number
  rate: number
}

const EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest"

/**
 * Dohvata kursnu listu za zadatu valutu
 */
export async function getExchangeRates(baseCurrency: string = "EUR"): Promise<ExchangeRates> {
  const response = await fetch(`${EXCHANGE_API_URL}/${baseCurrency}`)

  if (!response.ok) {
    throw new Error("Greska pri dohvatanju kursne liste")
  }

  const data = await response.json()

  return {
    base: data.base,
    date: data.date,
    rates: data.rates,
  }
}

/**
 * Konvertuje iznos iz jedne valute u drugu
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  const rates = await getExchangeRates(fromCurrency)
  const rate = rates.rates[toCurrency]

  if (!rate) {
    throw new Error(`Valuta ${toCurrency} nije podrzana`)
  }

  return {
    from: fromCurrency,
    to: toCurrency,
    amount,
    result: Math.round(amount * rate * 100) / 100,
    rate,
  }
}

/**
 * Vraca listu podrzanih valuta
 */
export const SUPPORTED_CURRENCIES = [
  { code: "RSD", name: "Srpski dinar", symbol: "RSD" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "Americki dolar", symbol: "$" },
  { code: "GBP", name: "Britanska funta", symbol: "£" },
  { code: "CHF", name: "Svajcarski franak", symbol: "CHF" },
  { code: "BAM", name: "Bosanska marka", symbol: "KM" },
  { code: "HRK", name: "Hrvatska kuna", symbol: "kn" },
]

// ===========================================
// GOOGLE MAPS API
// Za prikaz lokacija putovanja
// ===========================================

export interface Location {
  lat: number
  lng: number
  name: string
  address?: string
}

export interface GeocodeResult {
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  place_id: string
}

/**
 * Pretvara adresu u koordinate (geocoding)
 * Napomena: Zahteva GOOGLE_MAPS_API_KEY u env
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY nije postavljen")
    return null
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== "OK" || !data.results[0]) {
    return null
  }

  const result = data.results[0]

  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    name: address,
    address: result.formatted_address,
  }
}

/**
 * Popularne destinacije sa koordinatama (fallback bez API kljuca)
 */
export const POPULAR_DESTINATIONS: Record<string, Location> = {
  "Pariz": { lat: 48.8566, lng: 2.3522, name: "Pariz, Francuska" },
  "Amsterdam": { lat: 52.3676, lng: 4.9041, name: "Amsterdam, Holandija" },
  "Rim": { lat: 41.9028, lng: 12.4964, name: "Rim, Italija" },
  "London": { lat: 51.5074, lng: -0.1278, name: "London, UK" },
  "Bec": { lat: 48.2082, lng: 16.3738, name: "Bec, Austrija" },
  "Barcelona": { lat: 41.3851, lng: 2.1734, name: "Barcelona, Spanija" },
  "Prag": { lat: 50.0755, lng: 14.4378, name: "Prag, Ceska" },
  "Berlin": { lat: 52.5200, lng: 13.4050, name: "Berlin, Nemacka" },
  "Budimpesta": { lat: 47.4979, lng: 19.0402, name: "Budimpesta, Madjarska" },
  "Beograd": { lat: 44.7866, lng: 20.4489, name: "Beograd, Srbija" },
  "Novi Sad": { lat: 45.2671, lng: 19.8335, name: "Novi Sad, Srbija" },
  "Nis": { lat: 43.3209, lng: 21.8954, name: "Nis, Srbija" },
}

/**
 * Vraca koordinate za grad (koristi cache ili geocoding)
 */
export async function getLocationCoordinates(cityName: string): Promise<Location | null> {
  // Prvo proveri cache popularnih destinacija
  const cached = POPULAR_DESTINATIONS[cityName]
  if (cached) {
    return cached
  }

  // Ako nije u cache-u, koristi geocoding API
  return geocodeAddress(cityName)
}
