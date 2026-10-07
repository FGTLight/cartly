import { defaultFilters, escapeLike, filtersFromParams, filtersToParams, pageCount } from './filters'

describe('catalog filters in the URL', () => {
  it('uses defaults for an empty query', () => {
    expect(filtersFromParams(new URLSearchParams())).toEqual(defaultFilters)
  })

  it('reads every filter', () => {
    const params = new URLSearchParams('q=phone&category=laptops&min=10&max=99.5&sort=price_asc&page=3')
    expect(filtersFromParams(params)).toEqual({
      search: 'phone',
      category: 'laptops',
      minPrice: 10,
      maxPrice: 99.5,
      sort: 'price_asc',
      page: 3,
    })
  })

  it('ignores invalid values', () => {
    const params = new URLSearchParams('min=-5&max=abc&sort=cheapest&page=0')
    expect(filtersFromParams(params)).toEqual(defaultFilters)
  })

  it('round-trips and omits defaults', () => {
    const filters = { ...defaultFilters, search: 'mug', page: 2 }
    const params = filtersToParams(filters)
    expect(params.toString()).toBe('q=mug&page=2')
    expect(filtersFromParams(params)).toEqual(filters)
  })
})

describe('escapeLike', () => {
  it('escapes LIKE wildcards', () => {
    expect(escapeLike('50%_off\\')).toBe('50\\%\\_off\\\\')
  })
})

describe('pageCount', () => {
  it('has at least one page', () => {
    expect(pageCount(0)).toBe(1)
    expect(pageCount(12)).toBe(1)
    expect(pageCount(13)).toBe(2)
  })
})
