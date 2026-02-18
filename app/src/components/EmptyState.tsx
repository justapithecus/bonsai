interface EmptyStateProps {
  onConnect: () => void
}

export function EmptyState({ onConnect }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <h2
          className="text-xl mb-4"
          style={{
            fontFamily: 'var(--grove-font-display)',
            color: 'var(--grove-text)',
          }}
        >
          Select repositories to begin stewardship.
        </h2>
        <button
          onClick={onConnect}
          className="px-6 py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
          style={{
            backgroundColor: 'var(--grove-accent)',
            color: 'var(--grove-surface)',
          }}
        >
          Connect GitHub
        </button>
      </div>
    </div>
  )
}
