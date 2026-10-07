import { ImageOff } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/cn'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  /** Above-the-fold images load eagerly. */
  eager?: boolean
}

/** Product photo with a neutral fallback when it is missing or broken. */
export function ProductImage({ src, alt, className, eager = false }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const broken = !src || failedSrc === src

  return (
    <div className={cn('overflow-hidden bg-zinc-100 dark:bg-zinc-800', className)}>
      {broken ? (
        <div className="flex size-full items-center justify-center text-zinc-400">
          <ImageOff className="size-8" aria-hidden />
          <span className="sr-only">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="size-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
        />
      )}
    </div>
  )
}
