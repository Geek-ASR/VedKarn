
import type { GroupSession } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Users, CalendarDays, Tag, Users2, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


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
      <CardHeader className="px-3 pt-2.5 pb-0.5"> {/* Reduced padding */}
        <CardTitle className="text-sm font-semibold text-primary line-clamp-1">{session.title}</CardTitle> {/* line-clamp-1 */}
        <CardDescription className="text-xs text-muted-foreground pt-0.5 flex items-center">
          <Users className="h-3 w-3 mr-1" /> Hosted by {session.hostName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-1 px-3 pb-2.5 pt-1.5 text-xs"> {/* Reduced padding & spacing */}
        <p className="text-muted-foreground line-clamp-2 text-xs">{session.description}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 mr-1 text-accent" /> {session.date}
        </div>
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {session.tags.slice(0, 2).map((tag) => ( 
              <Badge key={tag} variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/30 px-1.5 py-0.5">
                <Tag className="h-2.5 w-2.5 mr-0.5" />{tag}
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
      <CardFooter className="px-3 pt-2 pb-2.5 mt-auto"> {/* Reduced padding */}
        <Button asChild size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-8 text-xs"> {/* Smaller button */}
          <Link href={`/dashboard/sessions/${session.id}`}>Learn More & Join</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function GroupSessionCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col h-full">
      <Skeleton className="relative aspect-[16/9] w-full" />
      <CardHeader className="px-3 pt-2.5 pb-0.5">
        <Skeleton className="h-4 w-3/4 mb-0.5" /> {/* Reduced height */}
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-1 px-3 pb-2.5 pt-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex flex-wrap gap-1 pt-0.5">
            <Skeleton className="h-3.5 w-10 rounded-full" /> {/* Reduced height */}
            <Skeleton className="h-3.5 w-14 rounded-full" /> {/* Reduced height */}
        </div>
      </CardContent>
      <CardFooter className="px-3 pt-2 pb-2.5 mt-auto">
        <Skeleton className="h-8 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}

    