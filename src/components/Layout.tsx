import { Link, Outlet } from 'react-router-dom'
import { Button } from './ui/button'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="app-title">
            Bodhi Chat
          </h1>
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Bodhi Chat. Powered by Bodhi Platform.
        </div>
      </footer>
    </div>
  )
}
