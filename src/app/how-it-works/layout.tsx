
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/core/logo";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How VedKarn Works | VedKarn',
  description: 'Learn about one-on-one mentorship, group sessions, and free webinars to accelerate your growth on VedKarn.',
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-10 w-auto" />
          </Link>
          <nav className="flex items-center space-x-2">
            <Button variant="link" asChild className="text-foreground/70 hover:text-primary">
              <Link href="/how-it-works">How it works</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="py-8 border-t bg-muted/30">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
                 <Logo className="h-8 w-auto mx-auto md:mx-0" />
            </div>
            <p>&copy; {new Date().getFullYear()} VedKarn. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="#" className="hover:text-primary">Privacy Policy</Link>
                <Link href="#" className="hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

    
