interface PaginationControlsProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div
      className="flex items-center justify-center gap-6 pt-8 pb-4 text-sm"
      style={{ color: 'var(--grove-text-muted)' }}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="disabled:opacity-30"
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: page === 0 ? 'default' : 'pointer',
          padding: 0,
          font: 'inherit',
        }}
      >
        &larr; Previous
      </button>
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="disabled:opacity-30"
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: page >= totalPages - 1 ? 'default' : 'pointer',
          padding: 0,
          font: 'inherit',
        }}
      >
        Next &rarr;
      </button>
    </div>
  )
}
