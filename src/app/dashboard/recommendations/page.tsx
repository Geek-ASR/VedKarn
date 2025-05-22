
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MentorCard } from "@/components/dashboard/mentor-card";
import type { MentorProfile, MenteeProfile } from "@/lib/types"; // Added MenteeProfile
import { getMockMentorProfiles, getMentorByProfileString, useAuth } from "@/context/auth-context";
import { suggestMentors, type SuggestMentorsOutput, type SuggestMentorsInput } from "@/ai/flows/suggest-mentors";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Frown, Lightbulb, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


// Define the explicit type for suggested mentor profiles with AI details
type SuggestedMentorProfileWithDetails = MentorProfile & {
  relevanceScore: number;
  reason: string;
};

export default function AiRecommendationsPage() {
  const { user: menteeUser } = useAuth();

  const menteeProfileForAI = useMemo(() => {
    if (!menteeUser || menteeUser.role !== 'mentee') return "Generic student interested in learning.";
    const mentee = menteeUser as MenteeProfile; // Cast to MenteeProfile
    // Construct a detailed profile string for the AI
    let profileString = `Name: ${mentee.name}`;
    profileString += `, Bio: ${mentee.bio || 'N/A'}`;
    profileString += `, Interests: ${mentee.interests?.join(', ') || 'N/A'}`;
    profileString += `, Learning Goals: ${mentee.learningGoals || 'N/A'}`;
    profileString += `, Seeking Mentorship For: ${mentee.seekingMentorshipFor?.join(', ') || 'General Advice'}`;
    if (mentee.seekingMentorshipFor?.includes('university')) {
        profileString += `, Current Education Level: ${mentee.currentEducationLevel || 'N/A'}`;
        profileString += `, Target Degree Level: ${mentee.targetDegreeLevel || 'N/A'}`;
        profileString += `, Target Fields of Study: ${mentee.targetFieldsOfStudy?.join(', ') || 'N/A'}`;
        profileString += `, Desired Universities: ${mentee.desiredUniversities?.join(', ') || 'N/A'}`;
    }
    if (mentee.seekingMentorshipFor?.includes('career')) {
        profileString += `, Desired Job Roles: ${mentee.desiredJobRoles?.join(', ') || 'N/A'}`;
        profileString += `, Desired Companies: ${mentee.desiredCompanies?.join(', ') || 'N/A'}`;
    }
    return profileString;
  }, [menteeUser]);

  const { data: suggestedMentorsData, isLoading: isLoadingSuggestions, error: suggestionsError } = useQuery<SuggestMentorsOutput, Error>({
    queryKey: ['allSuggestedMentors', menteeUser?.id, menteeProfileForAI], // Include menteeProfileForAI in queryKey
    queryFn: async () => {
      if (!menteeUser || menteeUser.role !== 'mentee') return [];
      const input: SuggestMentorsInput = {
        menteeProfile: menteeProfileForAI,
        mentorProfiles: getMockMentorProfiles(), 
      };
      return suggestMentors(input);
    },
    enabled: !!menteeUser && menteeUser.role === 'mentee',
  });

  const suggestedMentorProfiles = useMemo((): SuggestedMentorProfileWithDetails[] => {
    if (!suggestedMentorsData) return [];

    const profilesWithDetails = suggestedMentorsData
      .map(suggestion => {
        const mentor = getMentorByProfileString(suggestion.mentorProfile);
        if (mentor) {
          const profileWithDetails: SuggestedMentorProfileWithDetails = {
            ...mentor,
            relevanceScore: suggestion.relevanceScore,
            reason: suggestion.reason
          };
          return profileWithDetails;
        }
        return null;
      })
      .filter((profile): profile is SuggestedMentorProfileWithDetails => Boolean(profile))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return profilesWithDetails;
  }, [suggestedMentorsData]);

  if (menteeUser?.role !== 'mentee') {
    return (
      <Alert variant="destructive">
        <Frown className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>This page is for mentees only.</AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center">
          <Brain className="mr-3 h-10 w-10 text-accent" /> AI Mentor Recommendations
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Discover mentors perfectly matched to your profile, interests, and goals, powered by our smart suggestion engine.
        </p>
      </div>
      
      <Alert className="bg-primary/5 border-primary/20 text-primary">
        <Lightbulb className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold">How it Works</AlertTitle>
        <AlertDescription>
          Our AI analyzes your profile and compares it against potential mentors to find the best fits. The more complete your profile, the better the recommendations! 
          <Button variant="link" asChild className="p-0 h-auto ml-1 text-primary"><Link href="/dashboard/profile">Complete Your Profile</Link></Button>
        </AlertDescription>
      </Alert>

      {isLoadingSuggestions && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <MentorCardSkeleton key={`skeleton-${i}`} />)}
        </div>
      )}

      {suggestionsError && (
        <Alert variant="destructive">
          <Frown className="h-4 w-4" />
          <AlertTitle>Error Fetching Suggestions</AlertTitle>
          <AlertDescription>{suggestionsError.message}</AlertDescription>
        </Alert>
      )}

      {!isLoadingSuggestions && !suggestionsError && suggestedMentorProfiles && suggestedMentorProfiles.length === 0 && (
         <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
                 <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
                 <CardTitle className="text-xl text-muted-foreground">No Specific Suggestions Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                 We couldn't find highly specific matches right now. Ensure your profile is detailed for better suggestions.
                </p>
                <div className="flex gap-2 justify-center">
                    <Button asChild><Link href="/dashboard/profile">Update Profile</Link></Button>
                    <Button variant="outline" asChild><Link href="/dashboard/mentors">Browse All Mentors</Link></Button>
                </div>
            </CardContent>
        </Card>
      )}

      {!isLoadingSuggestions && !suggestionsError && suggestedMentorProfiles && suggestedMentorProfiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedMentorProfiles.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} relevanceScore={mentor.relevanceScore} reason={mentor.reason} />
          ))}
        </div>
      )}
    </div>
  );
}

function MentorCardSkeleton() {
  return (
    <div className="bg-card p-6 rounded-lg shadow space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <Skeleton className="h-10 w-full rounded-md mt-4" />
    </div>
  );
}

