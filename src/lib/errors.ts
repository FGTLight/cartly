/**
 * Turns Supabase / network errors into messages that are safe to show.
 * Messages raised on purpose by our SQL functions are shown as-is.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return 'You appear to be offline. Check your connection.'
  }
  if (typeof error === 'object' && error !== null) {
    const { code, message } = error as { code?: string; message?: string }
    // Raised by place_order(): stock, availability, validation.
    if (code && ['P0001', 'P0002', '22023', '28000'].includes(code) && message) {
      return message
    }
    if (code === '42501') return 'You are not allowed to do that.'
    if (code === 'invalid_credentials') return 'Wrong email or password.'
    if (code === 'user_already_exists') {
      return 'An account with this email already exists.'
    }
    if (code === 'email_not_confirmed') {
      return 'Confirm your email address, then sign in.'
    }
    if (message) return message
  }
  return 'Something went wrong. Please try again.'
}
