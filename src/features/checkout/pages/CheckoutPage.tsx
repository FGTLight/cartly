import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Lock, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { buttonClass } from '@/components/ui/styles'
import { EmptyState } from '@/components/ui/feedback'
import { InputField } from '@/components/ui/Field'
import { useAuth } from '@/features/auth/context'
import { OrderSummary } from '@/features/cart/components/OrderSummary'
import { cartTotals } from '@/features/cart/pricing'
import { useCart } from '@/features/cart/store'
import { usePlaceOrder } from '@/features/orders/hooks'
import { ProductImage } from '@/features/products/components/ProductImage'
import { errorMessage } from '@/lib/errors'
import { formatPrice } from '@/lib/money'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { authorizePayment } from '../payment'
import {
  type CheckoutValues,
  checkoutSchema,
  DECLINED_CARD,
  formatCardNumber,
  formatExpiry,
  TEST_CARD,
} from '../schema'

type Step = 'idle' | 'paying' | 'placing'

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const { profile } = useAuth()
  const lines = useCart((s) => s.lines)
  const clearCart = useCart((s) => s.clear)
  const navigate = useNavigate()
  const placeOrder = usePlaceOrder()
  const [step, setStep] = useState<Step>('idle')
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: profile?.fullName ?? '', cardName: profile?.fullName ?? '' },
  })

  // Clearing the cart empties `lines`; don't flash the empty state.
  if (placedOrderId) return <Navigate to={`/orders/${placedOrderId}?placed=1`} replace />

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" />}
        title="Nothing to check out"
        description="Your cart is empty."
        action={
          <Link to="/shop" className={buttonClass()}>
            Start shopping
          </Link>
        }
      />
    )
  }

  const totals = cartTotals(lines)
  const busy = step !== 'idle'

  const onSubmit = async (values: CheckoutValues) => {
    try {
      setStep('paying')
      const last4 = await authorizePayment(values.cardNumber)
      setStep('placing')
      const orderId = await placeOrder.mutateAsync({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        shipping: {
          full_name: values.fullName,
          address: values.address,
          city: values.city,
          postal_code: values.postalCode,
          country: values.country,
        },
        paymentLast4: last4,
      })
      setPlacedOrderId(orderId)
      clearCart()
      navigate(`/orders/${orderId}?placed=1`, { replace: true })
    } catch (error) {
      toast.error(errorMessage(error))
      setStep('idle')
    }
  }

  const cardNumber = register('cardNumber')
  const expiry = register('expiry')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="flex flex-col gap-8">
          <fieldset disabled={busy} className="flex flex-col gap-4">
            <legend className="mb-4 text-lg font-semibold">Shipping address</legend>
            <InputField
              label="Full name"
              autoComplete="shipping name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <InputField
              label="Address"
              autoComplete="shipping street-address"
              error={errors.address?.message}
              {...register('address')}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <InputField
                label="City"
                autoComplete="shipping address-level2"
                error={errors.city?.message}
                {...register('city')}
              />
              <InputField
                label="Postal code"
                autoComplete="shipping postal-code"
                error={errors.postalCode?.message}
                {...register('postalCode')}
              />
              <InputField
                label="Country"
                autoComplete="shipping country-name"
                error={errors.country?.message}
                {...register('country')}
              />
            </div>
          </fieldset>

          <fieldset disabled={busy} className="flex flex-col gap-4">
            <legend className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="size-5" aria-hidden />
              Payment
            </legend>
            <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              <p>
                <strong>Demo store:</strong> no real payment is made. Use{' '}
                <button
                  type="button"
                  className="font-mono underline"
                  onClick={() => setValue('cardNumber', TEST_CARD, { shouldValidate: true })}
                >
                  {TEST_CARD}
                </button>
                , any future date and any CVC. <span className="font-mono">{DECLINED_CARD}</span>{' '}
                simulates a declined card.
              </p>
            </div>
            <InputField
              label="Name on card"
              autoComplete="cc-name"
              error={errors.cardName?.message}
              {...register('cardName')}
            />
            <InputField
              label="Card number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              error={errors.cardNumber?.message}
              {...cardNumber}
              onChange={(e) => {
                e.target.value = formatCardNumber(e.target.value)
                return cardNumber.onChange(e)
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                error={errors.expiry?.message}
                {...expiry}
                onChange={(e) => {
                  e.target.value = formatExpiry(e.target.value)
                  return expiry.onChange(e)
                }}
              />
              <InputField
                label="CVC"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                placeholder="123"
                error={errors.cvc?.message}
                {...register('cvc')}
              />
            </div>
          </fieldset>
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-zinc-200 p-6 lg:sticky lg:top-24 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Your order</h2>
          <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-3 text-sm">
                <div className="relative">
                  <ProductImage
                    src={line.image}
                    alt=""
                    className="size-14 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  />
                  <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-zinc-700 text-xs text-white">
                    {line.quantity}
                  </span>
                </div>
                <span className="line-clamp-2 flex-1">{line.name}</span>
                <span className="font-medium">{formatPrice(line.priceCents * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary totals={totals}>
            <Button type="submit" size="lg" loading={busy} className="w-full">
              {step === 'paying' ? (
                'Processing payment…'
              ) : step === 'placing' ? (
                'Placing order…'
              ) : (
                <>
                  <Lock className="size-4" aria-hidden />
                  Pay {formatPrice(totals.totalCents)}
                </>
              )}
            </Button>
          </OrderSummary>
        </aside>
      </form>
    </div>
  )
}
