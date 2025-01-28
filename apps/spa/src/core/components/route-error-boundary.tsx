import { Button } from '@/core/components/ui/button'

export function RouteErrorBoundary() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-3">Something went wrong</h1>

      <Button
        type="button"
        onPress={() => {
          window.location.assign(window.location.href)
        }}
      >
        Reload Page
      </Button>

      {/* <pre>{JSON.stringify(error, null, 2)}</pre> */}
    </main>
  )
}
