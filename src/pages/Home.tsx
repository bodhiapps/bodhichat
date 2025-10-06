import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Bodhi Chat</h1>
        <p className="text-lg text-muted-foreground">
          A ChatGPT-like interface powered by the Bodhi Platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>React + TypeScript</CardTitle>
            <CardDescription>Built with modern web technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Leveraging React 18, TypeScript, and Vite for a fast, type-safe development
              experience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tailwind CSS</CardTitle>
            <CardDescription>Utility-first styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Beautiful, responsive UI built with Tailwind CSS and ShadCN components.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bodhi Platform</CardTitle>
            <CardDescription>Local AI integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Seamlessly connect to local LLM services through the Bodhi Browser ecosystem.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  )
}
