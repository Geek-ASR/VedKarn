
"use client";

import { useAuth, getMockMentorProfiles, getMentorByProfileString } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Users, CalendarDays, MessageCircle, Video, Briefcase, Lightbulb, Users2, Presentation, CalendarClock, Edit3, Eye } from "lucide-react";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { MentorProfile, MenteeProfile, GroupSession, Webinar, EnrichedBooking } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { suggestMentors, type SuggestMentorsOutput, type SuggestMentorsInput } from "@/ai/flows/suggest-mentors";
import { suggestGroupSessions, type SuggestGroupSessionsOutput, type SuggestGroupSessionsInput } from "@/ai/flows/suggest-group-sessions";
import { suggestWebinars, type SuggestWebinarsOutput, type SuggestWebinarsInput } from "@/ai/flows/suggest-webinars";
import { MentorCard, MentorCardSkeleton } from "@/components/dashboard/mentor-card";
import { GroupSessionCard, GroupSessionCardSkeleton } from "@/components/dashboard/group-session-card";
import { WebinarCard, WebinarCardSkeleton } from "@/components/dashboard/webinar-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, useRef, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import { UserAvatar } from "@/components/core/user-avatar";


// Data for Mentee's Featured Sessions
const menteeFeaturedSessionsData = [
  {
    title: "Intro Call",
    description: "If you're looking for a mentor, and you're just not sure about how this all works - this should be for you.",
    details: "Approx. 30 minutes",
    price: "Rs. 1000",
    href: "/dashboard/mentors" // Link to mentor discovery
  },
  {
    title: "Work Review",
    description: "In this session, a mentor will sit down with you, and give you some inputs to make your work better, be it a review, inputs on your design, or some inspiration.",
    details: "Approx. 45 minutes",
    price: "Rs. 2000",
    href: "/dashboard/mentors"
  },
  {
    title: "Interview Preparation",
    description: "Some big interviews coming up? In this 1-hour session, a mentor with hiring experience will act as a technical interviewer and ask you some standard hiring questions.",
    details: "Approx. 60 minutes",
    price: "Rs. 2500",
    href: "/dashboard/mentors"
  }
];

// Data for Mentee's FAQ
const menteeFaqData = [
  {
    question: "How can I get in touch with a mentor?",
    answer: "We offer two main ways to get in touch with a mentor: the regular long-term mentorship through application, and by booking a session. For one-on-one mentorship, a payment of Rs. 1500 per session is required. You can then connect via our in-built video call feature."
  },
  {
    question: "How much do mentors cost? How does pricing work?",
    answer: "Each mentor offers multiple pricing tiers and has different offers. With the mentorship subscription, you'll get charged the monthly fee of the mentor you're subscribed to. If you book a session once, you'll be charged the price of the session once. One-on-one sessions are typically Rs. 1500. We also offer affordable group sessions (5-15 students) at lower costs, and free informative webinars."
  },
  {
    question: "What can I expect from mentors?",
    answer: "Mentors are vetted and continuously evaluated based on their performances, with the goal to only have the best mentors available to you. Their goal is to get you closer to your goal with the services booked in your plan. However, mentors are professionals in the industry, offering their free time to help you reach your goals. You'll typically receive replies within a few hours and will have pre-scheduled meetings with your mentor, they cannot be available to you 24/7."
  },
];

type SuggestedMentorProfileWithDetails = MentorProfile & {
  relevanceScore: number;
  reason: string;
};

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


