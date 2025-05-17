
import type { GroupSession } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Users, CalendarDays, Tag, Users2, DollarSign, Clock } from "lucide-react";

interface GroupSessionCardProps {
  session: GroupSession;
}

export function GroupSessionCard({ session }: GroupSessionCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {session.imageUrl && (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={session.imageUrl}
            alt={session.title}
            fill
            className="object-cover"
            data-ai-hint="group learning collaboration"
          />
        </div>
      )}
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg font-semibold text-primary line-clamp-2">{session.title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
          <Users className="h-3 w-3 mr-1.5" /> Hosted by {session.hostName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <p className="text-muted-foreground line-clamp-3 text-xs">{session.description}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 mr-1.5 text-accent" /> {session.date}
        </div>
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {session.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/30 px-1.5 py-0.5">
                <Tag className="h-2.5 w-2.5 mr-1" />{tag}
              </Badge>
            ))}
          </div>
        )}
         <div className="flex justify-between items-center text-xs pt-1">
            {session.maxParticipants && (
                <span className="flex items-center text-muted-foreground">
                    <Users2 className="h-3 w-3 mr-1 text-accent" /> 
                    {session.participantCount || 0} / {session.maxParticipants} spots
                </span>
            )}
            {session.price && (
                <span className="flex items-center font-semibold text-primary">
                    <DollarSign className="h-3 w-3 mr-0.5 text-accent" /> {session.price}
                </span>
            )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button asChild size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/dashboard/sessions/${session.id}`}>Learn More & Join</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function GroupSessionCardSkeleton() {
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
        <div className="flex flex-wrap gap-1 pt-1">
            <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}
