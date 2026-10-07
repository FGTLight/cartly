import { emptyProductForm, productFormSchema, slugify, toFormValues, toInput } from './productSchema'

describe('slugify', () => {
  it('produces slugs accepted by the database check', () => {
    expect(slugify('Apple AirPods Max!')).toBe('apple-airpods-max')
    expect(slugify('  Café — Crème  ')).toBe('cafe-creme')
    expect(slugify('Men\'s Shirt (XL)')).toBe('men-s-shirt-xl')
    expect(slugify('---')).toBe('')
  })
})

describe('productFormSchema', () => {
  const valid = {
    ...emptyProductForm,
    name: 'Desk Lamp',
    slug: 'desk-lamp',
    price: '19.99',
    stock: '4',
  }

  it('accepts a minimal product', () => {
    expect(productFormSchema.safeParse(valid).success).toBe(true)
  })

  it('requires the compare-at price to be higher than the price', () => {
    const result = productFormSchema.safeParse({ ...valid, compareAt: '10' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0].path).toEqual(['compareAt'])
  })

  it('rejects malformed prices and stock', () => {
    expect(productFormSchema.safeParse({ ...valid, price: '19.999' }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, stock: '-1' }).success).toBe(false)
  })
})

describe('form ↔ input conversion', () => {
  it('converts dollars to cents and blanks to null', () => {
    expect(
      toInput({ ...emptyProductForm, name: 'Lamp', slug: 'lamp', price: '19.99', compareAt: '' }),
    ).toMatchObject({ priceCents: 1999, compareAtCents: null, brand: null, categoryId: null })
  })

  it('round-trips an existing product', () => {
    const values = toFormValues({
      id: 'p1',
      slug: 'lamp',
      name: 'Lamp',
      description: '',
      brand: 'Lumo',
      category: null,
      categoryId: 3,
      priceCents: 1999,
      compareAtCents: 2999,
      images: [],
      stock: 4,
      rating: 4,
      active: true,
    })
    expect(values).toMatchObject({ price: '19.99', compareAt: '29.99', categoryId: '3' })
    expect(toInput(values)).toMatchObject({ priceCents: 1999, compareAtCents: 2999, categoryId: 3 })
  })
})
