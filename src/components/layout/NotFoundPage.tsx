import { MapPinOff } from 'lucide-react'
import { Link } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { EmptyState } from '@/components/ui/feedback'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <EmptyState
      icon={<MapPinOff className="size-6" />}
      title="Page not found"
      description="The page you're looking for doesn't exist or was moved."
      action={
        <Link to="/" className={buttonClass()}>
          Back to the store
        </Link>
      }
    />
  )
}
