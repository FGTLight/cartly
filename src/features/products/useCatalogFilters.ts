import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { filtersFromParams, filtersToParams } from './filters'
import type { ProductFilters } from './types'

/** Catalog filters stored in the URL query string. */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(params), [params])

  const update = useCallback(
    (patch: Partial<ProductFilters>) => {
      // Any change other than paging starts again from page 1.
      const next = { ...filters, page: 1, ...patch }
      setParams(filtersToParams(next))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [filters, setParams],
  )

  return { filters, update }
}
