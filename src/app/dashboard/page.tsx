
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, User, Briefcase, Lightbulb, Users2, CalendarClock, Edit3, Eye, Sparkles, Building, School, CheckCircle, Edit, Presentation } from "lucide-react";
import Image from "next/image";
import { HorizontalScrollItems } from "@/components/dashboard/horizontal-scroll-items"; // New component
import { UserAvatar } from "@/components/core/user-avatar";
import { useEffect, useState } from "react";
import type { EnrichedBooking } from "@/lib/types";
import { format, parseISO } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { MentorshipAbstractArt } from "@/components/core/mentorship-abstract-art";


interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  actionText: string;
}

function ActionCard({ title, description, href, icon: Icon, actionText }: ActionCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-accent/10 rounded-md">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-lg text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary/5 hover:text-primary">
          <Link href={href}>
            {actionText} <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

const MOCK_JOB_ROLES = [
  "Software Engineer", "Data Scientist", "Product Manager", "UX Designer", "Frontend Developer", 
  "Backend Developer", "DevOps Engineer", "Cybersecurity Analyst", "AI/ML Engineer", "Cloud Architect",
  "Marketing Specialist", "Business Analyst", "Financial Analyst"
];
const MOCK_COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Apple", "Salesforce", "Adobe", 
  "Oracle", "IBM", "Intel", "Nvidia", "Accenture", "Deloitte"
];
const MOCK_UNIVERSITIES = [
  "Stanford", "MIT", "Harvard", "UC Berkeley", "Cambridge", "Oxford", "ETH Zurich", 
  "Caltech", "IIT Bombay", "IISc Bangalore", "NUS Singapore", "University of Toronto"
];


