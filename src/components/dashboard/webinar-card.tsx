
import type { Webinar } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Mic, CalendarDays, Tag, Clock, Presentation } from "lucide-react";

interface WebinarCardProps {
  webinar: Webinar;
}

export function WebinarCard({ webinar }: WebinarCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {webinar.imageUrl && (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={webinar.imageUrl}
            alt={webinar.title}
            fill
            className="object-cover"
            data-ai-hint="presentation online learning"
          />
        </div>
      )}
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg font-semibold text-primary line-clamp-2">{webinar.title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
          <Mic className="h-3 w-3 mr-1.5" /> By {webinar.speakerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <p className="text-muted-foreground line-clamp-3 text-xs">{webinar.description}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 mr-1.5 text-accent" /> {webinar.date}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Presentation className="h-3 w-3 mr-1.5 text-accent" /> Topic: {webinar.topic}
        </div>
        {webinar.duration && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1.5 text-accent" /> Duration: {webinar.duration}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button asChild size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/dashboard/webinars/${webinar.id}`}>View Details & Register</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function WebinarCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col h-full">
      <div className="relative aspect-[16/9] w-full bg-muted animate-pulse"></div>
      <CardHeader className="pt-4 pb-2">
        <div className="h-5 bg-muted rounded w-3/4 animate-pulse mb-1"></div>
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
        <div className="h-3 bg-muted rounded w-5/6 animate-pulse"></div>
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}
