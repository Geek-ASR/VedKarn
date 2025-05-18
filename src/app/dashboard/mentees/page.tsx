
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import type { EnrichedBooking, MenteeProfile, UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/core/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Briefcase, CalendarClock, Frown, MessageCircle, UserCircle2, Info } from "lucide-react";
import { format, parseISO, isFuture, isPast } from 'date-fns';
import Link from "next/link";

interface ProcessedMenteeSessionInfo {
  type: 'upcoming' | 'past' | 'none';
  date: string | null;
  rawDate?: Date; // For sorting if needed before formatting
}

interface ProcessedMentee {
  menteeProfile: MenteeProfile;
  sessionInfo: ProcessedMenteeSessionInfo;
}

export default function MyMenteesPage() {
  const auth = useAuth();
  const [processedMentees, setProcessedMentees] = useState<ProcessedMentee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.user && auth.user.role === 'mentor') {
      const fetchAndProcessMentees = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const sessions = await auth.getScheduledSessionsForCurrentUser();
          const mentorId = auth.user!.id;

          const menteeMap = new Map<string, { mentee: MenteeProfile, sessions: EnrichedBooking[] }>();

          sessions.forEach(session => {
            if (session.mentorId === mentorId) {
              if (!menteeMap.has(session.menteeId)) {
                menteeMap.set(session.menteeId, { mentee: session.mentee as MenteeProfile, sessions: [] });
              }
              menteeMap.get(session.menteeId)!.sessions.push(session);
            }
          });

          const menteesData: ProcessedMentee[] = Array.from(menteeMap.values()).map(({ mentee, sessions }) => {
            let sessionInfo: ProcessedMenteeSessionInfo = { type: 'none', date: null };

            const upcomingSessions = sessions
              .filter(s => isFuture(parseISO(s.startTime)))
              .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());

            if (upcomingSessions.length > 0) {
              const nextSessionDate = parseISO(upcomingSessions[0].startTime);
              sessionInfo = {
                type: 'upcoming',
                date: format(nextSessionDate, "MMM d, yyyy 'at' p"),
                rawDate: nextSessionDate
              };
            } else {
              const pastSessions = sessions
                .filter(s => isPast(parseISO(s.endTime)))
                .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
              
              if (pastSessions.length > 0) {
                const lastSessionDate = parseISO(pastSessions[0].startTime);
                sessionInfo = {
                  type: 'past',
                  date: format(lastSessionDate, "MMM d, yyyy 'at' p"),
                  rawDate: lastSessionDate
                };
              }
            }
            return { menteeProfile: mentee, sessionInfo };
          });
          
          // Sort mentees: those with upcoming sessions first, then by next/last session date
          menteesData.sort((a, b) => {
            if (a.sessionInfo.type === 'upcoming' && b.sessionInfo.type !== 'upcoming') return -1;
            if (a.sessionInfo.type !== 'upcoming' && b.sessionInfo.type === 'upcoming') return 1;
            if (a.sessionInfo.rawDate && b.sessionInfo.rawDate) {
              return a.sessionInfo.rawDate.getTime() - b.sessionInfo.rawDate.getTime();
            }
            return 0;
          });

          setProcessedMentees(menteesData);
        } catch (e) {
          console.error("Failed to fetch or process mentees:", e);
          setError("Could not load your mentees. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAndProcessMentees();
    } else if (!auth.loading && auth.user?.role !== 'mentor') {
        setError("Access Denied: This page is for mentors only.");
        setIsLoading(false);
    } else if (!auth.user && !auth.loading){
        setError("Please log in to view this page.");
        setIsLoading(false);
    }

  }, [auth]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center space-x-4 pb-3">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex gap-2">
                <Skeleton className="h-9 w-1/2 rounded-md" />
                <Skeleton className="h-9 w-1/2 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <Frown className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
         <Button variant="link" asChild className="mt-2"><Link href="/dashboard">Go to Dashboard</Link></Button>
      </Alert>
    );
  }
  
  if (auth.user?.role !== 'mentor') {
     return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <Frown className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>This page is for mentors only.</AlertDescription>
        <Button variant="link" asChild className="mt-2"><Link href="/dashboard">Go to Dashboard</Link></Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Briefcase className="mr-3 h-8 w-8 text-accent" /> My Mentees
          </h1>
          <p className="text-muted-foreground">View mentees who have booked sessions with you.</p>
        </div>
      </div>

      {processedMentees.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardHeader>
            <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="text-xl text-muted-foreground">No Mentees Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              No mentees have booked sessions with you yet. Ensure your availability is set so they can find you!
            </p>
            <Button asChild>
              <Link href="/dashboard/availability">Set Availability</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedMentees.map(({ menteeProfile, sessionInfo }) => (
            <Card key={menteeProfile.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center space-x-4 pb-3">
                <UserAvatar user={menteeProfile} className="h-16 w-16 text-2xl" />
                <div>
                  <CardTitle className="text-lg text-primary">{menteeProfile.name}</CardTitle>
                  <CardDescription className="text-xs">Mentee</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {sessionInfo.type !== 'none' && sessionInfo.date ? (
                  <div className="text-sm text-foreground flex items-start">
                    <CalendarClock className="h-4 w-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                    <span>
                      {sessionInfo.type === 'upcoming' ? 'Next session: ' : 'Last session: '}
                      {sessionInfo.date}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent or upcoming sessions found.</p>
                )}
                {menteeProfile.learningGoals && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        <strong>Goals:</strong> {menteeProfile.learningGoals}
                    </p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-4 mt-auto">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <UserCircle2 className="mr-2 h-4 w-4" /> View Profile (Soon)
                </Button>
                <Button variant="default" size="sm" className="flex-1" disabled>
                  <MessageCircle className="mr-2 h-4 w-4" /> Message (Soon)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

