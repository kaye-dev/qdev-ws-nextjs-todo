import { generateUUID, isValidUUID } from '../uuid'

describe('UUID Utils', () => {
  describe('generateUUID', () => {
    it('should generate a UUID using crypto.randomUUID when available', () => {
      const result = generateUUID()
      expect(result).toBe('test-uuid-1-5678-9012-123456789012')
      expect(global.crypto.randomUUID).toHaveBeenCalled()
    })

    it('should generate a UUID using fallback when crypto.randomUUID is not available', () => {
      // Mock crypto as undefined
      const originalCrypto = global.crypto
      delete (global as unknown as { crypto: unknown }).crypto

      const result = generateUUID()

      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

      // Restore crypto
      global.crypto = originalCrypto
    })
  })

  describe('isValidUUID', () => {
    it('should return true for valid UUID v4', () => {
      const validUUIDs = [
        '123e4567-e89b-42d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '550e8400-e29b-41d4-a716-446655440000',
      ]

      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true)
      })
    })

    it('should return false for invalid UUIDs', () => {
      const invalidUUIDs = [
        '',
        'not-a-uuid',
        '123e4567-e89b-12d3-a456', // too short
        '123e4567-e89b-12d3-a456-426614174000-extra', // too long
        '123e4567-e89b-12d3-g456-426614174000', // invalid character
        '123e4567e89b12d3a456426614174000', // missing hyphens
      ]

      invalidUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(false)
      })
    })
  })
})
