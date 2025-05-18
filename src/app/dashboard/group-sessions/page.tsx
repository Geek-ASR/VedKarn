
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import type { GroupSession } from "@/lib/types";
import { GroupSessionCard, GroupSessionCardSkeleton } from "@/components/dashboard/group-session-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Users, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BrowseGroupSessionsPage() {
  const { getAllGroupSessions } = useAuth();
  const [allSessions, setAllSessions] = useState<GroupSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<GroupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    getAllGroupSessions()
      .then((sessions) => {
        setAllSessions(sessions);
        setFilteredSessions(sessions);
      })
      .finally(() => setIsLoading(false));
  }, [getAllGroupSessions]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allSessions.filter(session => 
      session.title.toLowerCase().includes(lowerSearchTerm) ||
      session.description.toLowerCase().includes(lowerSearchTerm) ||
      session.hostName.toLowerCase().includes(lowerSearchTerm) ||
      session.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredSessions(filtered);
  }, [searchTerm, allSessions]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Browse Group Sessions</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Discover and join engaging group sessions led by experienced mentors.
        </p>
      </div>

      <div className="mb-6">
        <Input 
          type="search"
          placeholder="Search sessions by title, host, topic, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <GroupSessionCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {!isLoading && filteredSessions.length === 0 && (
        <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
                 <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
                 <CardTitle className="text-xl text-muted-foreground">No Group Sessions Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm ? "No sessions match your search criteria." : "There are currently no group sessions available. Check back soon!"}
                </p>
            </CardContent>
        </Card>
      )}

      {!isLoading && filteredSessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredSessions.map((session) => (
            <GroupSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

// Minimal Card components for empty state to avoid circular dependencies or large imports
const Card = ({className, children}: {className?: string, children: React.ReactNode}) => <div className={`bg-card p-6 rounded-lg shadow ${className}`}>{children}</div>;
const CardHeader = ({children}: {children: React.ReactNode}) => <div className="mb-2">{children}</div>;
const CardTitle = ({className, children}: {className?: string, children: React.ReactNode}) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;
const CardContent = ({children}: {children: React.ReactNode}) => <div>{children}</div>;
