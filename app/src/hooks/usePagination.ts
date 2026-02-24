import { useState } from 'react'

export function usePagination<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / pageSize)
  const paginated = items.slice(page * pageSize, (page + 1) * pageSize)
  return { page, totalPages, paginated, setPage } as const
}
