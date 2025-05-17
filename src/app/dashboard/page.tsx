
"use client";

import { useAuth, getMockMentorProfiles, getMentorByProfileString } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Users, CalendarDays, MessageCircle, Video } from "lucide-react";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { MentorProfile, MenteeProfile, GroupSession, Webinar } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { suggestMentors, type SuggestMentorsOutput, type SuggestMentorsInput } from "@/ai/flows/suggest-mentors";
import { suggestGroupSessions, type SuggestGroupSessionsOutput, type SuggestGroupSessionsInput } from "@/ai/flows/suggest-group-sessions";
import { suggestWebinars, type SuggestWebinarsOutput, type SuggestWebinarsInput } from "@/ai/flows/suggest-webinars";
import { MentorCard, MentorCardSkeleton } from "@/components/dashboard/mentor-card";
import { GroupSessionCard, GroupSessionCardSkeleton } from "@/components/dashboard/group-session-card";
import { WebinarCard, WebinarCardSkeleton } from "@/components/dashboard/webinar-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, useRef } from "react";

const featuredSessionsData = [
  {
    title: "Intro Call",
    description: "If you're looking for a mentor, and you're just not sure about how this all works - this should be for you.",
    details: "Approx. 30 minutes",
    price: "$39",
    href: "#intro-call"
  },
  {
    title: "Work Review",
    description: "In this session, a mentor will sit down with you, and give you some inputs to make your work better, be it a review, inputs on your design, or some inspiration.",
    details: "Approx. 45 minutes",
    price: "$80",
    href: "#work-review"
  },
  {
    title: "Interview Preparation",
    description: "Some big interviews coming up? In this 1-hour session, a mentor with hiring experience will act as a technical interviewer and ask you some standard hiring questions.",
    details: "Approx. 60 minutes",
    price: "$99",
    href: "#interview-prep"
  }
];

