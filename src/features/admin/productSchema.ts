import { z } from 'zod'

import { toCents } from '@/lib/money'

import type { AdminProduct, ProductInput } from './api'

/** "Apple AirPods Max!" → "apple-airpods-max" (matches the DB check). */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

const money = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'Use a price like 19.99')

/** Form values are strings, as typed; `toInput` converts them. */
export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, 'At least 2 characters').max(120, 'At most 120 characters'),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, numbers and dashes'),
    description: z.string().trim().max(2000, 'At most 2000 characters'),
    brand: z.string().trim().max(60, 'At most 60 characters'),
    categoryId: z.string(),
    price: money,
    compareAt: money.or(z.literal('')),
    stock: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Whole number, 0 or more'),
    images: z.array(z.url()).max(8, 'At most 8 images'),
    active: z.boolean(),
  })
  .refine((v) => v.compareAt === '' || Number(v.compareAt) > Number(v.price), {
    message: 'Must be higher than the price',
    path: ['compareAt'],
  })

export type ProductFormValues = z.infer<typeof productFormSchema>

export const emptyProductForm: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  brand: '',
  categoryId: '',
  price: '',
  compareAt: '',
  stock: '0',
  images: [],
  active: true,
}

export function toFormValues(p: AdminProduct): ProductFormValues {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description,
    brand: p.brand ?? '',
    categoryId: p.categoryId?.toString() ?? '',
    price: (p.priceCents / 100).toFixed(2),
    compareAt: p.compareAtCents === null ? '' : (p.compareAtCents / 100).toFixed(2),
    stock: String(p.stock),
    images: p.images,
    active: p.active,
  }
}

export function toInput(v: ProductFormValues): ProductInput {
  return {
    name: v.name,
    slug: v.slug,
    description: v.description,
    brand: v.brand || null,
    categoryId: v.categoryId ? Number(v.categoryId) : null,
    priceCents: toCents(Number(v.price)),
    compareAtCents: v.compareAt ? toCents(Number(v.compareAt)) : null,
    stock: Number(v.stock),
    images: v.images,
    active: v.active,
  }
}
