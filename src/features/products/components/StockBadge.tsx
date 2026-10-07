import { Badge } from '@/components/ui/feedback'

export const LOW_STOCK = 5

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge tone="danger">Out of stock</Badge>
  if (stock <= LOW_STOCK) return <Badge tone="warning">Only {stock} left</Badge>
  return <Badge tone="brand">In stock</Badge>
}
