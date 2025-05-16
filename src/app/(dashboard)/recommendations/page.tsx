"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MentorCard } from "@/components/dashboard/mentor-card";
import type { MentorProfile } from "@/lib/types";
import { getMockMentorProfiles, getMentorByProfileString, useAuth } from "@/context/auth-context";
import { suggestMentors, type SuggestMentorsOutput, type SuggestMentorsInput } from "@/ai/flows/suggest-mentors";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Frown, Lightbulb } from "lucide-react";

// Re-using MOCK_MENTORS_DB logic for consistency
const MOCK_MENTORS_DB: MentorProfile[] = Object.values(getMockMentorProfiles())
  .map(profileString => getMentorByProfileString(profileString))
  .filter(Boolean) as MentorProfile[];

export default function AiRecommendationsPage() {
  const { user: menteeUser } = useAuth();

  const menteeProfileForAI = useMemo(() => {
    if (!menteeUser || menteeUser.role !== 'mentee') return "Generic student interested in learning.";
    const mentee = menteeUser;
    // Construct a detailed profile string for the AI
    return `Name: ${mentee.name}, Bio: ${mentee.bio || 'N/A'}, Learning Goals: ${mentee.learningGoals || 'N/A'}, Desired Universities: ${mentee.desiredUniversities?.join(', ') || 'N/A'}, Desired Job Roles: ${mentee.desiredJobRoles?.join(', ') || 'N/A'}, Desired Companies: ${mentee.desiredCompanies?.join(', ') || 'N/A'}, Interests: ${mentee.interests?.join(', ') || 'N/A'}`;
  }, [menteeUser]);

  const { data: suggestedMentorsData, isLoading: isLoadingSuggestions, error: suggestionsError } = useQuery<SuggestMentorsOutput, Error>({
    queryKey: ['allSuggestedMentors', menteeUser?.id], // Unique key for this page
    queryFn: async () => {
      if (!menteeUser || menteeUser.role !== 'mentee') return [];
      const input: SuggestMentorsInput = {
        menteeProfile: menteeProfileForAI,
        mentorProfiles: getMockMentorProfiles(), // Provide all mentor profiles for evaluation
      };
      return suggestMentors(input);
    },
    enabled: !!menteeUser && menteeUser.role === 'mentee',
  });

  const suggestedMentorProfiles = useMemo(() => {
    if (!suggestedMentorsData) return [];
    return suggestedMentorsData
      .map(suggestion => {
        const mentor = getMentorByProfileString(suggestion.mentorProfile); // Match AI output to your MentorProfile objects
        if (mentor) {
          return { ...mentor, relevanceScore: suggestion.relevanceScore, reason: suggestion.reason };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0)) // Sort by relevance
      as (MentorProfile & { relevanceScore: number; reason: string })[];
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
        </AlertDescription>
      </Alert>

      {isLoadingSuggestions && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <MentorCardSkeleton key={i} />)}
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
        <Alert>
          <Frown className="h-4 w-4" />
          <AlertTitle>No Specific Suggestions Yet</AlertTitle>
          <AlertDescription>
            We couldn't find highly specific matches right now. Make sure your profile is complete and detailed. In the meantime, you can browse all mentors.
          </AlertDescription>
        </Alert>
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

function MentorCardSkeleton() { // Copied from mentors/page.tsx for consistency
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