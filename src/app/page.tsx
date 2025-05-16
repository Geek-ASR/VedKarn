
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/core/logo";
import { Loader2, Users, CheckCircle, Star, TrendingUp, Zap, MessageSquareHeart, ArrowRight, Calendar, BookOpen, Mic } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Loading MentorVerse...</p>
      </div>
    );
  }

  if (user) {
    // User is logged in but role might be missing (handled by useEffect) or already set (will be redirected)
    // Show loading state while redirecting
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Preparing your experience...</p>
      </div>
    );
  }

  // Render landing page for unauthenticated users
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-10 w-auto" />
          </Link>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl lg:text-6xl">
              Unlock Your Potential with <span className="text-accent">1-on-1 Mentorship</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-foreground/80 md:text-xl">
              Connect with experienced professionals, gain invaluable insights, and accelerate your career or academic journey with MentorVerse.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg px-8 py-3.5 text-base">
                <Link href="/auth/signup?role=mentee">Find a Mentor</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-lg px-8 py-3.5 text-base border-primary text-primary hover:bg-primary/5 hover:text-primary">
                <Link href="/auth/signup?role=mentor">Become a Mentor</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-card rounded-lg shadow-md">
                <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="text-3xl font-bold text-primary">6,100+</h3>
                <p className="text-foreground/70">Available Mentors</p>
              </div>
              <div className="p-6 bg-card rounded-lg shadow-md">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="text-3xl font-bold text-primary">29,000+</h3>
                <p className="text-foreground/70">Successful Connections</p>
              </div>
              <div className="p-6 bg-card rounded-lg shadow-md">
                <Zap className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="text-3xl font-bold text-primary">97%</h3>
                <p className="text-foreground/70">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Long-term mentorship isn't just better — <span className="text-accent">it's faster.</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
                Follow these simple steps to start your mentorship journey.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="How MentorVerse Works Illustration"
                  data-ai-hint="journey guidance"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl object-cover"
                />
              </div>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">01</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">Discover</h3>
                    <p className="mt-1 text-foreground/70">Explore our curated network of vetted mentors. Find someone who matches your goals, industry, skills, and budget.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">02</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">Connect</h3>
                    <p className="mt-1 text-foreground/70">Schedule an introductory call or book your first session directly. Choose a flexible plan that fits your pace.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">03</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">Grow</h3>
                    <p className="mt-1 text-foreground/70">Get ongoing support through regular calls, check-ins, and feedback. Your mentor stays with you for the long haul to help you achieve breakthroughs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Coach Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="md:order-2">
                    <Image
                    src="https://placehold.co/600x400.png"
                    alt="Career Coach Illustration"
                    data-ai-hint="professional meeting"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-xl object-cover"
                    />
              </div>
              <div className="md:order-1">
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">At your fingertips: a dedicated career coach.</h2>
                <p className="mt-4 text-lg text-foreground/70">
                  Want to start a new dream career? Successfully build your startup? Itching to learn high-demand skills? Work smart with an online mentor by your side to offer expert advice and guidance to match your zeal. Become unstoppable using MentorVerse.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-accent mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Thousands of mentors available across diverse fields.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-accent mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Flexible program structures and scheduling.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-accent mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Personalized guidance and 1-on-1 calls.</span>
                  </li>
                </ul>
                <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-base">
                  <Link href="/auth/signup?role=mentee">Find Your Mentor Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* One-off Sessions Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
          {/* Decorative dot patterns - simplified example */}
          <div className="absolute top-10 left-10 w-32 h-32 opacity-10 " style={{backgroundImage: 'radial-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 opacity-10 " style={{backgroundImage: 'radial-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Not sure if mentorship is right for you?
            </h2>
            <h3 className="text-2xl font-semibold text-accent mt-1">Give it a try with a one-off session.</h3>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-foreground/80">
              A quick, easy call with an expert is just one click away with our attractive one-off sessions. Picking a brain, talking through an issue or getting to know an industry expert has never been easier.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <OneOffSessionCard
                icon={Mic}
                title="Introductory Call"
                description="If you're looking for a mentor, and you're just not sure about how this all works - this should be for you. In a casual, informal introductory call, a mentor will introduce themselves..."
                duration="Approx. 30 minutes"
                price="$39"
                href="#"
              />
              <OneOffSessionCard
                icon={BookOpen}
                title="Study Plan"
                description="Looking to learn a new skill? The vast amount of resources on any topic on the internet can feel overwhelming at times. A mentor can give you an overview of worthwhile..."
                duration="Approx. 45 minutes"
                price="$39"
                href="#"
              />
              <OneOffSessionCard
                icon={Calendar}
                title="Interview Preparation"
                description="Some big interviews coming up? In this 1-hour session, a mentor with hiring experience will act as a technical interviewer and ask you some standard hiring questions..."
                duration="Approx. 60 minutes"
                price="$99"
                href="#"
              />
            </div>
            <div className="mt-12">
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
                Show me more
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <MessageSquareHeart className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Loved by Mentees Worldwide</h2>
            <Card className="max-w-2xl mx-auto mt-8 shadow-xl bg-card">
              <CardContent className="p-8">
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg italic text-card-foreground/80">
                  "Having access to the knowledge and experience of mentors on MentorVerse was an opportunity I couldn't miss. Thanks to my mentor, I managed to reach my goal of joining a top tech company!"
                </blockquote>
                <div className="mt-6 flex items-center justify-center">
                    <Image src="https://placehold.co/40x40.png" alt="Michele V." data-ai-hint="profile woman" width={40} height={40} className="rounded-full mr-3"/>
                    <div>
                        <p className="font-semibold text-primary">Michele V.</p>
                        <p className="text-sm text-muted-foreground">Software Engineer at Tech Solutions</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-muted/30">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
                 <Logo className="h-8 w-auto mx-auto md:mx-0" />
            </div>
            <p>&copy; {new Date().getFullYear()} MentorVerse. All rights reserved.</p>
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

interface OneOffSessionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  duration: string;
  price: string;
  href: string;
}

function OneOffSessionCard({ icon: Icon, title, description, duration, price, href }: OneOffSessionCardProps) {
  return (
    <Card className="bg-card text-card-foreground shadow-xl flex flex-col text-left">
      <CardHeader>
        {Icon && <Icon className="h-8 w-8 mb-3 text-accent" />}
        <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-3">
          {description} <Link href={href} className="text-accent font-medium hover:underline">Read More</Link>
        </p>
        <div className="flex justify-between items-center text-sm">
          <p className="text-foreground/80">{duration}</p>
          <p className="font-bold text-accent text-lg">{price}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={href}>
            EXPLORE <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