export default function DashboardHomePage() {
  const { user, getScheduledSessionsForCurrentUser, bookingsVersion } = useAuth();
  const [mentorUpcomingSessions, setMentorUpcomingSessions] = useState<EnrichedBooking[]>([]);
  const [isLoadingMentorSchedule, setIsLoadingMentorSchedule] = useState(true);

  const welcomeMessage = `Welcome, ${user?.name || "User"}!`;
  const welcomeWords = welcomeMessage.split(" ");

  useEffect(() => {
    if (user?.role === 'mentor') {
      setIsLoadingMentorSchedule(true);
      getScheduledSessionsForCurrentUser()
        .then(sessions => {
          const upcoming = sessions
            .filter(s => parseISO(s.startTime) > new Date())
            .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
            .slice(0, 3); 
          setMentorUpcomingSessions(upcoming);
        })
        .finally(() => setIsLoadingMentorSchedule(false));
    }
  }, [user, getScheduledSessionsForCurrentUser, bookingsVersion]);


  if (!user) return <div className="flex h-screen items-center justify-center"><p>Loading user data...</p></div>;

  // MENTOR DASHBOARD HOME
  if (user.role === 'mentor') {
    return (
      <div className="space-y-6">
        <Card className="bg-primary text-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">Welcome back, {user.name || "Mentor"}!</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-sm md:text-base">
              Manage your schedule, connect with mentees, and share your expertise.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Image 
                src="https://placehold.co/1200x300.png"
                alt="Mentor Dashboard Banner"
                data-ai-hint="professional desk setup"
                width={1200}
                height={300}
                className="rounded-lg object-cover w-full"
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            title="Manage Availability"
            description="Set and update your available time slots for mentees."
            href="/dashboard/availability"
            icon={CalendarClock}
            actionText="Update Schedule"
          />
          <ActionCard
            title="View My Schedule"
            description="See your upcoming and past confirmed sessions."
            href="/dashboard/schedule"
            icon={CalendarClock} // Changed from CalendarDays for consistency
            actionText="Check My Sessions"
          />
          <ActionCard
            title="My Group Sessions"
            description="Create and manage your group mentorship sessions."
            href="/dashboard/my-group-sessions"
            icon={Users2}
            actionText="Manage Group Sessions"
          />
           <ActionCard
            title="My Webinars"
            description="Create and manage your webinars."
            href="/dashboard/my-webinars"
            icon={Presentation} // Changed from Tv2 for variety
            actionText="Manage Webinars"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Upcoming Sessions</CardTitle>
            <CardDescription>Your next few scheduled mentorship sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMentorSchedule && (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            )}
            {!isLoadingMentorSchedule && mentorUpcomingSessions.length === 0 && (
              <p className="text-sm text-muted-foreground">You have no upcoming sessions.</p>
            )}
            {!isLoadingMentorSchedule && mentorUpcomingSessions.length > 0 && (
              <ul className="space-y-3">
                {mentorUpcomingSessions.map(session => (
                  <li key={session.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div className="flex items-center gap-3">
                       <UserAvatar user={session.mentee} className="h-8 w-8" />
                       <div>
                          <p className="text-sm font-medium text-foreground">{session.mentee.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(session.startTime), "EEE, MMM d 'at' p")}
                          </p>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/schedule`}>
                        View Details <Eye className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
           <CardFooter>
                <Button variant="link" asChild>
                    <Link href="/dashboard/schedule">View Full Schedule <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>

        <Card className="bg-accent/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-xl text-accent-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> Pro Tips for Mentors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-accent-foreground/80">
            <p><strong>Set Clear Expectations:</strong> Discuss goals and communication preferences early on with your mentees.</p>
            <p><strong>Be an Active Listener:</strong> Understand your mentee's challenges and aspirations deeply.</p>
            <p><strong>Provide Actionable Feedback:</strong> Offer constructive advice that mentees can implement.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  // MENTEE DASHBOARD HOME (New Design)
  return (
    <div className="space-y-8 md:space-y-12">
      {/* Welcome Banner with Abstract Art */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 md:py-12 rounded-lg shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
                {welcomeWords.map((word, index) => {
                    const isNamePart = index >= welcomeWords.length - (user?.name?.split(" ").length || 1);
                    const animationClass = isNamePart
                    ? 'animate-textColorEmphasisWaveAccentEnd'
                    : 'animate-textColorEmphasisWave';
                    return (
                    <span
                        key={index}
                        className={`inline-block opacity-0 ${animationClass} ${index < welcomeWords.length - 1 ? 'mr-1 lg:mr-2' : ''}`}
                        style={{ animationDelay: `${index * 0.15 + 0.2}s` }}
                    >
                        {word}
                    </span>
                    );
                })}
            </h1>
            <p className="mt-3 text-md md:text-lg text-foreground/80 opacity-0 animate-fadeInUp" style={{ animationDelay: `${welcomeWords.length * 0.15 + 0.3}s` }}>
              Explore opportunities and connect with mentors to accelerate your journey!
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end opacity-0 animate-fadeInUp" style={{ animationDelay: `${welcomeWords.length * 0.15 + 0.5}s` }}>
            <MentorshipAbstractArt className="w-full max-w-md" />
          </div>
        </div>
      </section>

      {/* Complete Your Profile Section */}
      <section>
        <Card className="bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <Edit className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl text-primary">Complete Your Profile</CardTitle>
              <CardDescription className="text-sm">
                Help us tailor resources and recommendations specifically for you.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A complete profile allows our AI to find the best mentors, group sessions, and webinars that align with your unique goals and interests.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/profile">
                Go to My Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Scrolling Job Roles Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-primary" /> Explore Career Paths
        </h2>
        <HorizontalScrollItems items={MOCK_JOB_ROLES} />
      </section>

      {/* Scrolling Companies Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <Building className="mr-2 h-5 w-5 text-primary" /> Companies Our Mentors Are From
        </h2>
        <HorizontalScrollItems items={MOCK_COMPANIES} direction="right" />
      </section>

      {/* Dream Universities Section */}
      <section>
        <Card className="bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
                <School className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-xl text-primary">Dream University Guidance</CardTitle>
                <CardDescription className="text-sm">
                Connect with alumni and mentors experienced in university admissions.
                </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get insights into application processes, essay writing, interview preparation, and more for your target universities from those who have been there.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
              <Link href="/dashboard/mentors?mentorshipFocus=university">
                Find University Mentors <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
      
      {/* Scrolling Universities Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" /> Universities in Our Network
        </h2>
        <HorizontalScrollItems items={MOCK_UNIVERSITIES} />
      </section>

      {/* Quick Links / Other Actions (Simplified) */}
      <section>
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" asChild><Link href="/dashboard/mentors">Browse All Mentors</Link></Button>
                <Button variant="outline" asChild><Link href="/dashboard/group-sessions">View Group Sessions</Link></Button>
                <Button variant="outline" asChild><Link href="/dashboard/webinars">Explore Webinars</Link></Button>
                <Button variant="outline" asChild><Link href="/dashboard/schedule">My Schedule</Link></Button>
            </CardContent>
        </Card>
      </section>

    </div>
  );
}
