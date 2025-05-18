"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import type { Webinar } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Edit, CalendarDays, Users, DollarSign, Tag, ExternalLink, Info, Frown, Tv2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function MyWebinarsPage() {
  const { user, getWebinarsByMentor, deleteMentorWebinar, webinarsVersion } = useAuth();
  const { toast } = useToast();
  const [myWebinars, setMyWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'mentor') {
      setIsLoading(true);
      getWebinarsByMentor(user.id)
        .then(setMyWebinars)
        .finally(() => setIsLoading(false));
    }
  }, [user, getWebinarsByMentor, webinarsVersion]);

  const handleDelete = async (webinarId: string) => {
    if (!user || user.role !== 'mentor') return;
    try {
      await deleteMentorWebinar(webinarId);
      toast({ title: "Success", description: "Webinar deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message || "Failed to delete webinar.", variant: "destructive" });
    }
  };

  if (!user || user.role !== 'mentor') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md">
            <Frown className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>This page is for mentors only.</AlertDescription>
            <Button variant="link" onClick={() => window.history.back()} className="mt-2">Go Back</Button>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent><CardFooter><Skeleton className="h-8 w-full" /></CardFooter></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">My Webinars</h1>
            <p className="text-muted-foreground">Manage and create your webinars.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/dashboard/my-webinars/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Webinar
          </Link>
        </Button>
      </div>

      {myWebinars.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
            <CardHeader>
                 <Tv2 className="mx-auto h-12 w-12 text-muted-foreground" />
                 <CardTitle className="text-xl text-muted-foreground">No Webinars Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    You haven't created any webinars. Click the button above to get started!
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myWebinars.map((webinar) => (
            <Card key={webinar.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {webinar.imageUrl && (
                <div className="relative h-40 w-full">
                  <Image src={webinar.imageUrl} alt={webinar.title} fill className="object-cover" data-ai-hint="webinar presentation" />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary line-clamp-2">{webinar.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground flex items-center pt-1">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5"/> {webinar.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs flex-grow">
                <p className="text-muted-foreground line-clamp-3">{webinar.description}</p>
                <div className="flex items-center text-muted-foreground">
                    <Tag className="h-3.5 w-3.5 mr-1.5 text-accent" /> Topic: <span className="font-medium text-foreground ml-1">{webinar.topic}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-accent" /> Speaker: {webinar.speakerName}
                </div>
                 {webinar.duration && (
                    <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-accent" /> Duration: {webinar.duration}
                    </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-3 mt-auto">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <Edit className="mr-2 h-3.5 w-3.5" /> Edit (Soon)
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your webinar "{webinar.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(webinar.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                 <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
                     <Link href={`/dashboard/webinars/${webinar.id}`} target="_blank">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" /> View
                     </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}