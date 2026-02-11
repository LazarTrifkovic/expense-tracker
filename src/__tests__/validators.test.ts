import { registerSchema, loginSchema, groupSchema } from '@/lib/validators'

describe('Validators', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'Lazar Trifkovic',
        email: 'lazar@test.com',
        password: 'password123',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'Lazar',
        email: 'invalid-email',
        password: 'password123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const invalidData = {
        name: 'Lazar',
        email: 'lazar@test.com',
        password: '123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        email: 'lazar@test.com',
        password: 'password123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'lazar@test.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'lazar@test.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('groupSchema', () => {
    it('should validate correct group data', () => {
      const validData = {
        name: 'Put u Pariz',
        type: 'TRIP',
      }

      const result = groupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept group with description', () => {
      const validData = {
        name: 'Troskovi za stan',
        description: 'Deljenje troskova sa cimerima',
        type: 'APARTMENT',
      }

      const result = groupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty group name', () => {
      const invalidData = {
        name: '',
        type: 'TRIP',
      }

      const result = groupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid group type', () => {
      const invalidData = {
        name: 'Test Grupa',
        type: 'INVALID_TYPE',
      }

      const result = groupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept all valid group types', () => {
      const validTypes = ['APARTMENT', 'TRIP', 'PROJECT', 'OTHER']

      validTypes.forEach(type => {
        const result = groupSchema.safeParse({ name: 'Test', type })
        expect(result.success).toBe(true)
      })
    })
  })
})
