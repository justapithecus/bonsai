import type { Climate } from '@grove/core'

interface ClimateBandProps {
  climate?: Climate
  onOpenDeclaration: () => void
}

export function ClimateBand({
  climate,
  onOpenDeclaration,
}: ClimateBandProps) {
  return (
    <div
      className="flex items-center justify-between px-8 py-3 text-sm"
      style={{
        backgroundColor: 'var(--grove-surface)',
        borderBottom: '1px solid var(--grove-border)',
      }}
    >
      <span style={{ color: 'var(--grove-text-muted)' }}>
        {climate ? (
          <>
            Climate:{' '}
            <span style={{ color: 'var(--grove-text)' }}>{climate}</span>
          </>
        ) : (
          'No climate declared'
        )}
      </span>
      <button
        onClick={onOpenDeclaration}
        className="text-xs px-3 py-1 rounded cursor-pointer transition-colors"
        style={{
          color: 'var(--grove-text-muted)',
          border: '1px solid var(--grove-border)',
        }}
      >
        {climate ? 'Update climate' : 'Declare climate'}
      </button>
    </div>
  )
}
