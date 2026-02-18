interface HeaderProps {
  login?: string
  onLogout?: () => void
}

export function Header({ login, onLogout }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-8 py-6"
      style={{ borderBottom: '1px solid var(--grove-border)' }}
    >
      <div>
        <h1
          className="text-2xl tracking-tight"
          style={{
            fontFamily: 'var(--grove-font-display)',
            fontWeight: 'var(--grove-font-weight-display)' as any,
            color: 'var(--grove-text)',
          }}
        >
          Grove
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Observatory
        </p>
      </div>
      {login && (
        <div className="flex items-center gap-4">
          <span
            className="text-sm"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            {login}
          </span>
          <button
            onClick={onLogout}
            className="text-sm px-3 py-1 rounded transition-colors cursor-pointer"
            style={{
              color: 'var(--grove-text-muted)',
              border: '1px solid var(--grove-border)',
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </header>
  )
}
