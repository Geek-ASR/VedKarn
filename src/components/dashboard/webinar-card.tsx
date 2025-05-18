
import type { Webinar } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge"; // No explicit badge usage in current design
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Mic, CalendarDays, Presentation, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <CardHeader className="px-3 pt-2.5 pb-0.5">
        <CardTitle className="text-sm font-semibold text-primary line-clamp-1">{webinar.title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-0.5 flex items-center">
          <Mic className="h-3 w-3 mr-1" /> By {webinar.speakerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-1 px-3 pb-2.5 pt-1.5 text-xs">
        <p className="text-muted-foreground line-clamp-2 text-xs">{webinar.description}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 mr-1 text-accent" /> {webinar.date}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Presentation className="h-3 w-3 mr-1 text-accent" /> Topic: {webinar.topic}
        </div>
        {webinar.duration && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1 text-accent" /> Duration: {webinar.duration}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-3 pt-2 pb-2.5 mt-auto">
        <Link href={`/dashboard/webinars/${webinar.id}`} asChild>
          <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-8 text-xs">
            View Details & Register
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function WebinarCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col h-full">
      <Skeleton className="relative aspect-[16/9] w-full" />
      <CardHeader className="px-3 pt-2.5 pb-0.5">
        <Skeleton className="h-4 w-3/4 mb-0.5" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-1 px-3 pb-2.5 pt-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
      <CardFooter className="px-3 pt-2 pb-2.5 mt-auto">
        <Skeleton className="h-8 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
