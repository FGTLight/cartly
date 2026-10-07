import { Link2, Star, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { controlClass } from '@/components/ui/styles'
import { ProductImage } from '@/features/products/components/ProductImage'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'

import { uploadProductImage } from '../api'

interface ImagesEditorProps {
  value: string[]
  onChange: (images: string[]) => void
  error?: string
  disabled?: boolean
}

/** Upload to Supabase Storage or paste a URL; the first image is the cover. */
export function ImagesEditor({ value, onChange, error, disabled }: ImagesEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) urls.push(await uploadProductImage(file))
      onChange([...value, ...urls])
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const addUrl = () => {
    try {
      const parsed = new URL(url.trim())
      if (!/^https?:$/.test(parsed.protocol)) throw new Error()
      onChange([...value, parsed.href])
      setUrl('')
    } catch {
      toast.error('Enter a valid http(s) image URL')
    }
  }

  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">Images</legend>
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((src, i) => (
            <li key={`${src}-${i}`} className="group relative">
              <ProductImage
                src={src}
                alt={`Image ${i + 1}`}
                className={cn(
                  'aspect-square rounded-xl border-2',
                  i === 0 ? 'border-brand-500' : 'border-zinc-200 dark:border-zinc-800',
                )}
              />
              {i === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onChange([src, ...value.filter((_, j) => j !== i)])}
                  className="absolute bottom-1.5 left-1.5 rounded bg-white/90 p-1 text-zinc-700 shadow dark:bg-zinc-800/90 dark:text-zinc-200"
                  aria-label={`Make image ${i + 1} the cover`}
                >
                  <Star className="size-3.5" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-1 text-zinc-700 shadow hover:text-red-600 dark:bg-zinc-800/90 dark:text-zinc-200"
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Button
          variant="secondary"
          loading={uploading}
          onClick={() => fileInput.current?.click()}
        >
          {!uploading && <Upload className="size-4" aria-hidden />}
          Upload images
        </Button>
        <div className="flex flex-1 gap-2">
          <label className="sr-only" htmlFor="image-url">
            Image URL
          </label>
          <input
            id="image-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl()
              }
            }}
            placeholder="…or paste an image URL"
            className={controlClass}
          />
          <Button variant="secondary" size="icon" onClick={addUrl} aria-label="Add image URL" disabled={!url.trim()}>
            <Link2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      <p className="text-xs text-zinc-500">JPEG, PNG or WebP, up to 3 MB each.</p>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  )
}