export default function DashboardHomePage() {
  const { user, getScheduledSessionsForCurrentUser, bookingsVersion } = useAuth();
  
  const [mentorScrollPosition, setMentorScrollPosition] = useState(0);
  const [sessionScrollPosition, setSessionScrollPosition] = useState(0);
  const [webinarScrollPosition, setWebinarScrollPosition] = useState(0);

  const mentorScrollContainerRef = useRef<HTMLDivElement>(null);
  const sessionScrollContainerRef = useRef<HTMLDivElement>(null);
  const webinarScrollContainerRef = useRef<HTMLDivElement>(null);

  const [mentorUpcomingSessions, setMentorUpcomingSessions] = useState<EnrichedBooking[]>([]);
  const [isLoadingMentorSchedule, setIsLoadingMentorSchedule] = useState(true);

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


  const menteeProfileForAI = useMemo(() => {
    if (!user || user.role !== 'mentee') return "Generic student interested in learning.";
    const mentee = user as MenteeProfile;
    let profileString = `Name: ${mentee.name}`;
    profileString += `, Bio: ${mentee.bio || 'N/A'}`;
    profileString += `, Interests: ${mentee.interests?.join(', ') || 'N/A'}`;
    profileString += `, Learning Goals: ${mentee.learningGoals || 'N/A'}`;
    profileString += `, Seeking Mentorship For: ${mentee.seekingMentorshipFor?.join(', ') || 'General Advice'}`;
    if (mentee.seekingMentorshipFor?.includes('university')) {
        profileString += `, Current Education Level: ${mentee.currentEducationLevel || 'N/A'}`;
        profileString += `, Target Degree Level: ${mentee.targetDegreeLevel || 'N/A'}`;
        profileString += `, Target Fields of Study: ${mentee.targetFieldsOfStudy?.join(', ') || 'N/A'}`;
        profileString += `, Desired Universities: ${mentee.desiredUniversities?.join(', ') || 'N/A'}`;
    }
    if (mentee.seekingMentorshipFor?.includes('career')) {
        profileString += `, Desired Job Roles: ${mentee.desiredJobRoles?.join(', ') || 'N/A'}`;
        profileString += `, Desired Companies: ${mentee.desiredCompanies?.join(', ') || 'N/A'}`;
    }
    return profileString;
  }, [user]);

  const { data: suggestedMentorsData, isLoading: isLoadingMentors } = useQuery<SuggestMentorsOutput, Error>({
    queryKey: ['dashboardRecommendedMentors', user?.id, menteeProfileForAI], // Include menteeProfileForAI in queryKey
    queryFn: async () => {
      if (!user || user.role !== 'mentee') return [];
      const input: SuggestMentorsInput = {
        menteeProfile: menteeProfileForAI,
        mentorProfiles: getMockMentorProfiles(),
      };
      return suggestMentors(input);
    },
    enabled: !!user && user.role === 'mentee',
  });

  const { data: suggestedGroupSessionsData, isLoading: isLoadingGroupSessions } = useQuery<SuggestGroupSessionsOutput, Error>({
    queryKey: ['dashboardRecommendedGroupSessions', user?.id, menteeProfileForAI], // Include menteeProfileForAI
    queryFn: async () => {
      if (!user || user.role !== 'mentee') return [];
      const input: SuggestGroupSessionsInput = { menteeProfile: menteeProfileForAI };
      return suggestGroupSessions(input);
    },
    enabled: !!user && user.role === 'mentee',
  });

  const { data: suggestedWebinarsData, isLoading: isLoadingWebinars } = useQuery<SuggestWebinarsOutput, Error>({
    queryKey: ['dashboardRecommendedWebinars', user?.id, menteeProfileForAI], // Include menteeProfileForAI
    queryFn: async () => {
      if (!user || user.role !== 'mentee') return [];
      const input: SuggestWebinarsInput = { menteeProfile: menteeProfileForAI };
      return suggestWebinars(input);
    },
    enabled: !!user && user.role === 'mentee',
  });


  const recommendedMentors = useMemo((): SuggestedMentorProfileWithDetails[] => {
    if (!suggestedMentorsData) return [];
    return suggestedMentorsData
      .map(suggestion => {
        const mentor = getMentorByProfileString(suggestion.mentorProfile);
        if (mentor) {
          return { ...mentor, relevanceScore: suggestion.relevanceScore, reason: suggestion.reason };
        }
        return null;
      })
      .filter((profile): profile is SuggestedMentorProfileWithDetails => Boolean(profile))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [suggestedMentorsData]);

  const handleScroll = (direction: 'left' | 'right', scrollContainerRef: React.RefObject<HTMLDivElement>, setScrollPosition: React.Dispatch<React.SetStateAction<number>>) => {
    const scrollAmount = 280; 
    if (scrollContainerRef.current) {
        if (direction === 'left') {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            setScrollPosition(prev => Math.max(0, prev - scrollAmount));
        } else {
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setScrollPosition(prev => prev + scrollAmount);
        }
    }
  };


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
            icon={CalendarDays}
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
            icon={Tv2}
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


  // MENTEE DASHBOARD HOME
  return (
    <div className="space-y-0"> 
      {/* Welcome Banner */}
      <section className="bg-primary text-primary-foreground py-4 md:py-6 text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-lg md:text-xl font-bold">Welcome, {user.name || "User"}!</h1>
          <p className="mt-1 text-xs text-primary-foreground/80 max-w-md mx-auto">
            Start connecting with mentors and get ready to take your career to the next level!
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-2 bg-card text-card-foreground hover:bg-card/90 px-3 py-1 h-auto text-xs">
            <Link href="/dashboard/mentors">Browse mentors</Link>
          </Button>
        </div>
      </section>

      {/* Recommended for you Section */}
      {user.role === 'mentee' && (
        <section className="py-4 md:py-6 bg-background">
          <div className="container mx-auto px-4 sm:px-6 space-y-3">
            {/* Recommended Mentors */}
            <div>
              <h2 className="text-sm md:text-base font-bold text-foreground mb-1.5">Recommended Mentors</h2>
              {isLoadingMentors && (
                <div className="flex space-x-3 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div key={`mentor-skeleton-${i}`} className="w-[270px] sm:w-[300px] md:w-[330px] flex-shrink-0"><MentorCardSkeleton /></div>
                  ))}
                </div>
              )}
              {!isLoadingMentors && recommendedMentors && recommendedMentors.length > 0 && (
                <div className="relative">
                  <div ref={mentorScrollContainerRef} className="overflow-x-auto pb-2 no-scrollbar flex space-x-3">
                      {recommendedMentors.slice(0,5).map((mentor) => ( // Show top 5 mentor suggestions
                         <div key={mentor.id} className="w-[270px] sm:w-[300px] md:w-[330px] flex-shrink-0">
                           <MentorCard mentor={mentor} relevanceScore={mentor.relevanceScore} reason={mentor.reason} />
                         </div>
                      ))}
                  </div>
                  {recommendedMentors.length > 2 && ( 
                      <>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('left', mentorScrollContainerRef, setMentorScrollPosition)} disabled={mentorScrollPosition === 0} className="absolute top-1/2 -translate-y-1/2 left-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex h-5 w-5">
                              <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('right', mentorScrollContainerRef, setMentorScrollPosition)} className="absolute top-1/2 -translate-y-1/2 right-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex h-5 w-5">
                              <ChevronRight className="h-3 w-3" />
                          </Button>
                      </>
                  )}
                </div>
              )}
              {!isLoadingMentors && recommendedMentors && recommendedMentors.length === 0 && (
                <p className="text-muted-foreground text-xs">No specific mentor recommendations for you at the moment. Complete your profile or explore all mentors!</p>
              )}
            </div>

            {/* Recommended Group Sessions */}
            <div>
              <h2 className="text-sm md:text-base font-bold text-foreground mb-1.5">Recommended Group Sessions</h2>
              {isLoadingGroupSessions && (
                <div className="flex space-x-3 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div key={`gs-skeleton-${i}`} className="w-[200px] sm:w-[220px] md:w-[240px] flex-shrink-0"><GroupSessionCardSkeleton /></div>
                  ))}
                </div>
              )}
              {!isLoadingGroupSessions && suggestedGroupSessionsData && suggestedGroupSessionsData.length > 0 && (
                <div className="relative">
                  <div ref={sessionScrollContainerRef} className="overflow-x-auto pb-2 no-scrollbar flex space-x-3">
                      {suggestedGroupSessionsData.map((session) => (
                         <div key={session.id} className="w-[200px] sm:w-[220px] md:w-[240px] flex-shrink-0">
                           <GroupSessionCard session={session} />
                         </div>
                      ))}
                  </div>
                   {suggestedGroupSessionsData.length > 2 && (
                      <>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('left', sessionScrollContainerRef, setSessionScrollPosition)} disabled={sessionScrollPosition === 0} className="absolute top-1/2 -translate-y-1/2 left-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex h-5 w-5">
                              <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('right', sessionScrollContainerRef, setSessionScrollPosition)} className="absolute top-1/2 -translate-y-1/2 right-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex h-5 w-5">
                              <ChevronRight className="h-3 w-3" />
                          </Button>
                      </>
                  )}
                </div>
              )}
              {!isLoadingGroupSessions && suggestedGroupSessionsData && suggestedGroupSessionsData.length === 0 && (
                <p className="text-muted-foreground text-xs">No group session recommendations for you right now. Check back later!</p>
              )}
            </div>

            {/* Recommended Webinars */}
            <div>
              <h2 className="text-sm md:text-base font-bold text-foreground mb-1.5">Recommended Webinars</h2>
               {isLoadingWebinars && (
                <div className="flex space-x-3 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div key={`webinar-skeleton-${i}`} className="w-[270px] sm:w-[300px] md:w-[330px] flex-shrink-0"><WebinarCardSkeleton /></div>
                  ))}
                </div>
              )}
              {!isLoadingWebinars && suggestedWebinarsData && suggestedWebinarsData.length > 0 && (
                <div className="relative">
                  <div ref={webinarScrollContainerRef} className="overflow-x-auto pb-2 no-scrollbar flex space-x-3">
                      {suggestedWebinarsData.map((webinar) => (
                         <div key={webinar.id} className="w-[270px] sm:w-[300px] md:w-[330px] flex-shrink-0">
                           <WebinarCard webinar={webinar} />
                         </div>
                      ))}
                  </div>
                  {suggestedWebinarsData.length > 2 && (
                      <>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('left', webinarScrollContainerRef, setWebinarScrollPosition)} disabled={webinarScrollPosition === 0} className="absolute top-1/2 -translate-y-1/2 left-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex h-5 w-5">
                              <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('right', webinarScrollContainerRef, setWebinarScrollPosition)} className="absolute top-1/2 -translate-y-1/2 right-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex h-5 w-5">
                              <ChevronRight className="h-3 w-3" />
                          </Button>
                      </>
                  )}
                </div>
              )}
              {!isLoadingWebinars && suggestedWebinarsData && suggestedWebinarsData.length === 0 && (
                <p className="text-muted-foreground text-xs">No webinar recommendations for you at this time. Explore upcoming events!</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Sessions Section (for Mentees) */}
      {user.role === 'mentee' && (
        <section className="py-4 md:py-6 bg-muted/40">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-2">Featured Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {menteeFeaturedSessionsData.map((session) => (
                <Card key={session.title} className="shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                  <CardHeader className="p-2">
                    <CardTitle className="text-xs text-primary">{session.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow p-2 pt-0">
                    <p className="text-muted-foreground text-[11px] line-clamp-2 mb-1">{session.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center text-xs border-t p-2 mt-auto">
                    <span className="text-muted-foreground text-[10px]">{session.details}</span>
                    <span className="font-semibold text-primary text-[10px]">{session.price}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Frequently Asked Questions Section (for Mentees) */}
      {user.role === 'mentee' && (
        <section className="py-4 md:py-6 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-sm md:text-base font-bold text-foreground mb-2 text-left">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-1">
              {menteeFaqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-muted/30 rounded-md px-2 shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="text-left hover:no-underline text-xs font-semibold text-foreground py-1.5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs pt-0 pb-1.5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="text-center mt-3">
              <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 h-auto text-xs" asChild>
                <Link href="/how-it-works">Read more</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