const faqData = [
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

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [mentorScrollPosition, setMentorScrollPosition] = useState(0);
  const [sessionScrollPosition, setSessionScrollPosition] = useState(0);
  const [webinarScrollPosition, setWebinarScrollPosition] = useState(0);

  const mentorScrollContainerRef = useRef<HTMLDivElement>(null);
  const sessionScrollContainerRef = useRef<HTMLDivElement>(null);
  const webinarScrollContainerRef = useRef<HTMLDivElement>(null);


  const menteeProfileForAI = useMemo(() => {
    if (!user || user.role !== 'mentee') return "Generic student interested in learning.";
    const mentee = user as MenteeProfile;
    return "Name: " + mentee.name +
           ", Bio: " + (mentee.bio || 'N/A') +
           ", Learning Goals: " + (mentee.learningGoals || 'N/A') +
           ", Desired Universities: " + (mentee.desiredUniversities?.join(', ') || 'N/A') +
           ", Desired Job Roles: " + (mentee.desiredJobRoles?.join(', ') || 'N/A') +
           ", Desired Companies: " + (mentee.desiredCompanies?.join(', ') || 'N/A') +
           ", Interests: " + (mentee.interests?.join(', ') || 'N/A');
  }, [user]);

  const { data: suggestedMentorsData, isLoading: isLoadingMentors } = useQuery<SuggestMentorsOutput, Error>({
    queryKey: ['dashboardRecommendedMentors', user?.id],
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
    queryKey: ['dashboardRecommendedGroupSessions', user?.id],
    queryFn: async () => {
      if (!user || user.role !== 'mentee') return [];
      const input: SuggestGroupSessionsInput = { menteeProfile: menteeProfileForAI };
      return suggestGroupSessions(input);
    },
    enabled: !!user && user.role === 'mentee',
  });

  const { data: suggestedWebinarsData, isLoading: isLoadingWebinars } = useQuery<SuggestWebinarsOutput, Error>({
    queryKey: ['dashboardRecommendedWebinars', user?.id],
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
    const scrollAmount = 320; // Approximate width of a card + gap
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

  return (
    <div className="space-y-0"> {/* Reduced outer spacing for a more compact layout */}
      {/* Welcome Banner */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold">Welcome, {user.name || "User"}!</h1>
          <p className="mt-3 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Start connecting with mentors and get ready to take your career to the next level!
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-8 bg-card text-card-foreground hover:bg-card/90 px-8">
            <Link href="/dashboard/mentors">Browse mentors</Link>
          </Button>
        </div>
      </section>

      {/* Recommended for you Section */}
      {user.role === 'mentee' && (
        <section className="py-10 md:py-12 bg-background">
          <div className="container mx-auto px-6 space-y-10">
            {/* Recommended Mentors */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Recommended Mentors</h2>
              {isLoadingMentors && (
                <div className="flex space-x-6 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div key={`mentor-skeleton-${i}`} className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0"><MentorCardSkeleton /></div>
                  ))}
                </div>
              )}
              {!isLoadingMentors && recommendedMentors && recommendedMentors.length > 0 && (
                <div className="relative">
                  <div ref={mentorScrollContainerRef} className="overflow-x-auto pb-4 no-scrollbar flex space-x-6">
                      {recommendedMentors.map((mentor) => (
                         <div key={mentor.id} className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0">
                           <MentorCard mentor={mentor} relevanceScore={mentor.relevanceScore} reason={mentor.reason} />
                         </div>
                      ))}
                  </div>
                  {recommendedMentors.length > 3 && ( // Show arrows if more than ~3 cards might be offscreen
                      <>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('left', mentorScrollContainerRef, setMentorScrollPosition)} disabled={mentorScrollPosition === 0} className="absolute top-1/2 -translate-y-1/2 left-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex">
                              <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('right', mentorScrollContainerRef, setMentorScrollPosition)} className="absolute top-1/2 -translate-y-1/2 right-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex">
                              <ChevronRight className="h-6 w-6" />
                          </Button>
                      </>
                  )}
                </div>
              )}
              {!isLoadingMentors && recommendedMentors && recommendedMentors.length === 0 && (
                <p className="text-muted-foreground">No specific mentor recommendations for you at the moment. Complete your profile or explore all mentors!</p>
              )}
            </div>

            {/* Recommended Group Sessions */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Recommended Group Sessions</h2>
              {isLoadingGroupSessions && (
                <div className="flex space-x-6 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div key={`gs-skeleton-${i}`} className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0"><GroupSessionCardSkeleton /></div>
                  ))}
                </div>
              )}
              {!isLoadingGroupSessions && suggestedGroupSessionsData && suggestedGroupSessionsData.length > 0 && (
                <div className="relative">
                  <div ref={sessionScrollContainerRef} className="overflow-x-auto pb-4 no-scrollbar flex space-x-6">
                      {suggestedGroupSessionsData.map((session) => (
                         <div key={session.id} className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0">
                           <GroupSessionCard session={session} />
                         </div>
                      ))}
                  </div>
                   {suggestedGroupSessionsData.length > 3 && (
                      <>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('left', sessionScrollContainerRef, setSessionScrollPosition)} disabled={sessionScrollPosition === 0} className="absolute top-1/2 -translate-y-1/2 left-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex">
                              <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('right', sessionScrollContainerRef, setSessionScrollPosition)} className="absolute top-1/2 -translate-y-1/2 right-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex">
                              <ChevronRight className="h-6 w-6" />
                          </Button>
                      </>
                  )}
                </div>
              )}
              {!isLoadingGroupSessions && suggestedGroupSessionsData && suggestedGroupSessionsData.length === 0 && (
                <p className="text-muted-foreground">No group session recommendations for you right now. Check back later!</p>
              )}
            </div>

            {/* Recommended Webinars */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Recommended Webinars</h2>
               {isLoadingWebinars && (
                <div className="flex space-x-6 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div key={`webinar-skeleton-${i}`} className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0"><WebinarCardSkeleton /></div>
                  ))}
                </div>
              )}
              {!isLoadingWebinars && suggestedWebinarsData && suggestedWebinarsData.length > 0 && (
                <div className="relative">
                  <div ref={webinarScrollContainerRef} className="overflow-x-auto pb-4 no-scrollbar flex space-x-6">
                      {suggestedWebinarsData.map((webinar) => (
                         <div key={webinar.id} className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0">
                           <WebinarCard webinar={webinar} />
                         </div>
                      ))}
                  </div>
                  {suggestedWebinarsData.length > 3 && (
                      <>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('left', webinarScrollContainerRef, setWebinarScrollPosition)} disabled={webinarScrollPosition === 0} className="absolute top-1/2 -translate-y-1/2 left-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex">
                              <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleScroll('right', webinarScrollContainerRef, setWebinarScrollPosition)} className="absolute top-1/2 -translate-y-1/2 right-0 z-10 rounded-full bg-background/70 hover:bg-background shadow-md hidden md:flex">
                              <ChevronRight className="h-6 w-6" />
                          </Button>
                      </>
                  )}
                </div>
              )}
              {!isLoadingWebinars && suggestedWebinarsData && suggestedWebinarsData.length === 0 && (
                <p className="text-muted-foreground">No webinar recommendations for you at this time. Explore upcoming events!</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Sessions Section */}
      <section className="py-10 md:py-12 bg-muted/40">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Featured Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredSessionsData.map((session) => (
              <Card key={session.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">{session.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm mb-3">{session.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm border-t pt-4 mt-auto">
                  <span className="text-muted-foreground">{session.details}</span>
                  <span className="font-semibold text-primary">{session.price}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-left">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-muted/30 rounded-lg px-4 shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="text-left hover:no-underline text-md font-semibold text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-10">
            <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" asChild>
              <Link href="/how-it-works">Read more</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// MentorCardSkeleton uses the MentorCard's internal skeleton structure
// No direct min-width change needed here as parent div controls it.
// But we can update its internal padding to match the actual MentorCard.
function MentorCardSkeletonPlaceholder() { // Renamed to avoid conflict if MentorCard exports its own skeleton
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-5">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-20 w-20 rounded-full border-2 border-background shadow-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-3 flex-grow">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div>
          <Skeleton className="h-3 w-1/4 mb-1.5" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-5 bg-muted/30 border-t mt-auto">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
