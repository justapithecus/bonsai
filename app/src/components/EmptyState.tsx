export function EmptyState() {
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
          No token configured.
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Set <code style={{ color: 'var(--grove-text)' }}>GITHUB_TOKEN</code> in
          your environment to begin observing repositories.
        </p>
      </div>
    </div>
  )
}
