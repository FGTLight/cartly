import { z } from 'zod'

/** Luhn checksum, the check digit every real card number has. */
export function isValidCardNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

/** `MM/YY`, valid through the last day of that month. */
export function isValidExpiry(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  // Day 0 of the next month is the last day of this one.
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)
  return endOfMonth >= now && year <= now.getFullYear() + 20
}

/** `4242424242424242` → `4242 4242 4242 4242` while typing. */
export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** `1228` → `12/28` while typing. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

const required = (label: string, max = 120) =>
  z.string().trim().min(1, `Enter your ${label}`).max(max, `Use at most ${max} characters`)

export const checkoutSchema = z.object({
  fullName: required('full name', 80),
  address: required('address', 200),
  city: required('city', 80),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9 -]{3,10}$/, 'Enter a valid postal code'),
  country: required('country', 60),
  cardName: required('name on card', 80),
  cardNumber: z.string().refine(isValidCardNumber, 'Enter a valid card number'),
  expiry: z.string().refine((v) => isValidExpiry(v), 'Enter a valid, future date (MM/YY)'),
  cvc: z.string().regex(/^\d{3,4}$/, '3 or 4 digits'),
})

export type CheckoutValues = z.infer<typeof checkoutSchema>

/** Test cards for the simulated payment, in the spirit of Stripe's. */
export const TEST_CARD = '4242 4242 4242 4242'
export const DECLINED_CARD = '4000 0000 0000 0002'
