import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Grove',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,

  notFoundComponent: NotFoundPage,

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return <Outlet />
}

function NotFoundPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--grove-bg)' }}
    >
      <div className="text-center">
        <h1
          className="text-xl mb-2"
          style={{
            fontFamily: 'var(--grove-font-display)',
            color: 'var(--grove-text)',
          }}
        >
          Nothing here
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          This path does not lead anywhere in the observatory.
        </p>
        <a
          href="/"
          className="text-sm"
          style={{ color: 'var(--grove-accent)' }}
        >
          Return to Grove
        </a>
      </div>
    </div>
  )
}
