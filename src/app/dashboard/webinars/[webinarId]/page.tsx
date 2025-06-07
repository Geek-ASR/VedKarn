
"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Webinar } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarDays, Clock, Frown, Info, Tag, UserCircle, CheckCircle, ArrowLeft, Presentation, Tv2, BellRing, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/core/user-avatar";
import { requestWebinarReminder } from "@/app/actions/notifyActions";
import { useActionState } from "react"; 
import { useFormStatus } from "react-dom";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" className="flex-1" type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Sending..." : "Set Mock Reminder"}
    </Button>
  );
}

export default function WebinarDetailPage() {
  const rawParams = useParams();
  const webinarId = useMemo(() => rawParams.webinarId as string, [rawParams.webinarId]);

  const router = useRouter();
  const { user, getWebinarDetails } = useAuth();
  const { toast } = useToast();

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showNotifyInput, setShowNotifyInput] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const initialState = { success: false, message: "", error: undefined };
  const [formState, formAction] = useActionState(requestWebinarReminder, initialState); 
  
  const [isPending, startTransition] = useTransition();


  useEffect(() => {
    if (webinarId) {
      setIsLoading(true);
      getWebinarDetails(webinarId)
        .then((data) => {
          if (data) {
            setWebinar(data);
          } else {
            setError("Webinar not found.");
          }
        })
        .catch(() => setError("Failed to load webinar details."))
        .finally(() => setIsLoading(false));
    }
  }, [webinarId, getWebinarDetails]);

  useEffect(() => {
    if (formState?.success && !isPending) {
      toast({
        title: "Reminder Set (Mock)",
        description: formState.message,
      });
      setReminderSet(true);
      setShowNotifyInput(false);
    } else if (formState?.error && !formState.success && !isPending) {
      toast({
        title: "Reminder Error",
        description: formState.message || "Could not process reminder request.",
        variant: "destructive",
      });
    }
  }, [formState, toast, isPending]);


  const handleRegisterWebinar = () => {
    if (!webinar) return;
    setIsRegistered(true);
    toast({
      title: "Successfully Registered!",
      description: `You've registered for the webinar: "${webinar.title}". A confirmation email would be sent (mock).`,
    });
  };

  const handleNotifyMeClick = () => {
    setShowNotifyInput(true);
  };


  if (isLoading) {
    return <WebinarDetailSkeleton />;
  }

  if (error || !webinar) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Webinars
        </Button>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Frown className="h-4 w-4" />
          <AlertTitle>{error ? "Error" : "Webinar Not Found"}</AlertTitle>
          <AlertDescription>{error || "The webinar you are looking for does not exist or could not be loaded."}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const handleSubmitReminderForm = (formData: FormData) => {
    startTransition(() => {
        formAction(formData);
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to webinars
      </Button>

      <Card className="overflow-hidden shadow-xl rounded-lg">
        {webinar.imageUrl && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={webinar.imageUrl}
              alt={webinar.title}
              fill
              className="object-cover"
              data-ai-hint="online presentation screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <CardTitle className="absolute bottom-6 left-6 text-3xl md:text-4xl font-bold text-white">
              {webinar.title}
            </CardTitle>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-0">
          <div className="md:col-span-2 p-6 md:p-8 space-y-6">
            {!webinar.imageUrl && (
                 <CardTitle className="text-3xl font-bold text-primary mb-4 flex items-center">
                    <Tv2 className="mr-3 h-8 w-8"/> {webinar.title}
                </CardTitle>
            )}
            <div className="flex items-center space-x-3 text-muted-foreground">
              <UserAvatar user={{ name: webinar.speakerName, profileImageUrl: webinar.hostProfileImageUrl } as any} className="h-10 w-10" />
              <div>
                <span className="font-semibold text-foreground">Presented by {webinar.speakerName}</span>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-semibold text-foreground mb-2 border-b pb-1">Webinar Details</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {webinar.description}
              </p>
            </section>

            {webinar.topic && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-2 border-b pb-1">Main Topic</h3>
                <Badge variant="secondary" className="py-1 px-3 text-sm">
                    <Presentation className="h-3.5 w-3.5 mr-1.5" /> {webinar.topic}
                </Badge>
              </section>
            )}
             <Alert className="bg-primary/5 border-primary/20 text-primary mt-6">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold">Note on Registration & Reminders</AlertTitle>
                <AlertDescription>
                    Registering for this webinar is a mock action. Setting a reminder will log a request to our server (mock), but no actual messages will be sent.
                </AlertDescription>
            </Alert>
          </div>

          <aside className="md:col-span-1 p-6 md:p-8 bg-muted/30 md:border-l space-y-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Webinar Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 mr-3 text-accent"/>
                        <span className="text-foreground">{webinar.date}</span>
                    </div>
                    {webinar.duration && (
                         <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-3 text-accent"/>
                            <span className="text-foreground">{webinar.duration}</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-3">
                    {user ? (
                        <Button
                            className="w-full text-lg py-6"
                            onClick={handleRegisterWebinar}
                            disabled={isRegistered}
                        >
                           {isRegistered ? (
                                <><CheckCircle className="mr-2 h-5 w-5" /> Registered!</>
                           ) : (
                                "Register for Webinar"
                           )}
                        </Button>
                    ) : (
                        <p className="text-xs text-muted-foreground w-full text-center">Sign in to register for webinars.</p>
                    )}

                    {!reminderSet && !showNotifyInput && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleNotifyMeClick}
                      >
                        <BellRing className="mr-2 h-4 w-4" /> Notify Me
                      </Button>
                    )}
                    {reminderSet && (
                       <Button
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Reminder Set
                      </Button>
                    )}
                </CardFooter>
            </Card>
            {showNotifyInput && !reminderSet && (
              <Card className="shadow-md">
                <form action={handleSubmitReminderForm}>
                  <CardHeader>
                    <CardTitle className="text-lg">Set Reminder</CardTitle>
                    <CardDescription className="text-xs">Enter your phone or email.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label htmlFor="notify-contact" className="sr-only">Phone or Email</Label>
                    <Input
                      id="notify-contact"
                      name="contactInfo" 
                      placeholder="Phone number or email"
                      required
                    />
                    <input type="hidden" name="webinarTitle" value={webinar.title} />
                    <input type="hidden" name="webinarDate" value={webinar.date} />
                    {formState?.error && !formState.success && (
                        <p className="text-xs text-destructive">{formState.message}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setShowNotifyInput(false)}>Cancel</Button>
                    <SubmitButton />
                  </CardFooter>
                </form>
              </Card>
            )}
          </aside>
        </div>
      </Card>
    </div>
  );
}

function WebinarDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-8 w-40 mb-6" /> 
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <Skeleton className="h-64 md:h-96 w-full" /> 
        <div className="grid md:grid-cols-3 gap-0">
          <div className="md:col-span-2 p-6 md:p-8 space-y-6">
            <Skeleton className="h-8 w-3/4 mb-4" /> 
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <section className="space-y-2">
              <Skeleton className="h-6 w-1/3 mb-1" /> 
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </section>
            <section className="space-y-2">
              <Skeleton className="h-6 w-1/3 mb-1" /> 
              <Skeleton className="h-8 w-24 rounded-full" />
            </section>
            <Skeleton className="h-16 w-full" /> 
          </div>
          <aside className="md:col-span-1 p-6 md:p-8 bg-muted/30 md:border-l space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <Skeleton className="h-7 w-1/2" /> 
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <Skeleton className="h-12 w-full text-lg py-6" /> 
                <Skeleton className="h-10 w-full" /> 
              </CardFooter>
            </Card>
          </aside>
        </div>
      </Card>
    </div>
  );
}
