import { DECLINED_CARD } from './schema'

export class PaymentDeclinedError extends Error {
  constructor() {
    super('Your card was declined. Try another card.')
    this.name = 'PaymentDeclinedError'
  }
}

/**
 * Simulated payment gateway. Nothing leaves the browser: the full card
 * number, expiry and CVC are discarded here, and only the last 4 digits
 * are stored with the order.
 */
export async function authorizePayment(cardNumber: string, delayMs = 1200): Promise<string> {
  const digits = cardNumber.replace(/\D/g, '')
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  if (digits === DECLINED_CARD.replace(/\D/g, '')) throw new PaymentDeclinedError()
  return digits.slice(-4)
}
