import { authorizePayment, PaymentDeclinedError } from './payment'
import {
  checkoutSchema,
  DECLINED_CARD,
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidExpiry,
  TEST_CARD,
} from './schema'

describe('isValidCardNumber (Luhn)', () => {
  it.each([TEST_CARD, '5555 5555 5555 4444', '378282246310005'])('accepts %s', (n) => {
    expect(isValidCardNumber(n)).toBe(true)
  })

  it.each(['4242 4242 4242 4241', '1234', '', 'abcd efgh ijkl mnop'])('rejects "%s"', (n) => {
    expect(isValidCardNumber(n)).toBe(false)
  })
})

describe('isValidExpiry', () => {
  const now = new Date(2026, 9, 7) // October 7, 2026

  it('accepts the current month until its last day', () => {
    expect(isValidExpiry('10/26', now)).toBe(true)
    expect(isValidExpiry('10/26', new Date(2026, 9, 31, 12))).toBe(true)
  })

  it('rejects past months, bad months and bad formats', () => {
    expect(isValidExpiry('09/26', now)).toBe(false)
    expect(isValidExpiry('13/27', now)).toBe(false)
    expect(isValidExpiry('1027', now)).toBe(false)
  })

  it('rejects dates too far in the future', () => {
    expect(isValidExpiry('01/99', now)).toBe(false)
  })
})

describe('input formatters', () => {
  it('groups card digits by four', () => {
    expect(formatCardNumber('4242424242424242')).toBe(TEST_CARD)
    expect(formatCardNumber('4242-42')).toBe('4242 42')
  })

  it('inserts the expiry slash', () => {
    expect(formatExpiry('1228')).toBe('12/28')
    expect(formatExpiry('1')).toBe('1')
    expect(formatExpiry('12/289')).toBe('12/28')
  })
})

describe('checkoutSchema', () => {
  const valid = {
    fullName: 'Ada Lovelace',
    address: '12 Analytical St',
    city: 'London',
    postalCode: 'NW1 6XE',
    country: 'United Kingdom',
    cardName: 'Ada Lovelace',
    cardNumber: TEST_CARD,
    expiry: '12/40',
    cvc: '123',
  }

  it('accepts a complete form', () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true)
  })

  it('reports each invalid field', () => {
    const result = checkoutSchema.safeParse({ ...valid, city: ' ', cvc: '12', cardNumber: '1' })
    expect(result.success).toBe(false)
    const paths = result.error!.issues.map((i) => i.path[0])
    expect(paths).toEqual(expect.arrayContaining(['city', 'cvc', 'cardNumber']))
  })
})

describe('authorizePayment', () => {
  it('returns only the last 4 digits', async () => {
    await expect(authorizePayment(TEST_CARD, 0)).resolves.toBe('4242')
  })

  it('declines the test decline card', async () => {
    await expect(authorizePayment(DECLINED_CARD, 0)).rejects.toBeInstanceOf(PaymentDeclinedError)
  })
})
