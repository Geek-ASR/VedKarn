
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import type { EnrichedBooking, UserProfile, UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/core/user-avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { CalendarClock, CheckCircle, History, Users, Video, Info, AlertCircle, X, Mic, VideoOff, ScreenShare, PhoneOff } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';

export default function SchedulePage() {
  const { user, getScheduledSessionsForCurrentUser } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<EnrichedBooking[]>([]);
  const [pastSessions, setPastSessions] = useState<EnrichedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);
  const [currentCallSession, setCurrentCallSession] = useState<EnrichedBooking | null>(null);

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
      setIsLoading(false); 
    }
  }, [user, getScheduledSessionsForCurrentUser]);

  const handleJoinCall = (session: EnrichedBooking) => {
    setCurrentCallSession(session);
    setIsVideoCallModalOpen(true);
  };

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

  const otherParticipant = currentCallSession 
    ? (user.role === 'mentor' ? currentCallSession.mentee : currentCallSession.mentor) 
    : null;


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
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  userRole={user.role!} 
                  isPastSession={false}
                  onJoinCall={() => handleJoinCall(session)}
                />
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
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  userRole={user.role!} 
                  isPastSession={true} 
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {currentCallSession && otherParticipant && (
        <Dialog open={isVideoCallModalOpen} onOpenChange={setIsVideoCallModalOpen}>
          <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-lg">Video Call with {otherParticipant.name}</DialogTitle>
              <DialogDescription>
                Session: {format(parseISO(currentCallSession.startTime), "PPP 'at' p")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-muted/40 overflow-hidden">
              {/* Other Participant's Video */}
              <div className="relative bg-card rounded-md overflow-hidden shadow-inner flex flex-col items-center justify-center">
                <Image src={otherParticipant.profileImageUrl || "https://placehold.co/600x400.png"} alt={otherParticipant.name || "Participant"} layout="fill" objectFit="cover" data-ai-hint="person portrait" />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {otherParticipant.name}
                </div>
              </div>
              {/* User's Video (Placeholder) */}
              <div className="relative bg-card rounded-md overflow-hidden shadow-inner flex flex-col items-center justify-center">
                 <Image src={user.profileImageUrl || "https://placehold.co/600x400.png"} alt={user.name || "You"} layout="fill" objectFit="cover" data-ai-hint="person looking at screen" />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  You
                </div>
                 <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                    <Mic className="h-4 w-4"/>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-background flex flex-row justify-center items-center space-x-3">
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12" title="Mute/Unmute Mic (Mock)">
                <Mic className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12" title="Turn Camera On/Off (Mock)">
                <VideoOff className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12" title="Share Screen (Mock)">
                <ScreenShare className="h-5 w-5" />
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" title="End Call" onClick={() => setIsVideoCallModalOpen(false)}>
                <PhoneOff className="h-5 w-5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

interface SessionCardProps {
  session: EnrichedBooking;
  userRole: UserRole;
  isPastSession: boolean;
  onJoinCall?: () => void;
}

function SessionCard({ session, userRole, isPastSession, onJoinCall }: SessionCardProps) {
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
        <Button 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
          disabled={isPastSession && userRole === 'mentee'}
          onClick={!isPastSession ? onJoinCall : undefined}
        >
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
    : (userRole === 'mentor' ? "Update Availability" : "Explore");
  
  const ctaLink = userRole === 'mentee' 
    ? "/dashboard/mentors" 
    : (userRole === 'mentor' ? "/dashboard/availability" : "/dashboard");

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
