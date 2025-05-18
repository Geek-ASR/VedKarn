
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import type { Webinar } from "@/lib/types";
import { WebinarCard, WebinarCardSkeleton } from "@/components/dashboard/webinar-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tv2, SearchX, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function BrowseWebinarsPage() {
  const { getAllWebinars } = useAuth();
  const [allWebinars, setAllWebinars] = useState<Webinar[]>([]);
  const [filteredWebinars, setFilteredWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    getAllWebinars()
      .then((webinars) => {
        setAllWebinars(webinars);
        setFilteredWebinars(webinars);
      })
      .finally(() => setIsLoading(false));
  }, [getAllWebinars]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allWebinars.filter(webinar =>
      webinar.title.toLowerCase().includes(lowerSearchTerm) ||
      webinar.description.toLowerCase().includes(lowerSearchTerm) ||
      webinar.speakerName.toLowerCase().includes(lowerSearchTerm) ||
      webinar.topic.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredWebinars(filtered);
  }, [searchTerm, allWebinars]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary flex items-center">
          <Tv2 className="mr-3 h-8 w-8 text-accent" /> Browse Webinars
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Explore insightful webinars hosted by experienced professionals.
        </p>
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search webinars by title, speaker, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <WebinarCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {!isLoading && filteredWebinars.length === 0 && (
        <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
                 <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
                 <CardTitle className="text-xl text-muted-foreground">
                    {searchTerm ? "No Webinars Match Your Search" : "No Webinars Available"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                     {searchTerm 
                        ? "Try a different search term or clear your search to see all webinars." 
                        : "There are currently no webinars scheduled. Please check back soon!"
                    }
                </p>
                 {searchTerm && (
                     <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
                 )}
            </CardContent>
        </Card>
      )}

      {!isLoading && filteredWebinars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredWebinars.map((webinar) => (
            <WebinarCard key={webinar.id} webinar={webinar} />
          ))}
        </div>
      )}
    </div>
  );
}
