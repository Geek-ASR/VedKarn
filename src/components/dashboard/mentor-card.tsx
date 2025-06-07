
import type { MentorProfile } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/core/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, GraduationCap, Star, Users, Sparkles } from "lucide-react"; 
import { Skeleton } from "@/components/ui/skeleton";
import { useRef } from "react";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface MentorCardProps {
  mentor: MentorProfile;
  relevanceScore?: number; 
  reason?: string; 
  animationDelay?: string;
}

export function MentorCard({ mentor, relevanceScore, reason, animationDelay }: MentorCardProps) {
  const hasCareerFocus = mentor.mentorshipFocus?.includes('career');
  const hasUniversityFocus = mentor.mentorshipFocus?.includes('university');

  const cardRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(cardRef, { threshold: 0.1, triggerOnce: true });

  return (
    <div ref={cardRef}>
      <Card 
        className={cn(
          "overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-[430px]", // Changed to h-[430px] for consistent height
          isIntersecting ? "animate-fadeInUp" : "opacity-0"
        )}
        style={{ animationDelay: isIntersecting ? animationDelay : undefined }}
      >
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
          <div className="flex items-start space-x-3">
            <UserAvatar user={mentor} className="h-12 w-12 border-2 border-background shadow-md" />
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-primary">{mentor.name}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {mentor.companies?.[0]?.roleOrDegree || mentor.universities?.[0]?.roleOrDegree || 'Experienced Professional'}
              </CardDescription>
              <div className="flex items-center gap-1.5 mt-1">
                  {mentor.yearsOfExperience !== undefined && (
                  <Badge variant="secondary" className="text-xs py-0.5 px-1.5">
                      {mentor.yearsOfExperience} YOE
                  </Badge>
                  )}
                  {hasCareerFocus && <Briefcase className="h-3.5 w-3.5 text-blue-500" title="Career Advice Focus"/>}
                  {hasUniversityFocus && <GraduationCap className="h-3.5 w-3.5 text-green-500" title="University Guidance Focus"/>}
              </div>
            </div>
          </div>
          {relevanceScore !== undefined && (
              <div className="mt-1.5 flex items-center text-xs text-amber-700 bg-amber-100 p-1 rounded-md">
                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                  <span>Relevance: {Math.round(relevanceScore * 100)}%</span>
              </div>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-2 flex-grow">
          {reason && (
              <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-md mb-2">
                  <p className="text-[11px] text-blue-700 font-medium flex items-center"><Sparkles className="h-3 w-3 mr-1 text-blue-500"/>AI Suggestion:</p>
                  <p className="text-[11px] text-blue-600 line-clamp-2">{reason}</p>
              </div>
          )}
          <p className="text-xs text-foreground line-clamp-1 leading-relaxed">
            {mentor.bio || "No bio available."}
          </p>
          
          {mentor.expertise && mentor.expertise.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase text-muted-foreground mb-0.5">Expertise</h4>
              <div className="flex flex-wrap gap-1">
                {mentor.expertise.slice(0, 2).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-[10px] bg-accent/10 text-accent-foreground border-accent/30 px-1.5 py-0.5">{skill}</Badge>
                ))}
                {mentor.expertise.length > 2 && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">+{mentor.expertise.length - 2} more</Badge>}
              </div>
            </div>
          )}


          {hasUniversityFocus && mentor.targetDegreeLevels && mentor.targetDegreeLevels.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase text-muted-foreground mb-0.5 flex items-center"><GraduationCap className="h-3 w-3 mr-1" /> Guides For</h4>
              <p className="text-xs text-foreground line-clamp-1">
                {mentor.targetDegreeLevels.join(', ')}
              </p>
            </div>
          )}

        </CardContent>
        <CardFooter className="p-3 bg-muted/30 border-t mt-auto">
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
            <Link href={`/dashboard/mentors/view/${mentor.id}`}>View Profile & Book</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function MentorCardSkeleton() {
  return (
    <div className="bg-card p-4 sm:p-5 rounded-lg shadow space-y-3 h-[430px] flex flex-col"> {/* Added h-[430px] and flex structure */}
      <div className="flex items-start space-x-3">
        <Skeleton className="h-12 w-12 rounded-full border-2 border-background shadow-md" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" /> 
          <Skeleton className="h-3 w-1/2" /> 
          <Skeleton className="h-3 w-1/4 mt-1" /> 
        </div>
      </div>
      <div className="flex-grow space-y-2"> {/* Made content area grow */}
        <Skeleton className="h-3 w-full" /> 
        <Skeleton className="h-3 w-5/6" /> 
        <div>
          <Skeleton className="h-2.5 w-1/4 mb-1" /> 
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-3 w-10 rounded-full" /> 
            <Skeleton className="h-3 w-14 rounded-full" /> 
          </div>
        </div>
      </div>
       <div className="pt-1 mt-auto"> {/* Footer pushes to bottom */}
        <Skeleton className="h-8 w-full rounded-md" /> 
      </div>
    </div>
  );
}
