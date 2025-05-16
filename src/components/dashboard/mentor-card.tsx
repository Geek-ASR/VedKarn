import type { MentorProfile } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/core/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Building, GraduationCap, Star, Users } from "lucide-react";

interface MentorCardProps {
  mentor: MentorProfile;
  relevanceScore?: number; // For AI suggestions
  reason?: string; // For AI suggestions
}

export function MentorCard({ mentor, relevanceScore, reason }: MentorCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
        <div className="flex items-start space-x-4">
          <UserAvatar user={mentor} className="h-20 w-20 border-2 border-background shadow-md" />
          <div className="flex-1">
            <CardTitle className="text-2xl text-primary">{mentor.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {mentor.companies?.[0]?.roleOrDegree || mentor.universities?.[0]?.roleOrDegree || 'Experienced Professional'}
            </CardDescription>
             {mentor.yearsOfExperience !== undefined && (
              <Badge variant="secondary" className="mt-1">
                {mentor.yearsOfExperience} YOE
              </Badge>
            )}
          </div>
        </div>
         {relevanceScore !== undefined && (
            <div className="mt-2 flex items-center text-xs text-amber-600 bg-amber-100 p-1.5 rounded">
                <Star className="h-4 w-4 mr-1 fill-current" />
                <span>Relevance: {Math.round(relevanceScore * 100)}%</span>
            </div>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-4 flex-grow">
        {reason && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 font-semibold">AI Suggestion Reason:</p>
                <p className="text-xs text-blue-600">{reason}</p>
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
            <p className="text-xs text-foreground">
              {mentor.companies.map(c => `${c.roleOrDegree} at ${c.institutionName}`).slice(0,2).join(' | ')}
            </p>
          </div>
        )}
         {mentor.universities && mentor.universities.length > 0 && (
           <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center"><GraduationCap className="h-3 w-3 mr-1.5" /> Education</h4>
            <p className="text-xs text-foreground">
              {mentor.universities.map(u => `${u.roleOrDegree} at ${u.institutionName}`).slice(0,1).join('')}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-muted/30 border-t">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {/* In a real app, this would link to a mentor's detailed profile page /mentor/[id] */}
          <Link href={`/dashboard/mentors/view/${mentor.id}`}>View Profile & Book</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}