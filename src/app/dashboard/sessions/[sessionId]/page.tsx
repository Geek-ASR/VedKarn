
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { GroupSession } from "@/lib/types";
import { getGroupSessionById } from "@/ai/flows/suggest-group-sessions";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarDays, Clock, DollarSign, Frown, Info, Tag, Users, Users2, CheckCircle, ArrowLeft, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/core/user-avatar"; // Assuming UserAvatar can take a simple name/imageUrl

export default function GroupSessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [session, setSession] = useState<GroupSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false); // Mock state for joined status

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      getGroupSessionById(sessionId)
        .then((data) => {
          if (data) {
            setSession(data);
          } else {
            setError("Group session not found.");
          }
        })
        .catch(() => setError("Failed to load session details."))
        .finally(() => setIsLoading(false));
    }
  }, [sessionId]);

  const handleJoinSession = () => {
    if (!session) return;
    // Mock joining logic
    setIsJoined(true);
    toast({
      title: "Successfully Joined!",
      description: `You've joined the session: "${session.title}". A confirmation email would be sent (mock).`,
    });
    // In a real app, this would involve API calls, payment processing if applicable, etc.
    // For now, we just update the UI state.
    // Potentially update participantCount if we were mutating shared mock data
  };

  const isSessionFull = session ? (session.participantCount || 0) >= (session.maxParticipants || Infinity) : false;

  if (isLoading) {
    return <GroupSessionDetailSkeleton />;
  }

  if (error || !session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sessions
        </Button>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Frown className="h-4 w-4" />
          <AlertTitle>{error ? "Error" : "Session Not Found"}</AlertTitle>
          <AlertDescription>{error || "The group session you are looking for does not exist or could not be loaded."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to recommendations
      </Button>

      <Card className="overflow-hidden shadow-xl rounded-lg">
        {session.imageUrl && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={session.imageUrl}
              alt={session.title}
              fill
              className="object-cover"
              data-ai-hint="group learning online"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <CardTitle className="absolute bottom-6 left-6 text-3xl md:text-4xl font-bold text-white">
              {session.title}
            </CardTitle>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-0">
          <div className="md:col-span-2 p-6 md:p-8 space-y-6">
            {!session.imageUrl && (
                 <CardTitle className="text-3xl font-bold text-primary mb-4">
                    {session.title}
                </CardTitle>
            )}
            <div className="flex items-center space-x-3 text-muted-foreground">
              <UserAvatar user={{ name: session.hostName, profileImageUrl: session.hostImageUrl } as any} className="h-10 w-10" />
              <div>
                <span className="font-semibold text-foreground">Hosted by {session.hostName}</span>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-semibold text-foreground mb-2 border-b pb-1">Session Details</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {session.description}
              </p>
            </section>

            {session.tags && session.tags.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-2 border-b pb-1">Topics & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="py-1 px-3 text-sm">
                      <Tag className="h-3.5 w-3.5 mr-1.5" /> {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
             <Alert className="bg-primary/5 border-primary/20 text-primary mt-6">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold">Note on Joining</AlertTitle>
                <AlertDescription>
                    Joining this session is a mock action. In a real application, this might involve payment and official registration.
                </AlertDescription>
            </Alert>
          </div>

          <aside className="md:col-span-1 p-6 md:p-8 bg-muted/30 md:border-l space-y-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Session Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 mr-3 text-accent"/>
                        <span className="text-foreground">{session.date}</span>
                    </div>
                    {session.price && (
                         <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-3 text-accent"/>
                            <span className="font-semibold text-lg text-primary">{session.price}</span>
                        </div>
                    )}
                    {session.maxParticipants && (
                         <div className="flex items-center">
                            <Users2 className="h-5 w-5 mr-3 text-accent"/>
                            <span className="text-foreground">
                                {session.participantCount || 0} / {session.maxParticipants} spots filled
                            </span>
                        </div>
                    )}
                     {session.maxParticipants && (session.participantCount || 0) < session.maxParticipants && (
                        <Progress value={((session.participantCount || 0) / session.maxParticipants) * 100} className="h-2" />
                     )}
                </CardContent>
                <CardFooter>
                    {user && user.role === 'mentee' ? (
                        <Button 
                            className="w-full text-lg py-6" 
                            onClick={handleJoinSession} 
                            disabled={isJoined || isSessionFull}
                        >
                           {isJoined ? (
                                <><CheckCircle className="mr-2 h-5 w-5" /> Joined!</>
                           ) : isSessionFull ? (
                                "Session Full"
                           ) : (
                                "Join Session"
                           )}
                        </Button>
                    ) : (
                        <p className="text-xs text-muted-foreground w-full text-center">Sign in as a mentee to join sessions.</p>
                    )}
                </CardFooter>
            </Card>
            {/* Placeholder for related sessions or host info */}
          </aside>
        </div>
      </Card>
    </div>
  );
}


function GroupSessionDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-8 w-40 mb-6" /> {/* Back button */}
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <Skeleton className="h-64 md:h-96 w-full" /> {/* Image */}
        <div className="grid md:grid-cols-3 gap-0">
          <div className="md:col-span-2 p-6 md:p-8 space-y-6">
            <Skeleton className="h-8 w-3/4 mb-4" /> {/* Title if no image */}
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <section className="space-y-2">
              <Skeleton className="h-6 w-1/3 mb-1" /> {/* Section Title */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </section>
            <section className="space-y-2">
              <Skeleton className="h-6 w-1/3 mb-1" /> {/* Section Title */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </section>
            <Skeleton className="h-16 w-full" /> {/* Alert */}
          </div>
          <aside className="md:col-span-1 p-6 md:p-8 bg-muted/30 md:border-l space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <Skeleton className="h-7 w-1/2" /> {/* Card Title */}
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full" /> {/* Progress */}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-12 w-full text-lg py-6" /> {/* Button */}
              </CardFooter>
            </Card>
          </aside>
        </div>
      </Card>
    </div>
  );
}

// Minimal Progress component for skeleton, actual one from ui/progress would be used
const Progress = ({ value, className }: { value: number, className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ${className}`}>
    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
  </div>
);

