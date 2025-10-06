import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">About Bodhi Chat</h1>
        <p className="text-lg text-muted-foreground">
          A showcase application for the Bodhi Platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Bodhi Chat is a ChatGPT-like chat interface powered by the Bodhi Platform, demonstrating
            how to build modern web applications that integrate with local AI services.
          </p>

          <div className="space-y-2">
            <h3 className="font-semibold">Built With:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>React 18 with TypeScript</li>
              <li>React Router v7</li>
              <li>Vite for blazing-fast development</li>
              <li>Tailwind CSS for styling</li>
              <li>ShadCN UI components</li>
              <li>Vitest for unit testing</li>
              <li>Playwright for E2E testing</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Modern, responsive UI</li>
              <li>Type-safe development with TypeScript</li>
              <li>Component-based architecture</li>
              <li>Comprehensive testing setup</li>
              <li>Ready for Bodhi Platform integration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
