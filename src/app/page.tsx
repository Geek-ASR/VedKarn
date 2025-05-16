"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/core/logo";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role) {
      router.replace("/dashboard");
    } else if (!loading && user && !user.role) {
      router.replace("/auth/complete-profile");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Loading MentorVerse...</p>
      </div>
    );
  }

  if (user && !user.role) {
     // Redirecting to complete profile, show minimal loading or nothing
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Preparing your profile setup...</p>
      </div>
    );
  }
  
  if (user && user.role) {
    // Already authenticated and role set, redirecting to dashboard
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 text-center">
      <header className="mb-12">
        <Logo className="h-16 w-auto" />
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
          Welcome to MentorVerse
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-foreground/80">
          Unlock your potential. Connect with experienced mentors, gain valuable insights, and navigate your academic and professional journey with confidence.
        </p>
      </header>

      <div className="space-y-6 sm:space-y-0 sm:flex sm:space-x-6">
        <Button asChild size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>

      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MentorVerse. All rights reserved.</p>
        <p className="mt-1">Guidance for today, success for tomorrow.</p>
      </footer>
    </div>
  );
}