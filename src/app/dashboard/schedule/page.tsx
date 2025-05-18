
"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import type { EnrichedBooking, UserProfile, UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/core/user-avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isFuture, isPast, intervalToDuration } from 'date-fns';
import { CalendarClock, CheckCircle, History, Users, Video, Info, AlertCircle, X, Mic, VideoOff, ScreenShare, PhoneOff, MessageCircle, MicOff, CameraOff } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function SchedulePage() {
  const auth = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<EnrichedBooking[]>([]);
  const [pastSessions, setPastSessions] = useState<EnrichedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);
  const [currentCallSession, setCurrentCallSession] = useState<EnrichedBooking | null>(null);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Depend on the auth object, which will change if bookingsVersion changes
    const { user, getScheduledSessionsForCurrentUser } = auth;
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
  }, [auth]); // Key dependency change here

  useEffect(() => {
    if (isVideoCallModalOpen && callStartTime) {
      timerIntervalRef.current = setInterval(() => {
        const duration = intervalToDuration({ start: callStartTime, end: new Date() });
        const formattedTime = `${String(duration.minutes || 0).padStart(2, '0')}:${String(duration.seconds || 0).padStart(2, '0')}`;
        setElapsedTime(formattedTime);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isVideoCallModalOpen, callStartTime]);

  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsCameraOff(false);
      setIsMicMuted(false);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Media Access Denied',
        description: 'Please enable camera and microphone permissions in your browser settings to use video call.',
      });
    }
  };

  const stopLocalMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const handleJoinCall = async (session: EnrichedBooking) => {
    setCurrentCallSession(session);
    setCallStartTime(new Date());
    setElapsedTime("00:00");
    setIsVideoCallModalOpen(true);
    await startLocalMedia();
  };

  const handleEndCall = () => {
    stopLocalMedia();
    setIsVideoCallModalOpen(false);
    setCurrentCallSession(null);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setCallStartTime(null);
    setElapsedTime("00:00");
    setHasCameraPermission(null);
    setIsCameraOff(true);
    setIsMicMuted(false);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setIsMicMuted(!audioTracks[0].enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setIsCameraOff(!videoTracks[0].enabled);
      }
    }
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

  if (!auth.user) {
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
    ? (auth.user.id === currentCallSession.mentor.id ? currentCallSession.mentee : currentCallSession.mentor)
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
            <EmptyState userRole={auth.user.role!} sessionType="upcoming" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userRole={auth.user!.role!}
                  isPastSession={false}
                  onJoinCall={() => handleJoinCall(session)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastSessions.length === 0 ? (
            <EmptyState userRole={auth.user.role!} sessionType="past" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userRole={auth.user!.role!}
                  isPastSession={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {currentCallSession && otherParticipant && auth.user && (
        <Dialog open={isVideoCallModalOpen} onOpenChange={(isOpen) => { if (!isOpen) handleEndCall(); setIsVideoCallModalOpen(isOpen); }}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 sm:p-0">
            <DialogHeader className="p-4 border-b flex flex-row justify-between items-center">
              <div>
                <DialogTitle className="text-lg md:text-xl">Video Call with {otherParticipant.name}</DialogTitle>
                <DialogDescription>
                  Session Time: {format(parseISO(currentCallSession.startTime), "PPP 'at' p")}
                </DialogDescription>
              </div>
              <div className="text-sm font-mono text-primary">{elapsedTime}</div>
            </DialogHeader>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-1 p-1 bg-black overflow-hidden">
              <div className="relative bg-muted rounded-sm overflow-hidden shadow-inner flex flex-col items-center justify-center">
                <Image
                  src={otherParticipant.profileImageUrl || `https://placehold.co/800x600.png`}
                  alt={`${otherParticipant.name}'s video feed`}
                  fill={true}
                  style={{objectFit: 'cover'}}
                  data-ai-hint="person video call"
                  className="opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                  <Mic className="h-3 w-3 mr-1.5 text-green-400" />
                  {otherParticipant.name}
                </div>
                <UserAvatar user={otherParticipant} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 opacity-50 text-4xl pointer-events-none" />
              </div>

              <div className="relative bg-muted rounded-sm overflow-hidden shadow-inner flex flex-col items-center justify-center">
                 <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 {(isCameraOff || hasCameraPermission === false) && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                        <UserAvatar user={auth.user} className="h-24 w-24 text-4xl opacity-80 mb-2" />
                        {hasCameraPermission === false && <p className="text-sm">Camera access denied</p>}
                        {isCameraOff && hasCameraPermission && <p className="text-sm">Camera is off</p>}
                        {!hasCameraPermission && hasCameraPermission !== false && <p className="text-sm">Attempting to start camera...</p>}
                         <CameraOff className="h-10 w-10 text-white mt-4" />
                    </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                  {isMicMuted ? <MicOff className="h-3 w-3 mr-1.5 text-red-400" /> : <Mic className="h-3 w-3 mr-1.5 text-green-400" />}
                  You
                </div>
              </div>
            </div>
             {hasCameraPermission === false && (
              <Alert variant="destructive" className="m-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera/Mic Access Denied</AlertTitle>
                <AlertDescription>
                  To participate in video calls, please enable camera and microphone permissions in your browser settings and refresh the page.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="p-3 sm:p-4 border-t bg-background flex flex-row justify-center items-center space-x-2 sm:space-x-3">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12" title={isMicMuted ? "Unmute Mic" : "Mute Mic"} onClick={toggleMic} disabled={hasCameraPermission === false}>
                {isMicMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12" title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"} onClick={toggleCamera} disabled={hasCameraPermission === false}>
                {isCameraOff ? <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Video className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12" title="Share Screen (Mock)" disabled>
                <ScreenShare className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:hidden" title="Chat (Mock)" disabled>
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12" title="End Call" onClick={handleEndCall}>
                <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />
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
          disabled={(isPastSession)}
          onClick={!isPastSession ? onJoinCall : undefined}
        >
          <Video className="mr-2 h-4 w-4" />
          {isPastSession ? "View Recording (Mock)" : "Join In-App Call"}
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

    