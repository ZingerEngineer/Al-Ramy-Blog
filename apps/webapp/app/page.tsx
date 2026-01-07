import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Al-Ramy Blog</h1>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Al-Ramy Blog
        </h2>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          A modern blog platform where you can share your thoughts, stories, and ideas with the
          world.
        </p>
        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg">Create Account</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Al-Ramy Blog - A modern blog platform</p>
      </footer>
    </main>
  );
}
