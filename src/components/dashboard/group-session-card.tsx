
import type { GroupSession } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Users, CalendarDays, Tag, Users2, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


interface GroupSessionCardProps {
  session: GroupSession;
}

export function GroupSessionCard({ session }: GroupSessionCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
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
      <CardHeader className="px-2.5 pt-2 pb-0">
        <CardTitle className="text-xs font-semibold text-primary line-clamp-1">{session.title}</CardTitle>
        <CardDescription className="text-[11px] text-muted-foreground pt-0.5 flex items-center">
          <Users className="h-2.5 w-2.5 mr-1" /> Hosted by {session.hostName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-1 px-2.5 pb-2 pt-1 text-[11px]">
        <p className="text-muted-foreground line-clamp-1 text-[11px]">{session.description}</p>
        <div className="flex items-center text-[11px] text-muted-foreground">
          <CalendarDays className="h-2.5 w-2.5 mr-1 text-accent" /> {session.date}
        </div>
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5 pt-0.5">
            {session.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] bg-accent/10 text-accent-foreground border-accent/30 px-1 py-0">
                <Tag className="h-2 w-2 mr-0.5" />{tag}
              </Badge>
            ))}
          </div>
        )}
         <div className="flex justify-between items-center text-[11px] pt-0.5">
            {session.maxParticipants !== undefined && (
                <span className="flex items-center text-muted-foreground">
                    <Users2 className="h-2.5 w-2.5 mr-1 text-accent" />
                    {session.participantCount || 0} / {session.maxParticipants} spots
                </span>
            )}
            {session.price && (
                <span className="flex items-center font-semibold text-primary text-xs">
                    <DollarSign className="h-2.5 w-2.5 mr-0.5 text-accent" /> {session.price}
                </span>
            )}
        </div>
      </CardContent>
      <CardFooter className="px-2.5 py-2 mt-auto">
        <Button asChild size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-7 text-[11px] leading-tight">
          <Link href={`/dashboard/sessions/${session.id}`}>
            <span>Learn More & Join</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function GroupSessionCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-md flex flex-col">
      <Skeleton className="relative aspect-[16/9] w-full" />
      <CardHeader className="px-2.5 pt-2 pb-0">
        <Skeleton className="h-3.5 w-3/4 mb-0.5" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-1 px-2.5 pb-2 pt-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex flex-wrap gap-0.5 pt-0.5">
            <Skeleton className="h-3 w-8 rounded-full" />
            <Skeleton className="h-3 w-12 rounded-full" />
        </div>
         <div className="flex justify-between items-center text-xs pt-0.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
        </div>
      </CardContent>
      <CardFooter className="px-2.5 py-2 mt-auto">
        <Skeleton className="h-7 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
