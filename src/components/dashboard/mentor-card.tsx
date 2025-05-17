
import type { MentorProfile } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/core/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Building, GraduationCap, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MentorCardProps {
  mentor: MentorProfile;
  relevanceScore?: number; // For AI suggestions
  reason?: string; // For AI suggestions
}

export function MentorCard({ mentor, relevanceScore, reason }: MentorCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-5">
        <div className="flex items-start space-x-4">
          <UserAvatar user={mentor} className="h-20 w-20 border-2 border-background shadow-md" />
          <div className="flex-1">
            <CardTitle className="text-xl text-primary">{mentor.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {mentor.companies?.[0]?.roleOrDegree || mentor.universities?.[0]?.roleOrDegree || 'Experienced Professional'}
            </CardDescription>
             {mentor.yearsOfExperience !== undefined && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {mentor.yearsOfExperience} YOE
              </Badge>
            )}
          </div>
        </div>
         {relevanceScore !== undefined && (
            <div className="mt-2 flex items-center text-xs text-amber-700 bg-amber-100 p-1.5 rounded-md">
                <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500" />
                <span>Relevance: {Math.round(relevanceScore * 100)}%</span>
            </div>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-3 flex-grow">
        {reason && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md mb-3">
                <p className="text-xs text-blue-700 font-semibold">AI Suggestion:</p>
                <p className="text-xs text-blue-600 line-clamp-2">{reason}</p>
            </div>
        )}
        <p className="text-sm text-foreground line-clamp-3 leading-relaxed">{mentor.bio || "No bio available."}</p>
        
        {mentor.expertise && mentor.expertise.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Expertise</h4>
            <div className="flex flex-wrap gap-1">
              {mentor.expertise.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/30">{skill}</Badge>
              ))}
              {mentor.expertise.length > 3 && <Badge variant="outline" className="text-xs">+{mentor.expertise.length - 3} more</Badge>}
            </div>
          </div>
        )}

        {mentor.companies && mentor.companies.length > 0 && (
           <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center"><Briefcase className="h-3 w-3 mr-1.5" /> Companies</h4>
            <p className="text-xs text-foreground line-clamp-1">
              {mentor.companies.map(c => `${c.roleOrDegree} at ${c.institutionName}`).slice(0,2).join(' | ')}
            </p>
          </div>
        )}
         {mentor.universities && mentor.universities.length > 0 && (
           <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center"><GraduationCap className="h-3 w-3 mr-1.5" /> Education</h4>
            <p className="text-xs text-foreground line-clamp-1">
              {mentor.universities.map(u => `${u.roleOrDegree} at ${u.institutionName}`).slice(0,1).join('')}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 sm:p-5 bg-muted/30 border-t mt-auto">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
          <Link href={`/dashboard/mentors/view/${mentor.id}`}>View Profile & Book</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function MentorCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-5">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-20 w-20 rounded-full border-2 border-background shadow-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-3 flex-grow">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div>
          <Skeleton className="h-3 w-1/4 mb-1.5" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-5 bg-muted/30 border-t mt-auto">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
