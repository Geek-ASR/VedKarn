
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Logo } from "@/components/core/logo";
import { Loader2, Users, CheckCircle, Star, TrendingUp, Zap, MessageSquareHeart, ArrowRight, Briefcase, Lightbulb, Users2, Presentation } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

// Define all session data
const allOneOffSessionsData = [
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "conversation phone",
    title: "Introductory Call",
    duration: "15 minutes",
    price: "$39", // Placeholder, update with Rs.
    description: "If you're looking for a mentor, and you're just not sure about how this all works - this should be for you. In a casual, informal introductory call, a mentor will introduce themselves...",
    href: "#intro-call"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "resume document",
    title: "Resume Feedback",
    duration: "30 minutes",
    price: "$89",
    description: "Having a good resume on hand when going on the job hunt is crucial, and will make your search a...",
    href: "#resume-feedback"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "linkedin profile",
    title: "LinkedIn Feedback",
    duration: "30 minutes",
    price: "$89",
    description: "This session is designed to help you optimize your LinkedIn profile for professional networking and career advancement. In this session,...",
    href: "#linkedin-feedback"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "portfolio website",
    title: "Portfolio Feedback",
    duration: "30 minutes",
    price: "$89",
    description: "Having a good portfolio on hand is key for any designer in the job market. Even if you're not looking...",
    href: "#portfolio-feedback"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "questions discussion",
    title: "Ask Me Anything - 30 Minutes",
    duration: "30 minutes",
    price: "$109",
    description: "Whatever doesn't fit the mold: Get 30 minutes with a mentor to discuss your needs. Be it help with some...",
    href: "#ama-30"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "study plan",
    title: "Study Plan",
    duration: "45 minutes",
    price: "$119",
    description: "Looking to learn a new skill? The vast amount of resources on any topic on the internet can feel overwhelming...",
    href: "#study-plan"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "career strategy",
    title: "Career Strategy",
    duration: "45 minutes",
    price: "$119",
    description: "Sometimes, a strategy is needed to accomplish a future career change, or simply to get further in your current position...",
    href: "#career-strategy"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "code review",
    title: "Work Review",
    duration: "45 minutes",
    price: "$119",
    description: "Not sure about your newest design? Not sure if your code is as good as it can be? Portfolio site...",
    href: "#work-review"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "pitch deck presentation",
    title: "Pitch Deck Review",
    duration: "60 minutes",
    price: "$149",
    description: "In this session, a mentor with startup, fundraising, and entrepreneurship experience will provide feedback and guidance on your pitch deck,...",
    href: "#pitch-deck-review"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "job interview",
    title: "Interview Preparation",
    duration: "60 minutes",
    price: "$149",
    description: "Some big interviews coming up? In this 1-hour session, a mentor with hiring experience will act as a technical interviewer...",
    href: "#interview-prep"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "pair programming",
    title: "Pair Programming",
    duration: "60 minutes",
    price: "$149",
    description: "This session involves you and your mentor working collaboratively to develop coding skills, troubleshoot coding issues, or complete coding projects...",
    href: "#pair-programming"
  },
  {
    imageSrc: "https://placehold.co/300x200.png",
    imageHint: "deep conversation",
    title: "Ask Me Anything - 60 Minutes",
    duration: "60 minutes",
    price: "$189",
    description: "Whatever doesn't fit the mold: Get a full hour with a mentor to discuss your needs. Be it help with...",
    href: "#ama-60"
  }
];


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAllSessions, setShowAllSessions] = useState(false);


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
        <p className="text-lg text-foreground">Loading VedKarn...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Preparing your experience...</p>
      </div>
    );
  }

  const sessionsToShow = showAllSessions ? allOneOffSessionsData : allOneOffSessionsData.slice(0, 3);
  const heroTitleWords = ["Unlock", "Your", "Potential", "with", "1-on-1", "Mentorship"];

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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-6 text-center">
             <h1 className="text-4xl font-extrabold text-primary md:text-5xl lg:text-6xl">
              {heroTitleWords.map((word, index) => {
                const isLastTwoWords = index >= heroTitleWords.length - 2; // "1-on-1" and "Mentorship"
                const animationClass = isLastTwoWords
                  ? 'animate-textColorEmphasisWaveAccentEnd'
                  : 'animate-textColorEmphasisWave';
                return (
                  <span
                    key={index}
                    className={`inline-block opacity-0 ${animationClass} ${index < heroTitleWords.length - 1 ? 'mr-1 lg:mr-2' : ''}`}
                    style={{ animationDelay: `${index * 0.15 + 0.2}s` }}
                  >
                    {word}
                  </span>
                );
              })}
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-foreground/80 md:text-xl opacity-0 animate-fadeInUp" style={{ animationDelay: `${heroTitleWords.length * 0.15 + 0.3}s` }}>
              Connect with experienced professionals, gain invaluable insights, and accelerate your career or academic journey with VedKarn.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 opacity-0 animate-fadeInUp" style={{ animationDelay: `${heroTitleWords.length * 0.15 + 0.5}s` }}>
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
              {[
                { icon: Users, value: "6,100+", label: "Available Mentors" },
                { icon: TrendingUp, value: "29,000+", label: "Successful Connections" },
                { icon: Zap, value: "97%", label: "Satisfaction Rate" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-lg shadow-md"
                >
                  <stat.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
                  <p className="text-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Your Mentorship Journey */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Start Your Journey in <span className="text-accent">3 Simple Steps</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
                Follow these simple steps to start your mentorship journey.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="How VedKarn Works Illustration"
                  data-ai-hint="journey guidance"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl object-cover"
                />
              </div>
              <div className="space-y-8">
                {[
                  { title: "Discover", description: "Explore our curated network of vetted mentors. Find someone who matches your goals, industry, skills, and budget." },
                  { title: "Connect", description: "Schedule an introductory call or book your first session directly. Choose a flexible plan that fits your pace." },
                  { title: "Grow", description: "Get ongoing support through regular calls, check-ins, and feedback. Your mentor stays with you for the long haul to help you achieve breakthroughs." },
                ].map((step, index) => (
                   <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">0{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary">{step.title}</h3>
                      <p className="mt-1 text-foreground/70">{step.description}</p>
                    </div>
                  </div>
                ))}
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
                  Want to start a new dream career? Successfully build your startup? Itching to learn high-demand skills? Work smart with an online mentor by your side to offer expert advice and guidance to match your zeal. Become unstoppable using VedKarn.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Thousands of mentors available across diverse fields.",
                    "Flexible program structures and scheduling.",
                    "Personalized guidance and 1-on-1 calls."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-accent mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-base">
                    <Link href="/auth/signup?role=mentee">Find Your Mentor Today</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* One-off Sessions Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 opacity-10 " style={{backgroundImage: 'radial-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 opacity-10 " style={{backgroundImage: 'radial-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The conversations that get you where you want to be.
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-foreground/80">
              Step up your career game plan, prep up interviews, job search & promotion. Your mentor will listen to you, give solutions drawn from their experience and take you where you want to be.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sessionsToShow.map((session, index) => (
                <OneOffSessionCard
                  key={session.title} 
                  imageSrc={session.imageSrc}
                  imageHint={session.imageHint}
                  title={session.title}
                  duration={session.duration}
                  price={session.price}
                  description={session.description}
                  href={session.href}
                />
              ))}
            </div>
            {!showAllSessions && allOneOffSessionsData.length > 3 && (
              <div className="mt-12">
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => setShowAllSessions(true)}
                  className="border-accent text-accent hover:bg-accent/10 hover:text-accent"
                >
                  Show me more sessions
                </Button>
              </div>
            )}
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
                  "Having access to the knowledge and experience of mentors on VedKarn was an opportunity I couldn't miss. Thanks to my mentor, I managed to reach my goal of joining a top tech company!"
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

interface OneOffSessionCardProps {
  imageSrc: string;
  imageHint: string;
  title: string;
  duration: string;
  price: string;
  description: string;
  href: string;
}

function OneOffSessionCard({ 
  imageSrc, 
  imageHint, 
  title, 
  duration, 
  price, 
  description, 
  href,
}: OneOffSessionCardProps) {
  return (
    <Card className="bg-card text-card-foreground shadow-xl flex flex-col text-left overflow-hidden">
      <div className="aspect-[3/2] w-full">
        <Image 
            src={imageSrc} 
            alt={title} 
            data-ai-hint={imageHint} 
            width={300} 
            height={200} 
            className="object-cover w-full h-full" 
        />
      </div>
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1">{duration} for {price}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={href}>
            EXPLORE <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

