export default function NotFound() {
  return (
    // bg-[0_0_,10px_10px]
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(hsl(var(--primary))_0.5px_,transparent_0.5px),radial-gradient(hsl(var(--primary))_0.5px_,hsl(var(--background))_0.5px)] bg-[length:20px_20px] font-mono opacity-80">
      <h1 className="text-primary text-8xl font-bold tracking-wider">404</h1>
      <h2 className="my-3 text-2xl font-semibold">Not Found</h2>
      <p className="">Could not find requested resource</p>
    </div>
  )
}
