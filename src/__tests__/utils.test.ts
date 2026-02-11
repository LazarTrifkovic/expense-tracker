import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format RSD currency correctly', () => {
      const result = formatCurrency(1000, 'RSD')
      expect(result).toContain('1')
      expect(result).toContain('000')
    })

    it('should format EUR currency correctly', () => {
      const result = formatCurrency(50, 'EUR')
      expect(result).toContain('50')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-500, 'RSD')
      expect(result).toContain('500')
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2025-06-15')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format Date object correctly', () => {
      const date = new Date('2025-06-15')
      const result = formatDate(date)
      expect(result).toBeTruthy()
    })
  })

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      expect(getInitials('Lazar Trifkovic')).toBe('LT')
    })

    it('should return single initial from single name', () => {
      expect(getInitials('Lazar')).toBe('L')
    })

    it('should handle null input', () => {
      expect(getInitials(null)).toBe('?')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('?')
    })
  })

  describe('cn (classNames)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toContain('active')
    })

    it('should filter out falsy values', () => {
      const result = cn('base', false && 'hidden', null, undefined)
      expect(result).toBe('base')
    })
  })
})
