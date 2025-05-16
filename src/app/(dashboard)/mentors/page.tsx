"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MentorCard } from "@/components/dashboard/mentor-card";
import { MentorSearchFiltersComponent } from "@/components/dashboard/mentor-search-filters";
import type { MentorProfile, MentorSearchFilters } from "@/lib/types";
import { getMockMentorProfiles, getMentorByProfileString, useAuth } from "@/context/auth-context";
import { suggestMentors, type SuggestMentorsOutput, type SuggestMentorsInput } from "@/ai/flows/suggest-mentors";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Frown } from "lucide-react";

const MOCK_MENTORS_DB: MentorProfile[] = Object.values(getMockMentorProfiles())
  .map(profileString => getMentorByProfileString(profileString))
  .filter(Boolean) as MentorProfile[];


// Mock API call to fetch mentors
async function fetchMentors(filters: MentorSearchFilters): Promise<MentorProfile[]> {
  console.log("Fetching mentors with filters:", filters);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  return MOCK_MENTORS_DB.filter(mentor => {
    const queryMatch = filters.query
      ? mentor.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(filters.query.toLowerCase()) ||
        mentor.expertise?.some(e => e.toLowerCase().includes(filters.query!.toLowerCase()))
      : true;
    const universityMatch = filters.university
      ? mentor.universities?.some(u => u.institutionName.toLowerCase().includes(filters.university!.toLowerCase()))
      : true;
    const jobRoleMatch = filters.jobRole
      ? mentor.companies?.some(c => c.roleOrDegree.toLowerCase().includes(filters.jobRole!.toLowerCase())) ||
        mentor.expertise?.some(e => e.toLowerCase().includes(filters.jobRole!.toLowerCase()))
      : true;
    const companyMatch = filters.company
      ? mentor.companies?.some(c => c.institutionName.toLowerCase().includes(filters.company!.toLowerCase()))
      : true;
    return queryMatch && universityMatch && jobRoleMatch && companyMatch;
  });
}


export default function MentorDiscoveryPage() {
  const { user: menteeUser } = useAuth();
  const [filters, setFilters] = useState<MentorSearchFilters>({});
  
  const { data: mentors, isLoading, error } = useQuery<MentorProfile[], Error>({
    queryKey: ['mentors', filters],
    queryFn: () => fetchMentors(filters),
  });

  const menteeProfileForAI = useMemo(() => {
    if (!menteeUser || menteeUser.role !== 'mentee') return "Generic student interested in learning.";
    const mentee = menteeUser;
    return `Name: ${mentee.name}, Bio: ${mentee.bio}, Learning Goals: ${mentee.learningGoals}, Desired Universities: ${mentee.desiredUniversities?.join(', ')}, Desired Job Roles: ${mentee.desiredJobRoles?.join(', ')}, Desired Companies: ${mentee.desiredCompanies?.join(', ')}`;
  }, [menteeUser]);

  const { data: suggestedMentorsData, isLoading: isLoadingSuggestions } = useQuery<SuggestMentorsOutput, Error>({
    queryKey: ['suggestedMentors', menteeUser?.id],
    queryFn: async () => {
      if (!menteeUser || menteeUser.role !== 'mentee') return [];
      const input: SuggestMentorsInput = {
        menteeProfile: menteeProfileForAI,
        mentorProfiles: getMockMentorProfiles(), // Fetch all mentor profiles for AI to evaluate
      };
      return suggestMentors(input);
    },
    enabled: !!menteeUser && menteeUser.role === 'mentee', // Only run if user is a mentee
  });

  const handleSearch = (newFilters: MentorSearchFilters) => {
    setFilters(newFilters);
  };

  const suggestedMentorProfiles = useMemo(() => {
    if (!suggestedMentorsData) return [];
    return suggestedMentorsData
      .map(suggestion => {
        const mentor = getMentorByProfileString(suggestion.mentorProfile);
        if (mentor) {
          return { ...mentor, relevanceScore: suggestion.relevanceScore, reason: suggestion.reason };
        }
        return null;
      })
      .filter(Boolean) as (MentorProfile & { relevanceScore: number; reason: string })[];
  }, [suggestedMentorsData]);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Find Your Mentor</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Connect with experienced professionals to guide your academic and career journey.
        </p>
      </div>

      <MentorSearchFiltersComponent onSearch={handleSearch} initialFilters={filters} />
      
      {/* AI Suggested Mentors Section - only shows on the mentors/ page if not explicitly filtered */}
      {!Object.values(filters).some(f => f) && suggestedMentorProfiles && suggestedMentorProfiles.length > 0 && (
        <section className="space-y-4 p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-primary">AI Recommended Mentors</h2>
          </div>
           <p className="text-sm text-muted-foreground">Based on your profile, we think these mentors could be a great fit for you.</p>
          {isLoadingSuggestions && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <MentorCardSkeleton key={i} />)}
            </div>
          )}
          {!isLoadingSuggestions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedMentorProfiles.slice(0,3).map((mentor) => ( // Show top 3 suggestions
                <MentorCard key={mentor.id} mentor={mentor} relevanceScore={mentor.relevanceScore} reason={mentor.reason} />
              ))}
            </div>
          )}
        </section>
      )}


      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {Object.values(filters).some(f => f) ? 'Search Results' : 'All Mentors'}
        </h2>
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <MentorCardSkeleton key={i} />)}
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <Frown className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Could not load mentors: {error.message}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && mentors && mentors.length === 0 && (
          <Alert>
            <Frown className="h-4 w-4" />
            <AlertTitle>No Mentors Found</AlertTitle>
            <AlertDescription>Try adjusting your search filters or check back later.</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && mentors && mentors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </section>
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