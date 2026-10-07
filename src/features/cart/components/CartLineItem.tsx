import { Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { ProductImage } from '@/features/products/components/ProductImage'
import { formatPrice } from '@/lib/money'

import { MAX_QUANTITY } from '../pricing'
import { type CartLine, useCart } from '../store'

interface CartLineItemProps {
  line: CartLine
  /** Called when the product link is followed (closes the drawer). */
  onNavigate?: () => void
}

export function CartLineItem({ line, onNavigate }: CartLineItemProps) {
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)

  return (
    <li className="flex gap-4 py-4">
      <ProductImage
        src={line.image}
        alt=""
        className="size-20 shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-800"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex justify-between gap-3">
          <Link
            to={`/products/${line.slug}`}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium hover:text-brand-600"
          >
            {line.name}
          </Link>
          <p className="shrink-0 text-sm font-semibold">
            {formatPrice(line.priceCents * line.quantity)}
          </p>
        </div>
        <p className="text-xs text-zinc-500">{formatPrice(line.priceCents)} each</p>
        <div className="flex items-center justify-between">
          <QuantityStepper
            size="sm"
            label={`Quantity of ${line.name}`}
            value={line.quantity}
            max={Math.min(line.stock, MAX_QUANTITY)}
            onChange={(q) => setQuantity(line.productId, q)}
          />
          <button
            type="button"
            onClick={() => remove(line.productId)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            aria-label={`Remove ${line.name}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  )
}
