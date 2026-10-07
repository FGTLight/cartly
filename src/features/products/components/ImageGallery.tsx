import { useState } from 'react'

import { cn } from '@/lib/cn'

import { ProductImage } from './ProductImage'

export function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0)
  const current = images[selected] ?? images[0]

  return (
    <div className="flex flex-col gap-3">
      <ProductImage
        src={current}
        alt={name}
        eager
        className="aspect-square rounded-2xl border border-zinc-200 dark:border-zinc-800"
      />
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === selected}
              className={cn(
                'overflow-hidden rounded-xl border-2 transition-colors',
                i === selected
                  ? 'border-brand-500'
                  : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600',
              )}
            >
              <ProductImage src={src} alt="" className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
