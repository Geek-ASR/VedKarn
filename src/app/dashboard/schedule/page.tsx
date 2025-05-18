
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import type { EnrichedBooking, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/core/user-avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { CalendarClock, CheckCircle, History, Users, Video, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SchedulePage() {
  const { user, getScheduledSessionsForCurrentUser } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<EnrichedBooking[]>([]);
  const [pastSessions, setPastSessions] = useState<EnrichedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const sessions = await getScheduledSessionsForCurrentUser();
          const now = new Date();
          setUpcomingSessions(sessions.filter(s => isFuture(parseISO(s.endTime))).sort((a,b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
          setPastSessions(sessions.filter(s => isPast(parseISO(s.endTime))).sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
        } catch (e) {
          console.error("Failed to fetch scheduled sessions:", e);
          setError("Could not load your schedule. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSessions();
    } else {
      setIsLoading(false); // Not logged in, so not loading sessions
    }
  }, [user, getScheduledSessionsForCurrentUser]);

  if (isLoading) {
    return <SchedulePageSkeleton />;
  }

  if (error) {
     return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Schedule</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
  }
  
  if (!user) {
     return (
        <Alert className="max-w-lg mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>Not Logged In</AlertTitle>
            <AlertDescription>
            Please <Link href="/auth/signin" className="underline hover:text-primary">sign in</Link> to view your schedule.
            </AlertDescription>
        </Alert>
     );
  }


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <CalendarClock className="mr-3 h-8 w-8 text-accent" /> My Schedule
          </CardTitle>
          <CardDescription className="text-lg">
            View and manage your upcoming and past mentorship sessions.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 mx-auto">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingSessions.length === 0 ? (
            <EmptyState userRole={user.role} sessionType="upcoming" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} userRole={user.role!} isPastSession={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastSessions.length === 0 ? (
            <EmptyState userRole={user.role} sessionType="past" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastSessions.map(session => (
                <SessionCard key={session.id} session={session} userRole={user.role!} isPastSession={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SessionCardProps {
  session: EnrichedBooking;
  userRole: 'mentor' | 'mentee';
  isPastSession: boolean;
}

function SessionCard({ session, userRole, isPastSession }: SessionCardProps) {
  const otherParticipant = userRole === 'mentor' ? session.mentee : session.mentor;
  const otherParticipantRole = userRole === 'mentor' ? 'Mentee' : 'Mentor';

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <UserAvatar user={otherParticipant} className="h-12 w-12" />
          <div>
            <CardTitle className="text-lg text-primary">{otherParticipant.name}</CardTitle>
            <CardDescription className="text-xs">{otherParticipantRole}</CardDescription>
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {format(parseISO(session.startTime), "EEEE, MMMM d, yyyy")}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(session.startTime), 'p')} - {format(parseISO(session.endTime), 'p')}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        {session.meetingNotes && (
            <div className="text-xs bg-muted p-2 rounded-md">
                <p className="font-semibold mb-1">Session Focus:</p>
                <p className="text-muted-foreground line-clamp-3">{session.meetingNotes}</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPastSession && userRole === 'mentee'}>
          <Video className="mr-2 h-4 w-4" />
          {isPastSession ? "View Recording (Mock)" : "Join In-App Call (Mock)"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmptyState({ userRole, sessionType }: { userRole: UserRole, sessionType: 'upcoming' | 'past' }) {
  const message = sessionType === 'upcoming' 
    ? "You have no upcoming sessions." 
    : "You have no past sessions recorded.";
  
  const ctaText = userRole === 'mentee' 
    ? "Find a Mentor" 
    : "Check Your Availability";
  
  const ctaLink = userRole === 'mentee' 
    ? "/dashboard/mentors" 
    : "/dashboard/availability";

  return (
    <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center border-dashed">
      <CardHeader>
        <div className="p-3 bg-muted rounded-full mb-3 inline-block">
          {sessionType === 'upcoming' ? <CalendarClock className="h-10 w-10 text-muted-foreground" /> : <History className="h-10 w-10 text-muted-foreground" />}
        </div>
        <CardTitle className="text-xl text-muted-foreground">{message}</CardTitle>
      </CardHeader>
      <CardContent>
        {sessionType === 'upcoming' && userRole && (
          <Button asChild>
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SchedulePageSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 mr-3 rounded-full" />
            <Skeleton className="h-8 w-1/3" />
          </div>
          <Skeleton className="h-5 w-1/2 mt-2" />
        </CardHeader>
      </Card>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 mx-auto">
          <TabsTrigger value="upcoming"><Skeleton className="h-5 w-24" /></TabsTrigger>
          <TabsTrigger value="past"><Skeleton className="h-5 w-20" /></TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-md flex flex-col">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="flex-grow">
                   <Skeleton className="h-12 w-full rounded-md" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    