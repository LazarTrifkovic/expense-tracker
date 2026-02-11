import { SUPPORTED_CURRENCIES, POPULAR_DESTINATIONS } from '@/lib/external-apis'

describe('External APIs', () => {
  describe('SUPPORTED_CURRENCIES', () => {
    it('should contain RSD currency', () => {
      const rsd = SUPPORTED_CURRENCIES.find(c => c.code === 'RSD')
      expect(rsd).toBeDefined()
      expect(rsd?.name).toBe('Srpski dinar')
    })

    it('should contain EUR currency', () => {
      const eur = SUPPORTED_CURRENCIES.find(c => c.code === 'EUR')
      expect(eur).toBeDefined()
      expect(eur?.symbol).toBe('€')
    })

    it('should contain USD currency', () => {
      const usd = SUPPORTED_CURRENCIES.find(c => c.code === 'USD')
      expect(usd).toBeDefined()
      expect(usd?.symbol).toBe('$')
    })

    it('should have at least 5 currencies', () => {
      expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(5)
    })

    it('each currency should have code, name and symbol', () => {
      SUPPORTED_CURRENCIES.forEach(currency => {
        expect(currency.code).toBeTruthy()
        expect(currency.name).toBeTruthy()
        expect(currency.symbol).toBeTruthy()
      })
    })
  })

  describe('POPULAR_DESTINATIONS', () => {
    it('should contain Pariz', () => {
      const pariz = POPULAR_DESTINATIONS['Pariz']
      expect(pariz).toBeDefined()
      expect(pariz.lat).toBeCloseTo(48.8566, 2)
      expect(pariz.lng).toBeCloseTo(2.3522, 2)
    })

    it('should contain Amsterdam', () => {
      const amsterdam = POPULAR_DESTINATIONS['Amsterdam']
      expect(amsterdam).toBeDefined()
      expect(amsterdam.name).toContain('Holandija')
    })

    it('should contain Beograd', () => {
      const beograd = POPULAR_DESTINATIONS['Beograd']
      expect(beograd).toBeDefined()
      expect(beograd.lat).toBeCloseTo(44.7866, 2)
    })

    it('should have at least 10 destinations', () => {
      const count = Object.keys(POPULAR_DESTINATIONS).length
      expect(count).toBeGreaterThanOrEqual(10)
    })

    it('each destination should have valid coordinates', () => {
      Object.values(POPULAR_DESTINATIONS).forEach(dest => {
        expect(dest.lat).toBeGreaterThanOrEqual(-90)
        expect(dest.lat).toBeLessThanOrEqual(90)
        expect(dest.lng).toBeGreaterThanOrEqual(-180)
        expect(dest.lng).toBeLessThanOrEqual(180)
        expect(dest.name).toBeTruthy()
      })
    })
  })
})
