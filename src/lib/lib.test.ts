import { errorMessage } from './errors'
import { discountPercent, formatPrice, toCents } from './money'

describe('money', () => {
  it('formats cents as US dollars', () => {
    expect(formatPrice(1999)).toBe('$19.99')
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(123456)).toBe('$1,234.56')
  })

  it('computes whole-number discounts', () => {
    expect(discountPercent(8000, 10000)).toBe(20)
    expect(discountPercent(1000, null)).toBe(0)
    expect(discountPercent(1000, 900)).toBe(0)
  })

  it('converts dollars to cents without float drift', () => {
    expect(toCents(19.99)).toBe(1999)
    expect(toCents(0.29)).toBe(29)
  })
})

describe('errorMessage', () => {
  it('shows messages raised on purpose by place_order', () => {
    expect(errorMessage({ code: 'P0001', message: 'Only 2 left of "Mug"' })).toBe(
      'Only 2 left of "Mug"',
    )
  })

  it('maps auth and permission codes to friendly text', () => {
    expect(errorMessage({ code: 'invalid_credentials', message: 'x' })).toBe(
      'Wrong email or password.',
    )
    expect(errorMessage({ code: '42501', message: 'permission denied for table' })).toBe(
      'You are not allowed to do that.',
    )
  })

  it('detects network failures', () => {
    expect(errorMessage(new TypeError('Failed to fetch'))).toMatch(/offline/)
  })

  it('falls back to a generic message', () => {
    expect(errorMessage(null)).toMatch(/Something went wrong/)
  })
})
