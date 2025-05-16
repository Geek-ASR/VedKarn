"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Filter, Search, X } from "lucide-react";
import type { MentorSearchFilters } from "@/lib/types";
import { useForm } from "react-hook-form";

interface MentorSearchFiltersProps {
  onSearch: (filters: MentorSearchFilters) => void;
  initialFilters?: MentorSearchFilters;
}

export function MentorSearchFiltersComponent({ onSearch, initialFilters }: MentorSearchFiltersProps) {
  const { register, handleSubmit, reset, watch } = useForm<MentorSearchFilters>({
    defaultValues: initialFilters || { query: "", university: "", jobRole: "", company: "" },
  });

  const onSubmit = (data: MentorSearchFilters) => {
    onSearch(data);
  };
  
  const handleReset = () => {
    reset({ query: "", university: "", jobRole: "", company: "" });
    onSearch({}); // Trigger search with empty filters
  };

  const hasActiveFilters = Object.values(watch()).some(value => !!value && value !== "");


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-6 bg-card rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow">
          <Label htmlFor="query" className="sr-only">Search Mentors</Label>
          <Input
            id="query"
            placeholder="Search by name, expertise, keywords..."
            {...register("query")}
            className="h-12 text-lg"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" type="button" className="h-12 relative">
              <Filter className="mr-2 h-4 w-4" /> Filters
              {hasActiveFilters && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 space-y-4">
            <div>
              <Label htmlFor="university" className="text-sm font-medium">University</Label>
              <Input id="university" placeholder="e.g., Stanford University" {...register("university")} />
            </div>
            <div>
              <Label htmlFor="jobRole" className="text-sm font-medium">Job Role</Label>
              <Input id="jobRole" placeholder="e.g., Data Scientist" {...register("jobRole")} />
            </div>
            <div>
              <Label htmlFor="company" className="text-sm font-medium">Company</Label>
              <Input id="company" placeholder="e.g., Google" {...register("company")} />
            </div>
            <div className="flex justify-end space-x-2">
                 <Button type="button" variant="ghost" size="sm" onClick={handleReset} className={!hasActiveFilters ? 'hidden' : ''}>
                    <X className="mr-1 h-3 w-3" /> Clear
                </Button>
                <Button type="submit" size="sm">Apply Filters</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button type="submit" className="h-12 bg-primary hover:bg-primary/90">
          <Search className="mr-2 h-5 w-5" /> Search
        </Button>
      </div>
    </form>
  );
}