
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, Users, Video, Calendar, Search, Users2, Presentation, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Hero Section for How It Works Page */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl lg:text-6xl">
            How VedKarn Works
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-foreground/80 md:text-xl">
            Your straightforward path to growth and learning. Discover how to connect with mentors, join sessions, and expand your knowledge.
          </p>
        </div>
      </section>

      {/* One-on-One Mentorship Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-accent/10 rounded-full mb-4">
                 <Users className="h-12 w-12 text-accent" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Personalized One-on-One Mentorship
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
              Get dedicated attention from an expert mentor tailored to your specific goals, step by step.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            <StepCard
              icon={Search}
              title="1. Discover Your Mentor"
              description="Browse our network of vetted mentors. Filter by expertise, industry, and goals to find the perfect match."
            />
            <StepCard
              icon={Calendar}
              title="2. Book Your Session"
              description="Pay Rs. 1500 per session. Choose a time slot that works for you and confirm your booking instantly through our platform."
            />
            <StepCard
              icon={Video}
              title="3. Connect & Learn"
              description="Join your session via our secure, in-built video call feature. Engage in focused, productive discussions with your mentor."
            />
            <StepCard
              icon={CheckCircle}
              title="4. Get Actionable Feedback"
              description="Receive personalized advice, constructive feedback, and actionable steps to apply to your career or studies."
            />
          </div>
          <div className="text-center mt-16">
            <Image
              src="https://placehold.co/800x450.png"
              alt="One-on-one mentorship session in progress"
              data-ai-hint="professional video call learning"
              width={800}
              height={450}
              className="rounded-lg shadow-xl mx-auto object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              More Ways to Learn and Grow
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
              Explore other flexible options to suit your learning style and budget.
            </p>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <InfoCard
              icon={Users2}
              title="Affordable Group Sessions"
              description="Learn collaboratively in a small group setting (5-15 participants). A cost-effective way to gain insights, ask questions, and network with peers. Perfect for shared learning experiences and diverse perspectives."
              imageSrc="https://placehold.co/600x350.png"
              imageHint="online group discussion teamwork"
              ctaText="Explore Group Sessions (Coming Soon)"
              ctaHref="#"
              disabledCta
            />
            <InfoCard
              icon={Presentation}
              title="Free Informative Webinars"
              description="Join our free webinars hosted by industry experts. Get valuable knowledge on various topics like career development, skill building, and emerging trends. Open to everyone and a great way to learn from the best!"
              imageSrc="https://placehold.co/600x350.png"
              imageHint="webinar presentation online class"
              ctaText="View Webinar Schedule (Coming Soon)"
              ctaHref="#"
              disabledCta
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Ready to Start Your Mentorship Journey on VedKarn?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-foreground/70">
            Take the first step towards achieving your goals with expert guidance from experienced professionals.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
              <Link href="/auth/signup?role=mentee">Find Your Mentor</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg border-primary text-primary hover:bg-primary/5">
              <Link href="/auth/signup?role=mentor">Become a Mentor</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="items-center">
        <div className="p-3 bg-accent/10 rounded-full mb-3 inline-block">
          <Icon className="h-8 w-8 text-accent" />
        </div>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/70">{description}</p>
      </CardContent>
    </Card>
  );
}

function InfoCard({ icon: Icon, title, description, imageSrc, imageHint, ctaText, ctaHref, disabledCta=false }: { icon: React.ElementType, title: string, description: string, imageSrc: string, imageHint: string, ctaText: string, ctaHref: string, disabledCta?: boolean }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="items-center text-center">
         <div className="p-3 bg-primary/10 rounded-full mb-3 inline-block">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 text-center">
        <div className="relative aspect-video w-full my-4">
            <Image
                src={imageSrc}
                alt={title}
                data-ai-hint={imageHint}
                fill
                className="rounded-md object-cover"
            />
        </div>
        <p className="text-foreground/80 text-left md:text-center">
          {description}
        </p>
      </CardContent>
      <CardFooter className="justify-center pt-4 mt-auto">
        <Button asChild className="w-full" variant={disabledCta ? "outline" : "default"} disabled={disabledCta}>
          <Link href={ctaHref}>{ctaText} <ArrowRight className="ml-2 h-4 w-4"/></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


    
