
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Filter, Search, X, Briefcase, GraduationCap } from "lucide-react";
import type { MentorSearchFilters, MentorshipFocusType } from "@/lib/types";
import { useForm, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MentorSearchFiltersProps {
  onSearch: (filters: MentorSearchFilters) => void;
  initialFilters?: MentorSearchFilters;
}

export function MentorSearchFiltersComponent({ onSearch, initialFilters }: MentorSearchFiltersProps) {
  const { control, register, handleSubmit, reset, watch, setValue } = useForm<MentorSearchFilters>({
    defaultValues: initialFilters || { query: "", university: "", jobRole: "", company: "", mentorshipFocus: undefined },
  });

  const onSubmit = (data: MentorSearchFilters) => {
    // Ensure the form's undefined mentorshipFocus translates correctly to the search function
    const filtersToSubmit = {
      ...data,
      mentorshipFocus: data.mentorshipFocus || undefined, // If empty string or null from form, make it undefined
    };
    onSearch(filtersToSubmit);
  };
  
  const handleReset = () => {
    reset({ query: "", university: "", jobRole: "", company: "", mentorshipFocus: undefined });
    onSearch({}); // Trigger search with empty filters
  };

  const activeFilters = watch();
  const hasActiveFilters = Object.values(activeFilters).some(value => !!value && value !== "");


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
            <div>
                <Label htmlFor="mentorshipFocus" className="text-sm font-medium">Mentorship Focus</Label>
                <Controller
                    name="mentorshipFocus"
                    control={control}
                    render={({ field }) => (
                        <Select 
                            onValueChange={(value) => field.onChange(value as MentorshipFocusType | undefined)} 
                            value={field.value || ""} // Empty string will show placeholder
                        >
                            <SelectTrigger id="mentorshipFocus">
                                <SelectValue placeholder="All Focus Areas" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Item for "All Focus Areas" is removed. Placeholder handles this. */}
                                <SelectItem value="career">
                                    <div className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground"/> Career Advice</div>
                                </SelectItem>
                                <SelectItem value="university">
                                    <div className="flex items-center"><GraduationCap className="mr-2 h-4 w-4 text-muted-foreground"/> University Guidance</div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            <div className="flex justify-end space-x-2">
                 <Button type="button" variant="ghost" size="sm" onClick={handleReset} className={!hasActiveFilters ? 'hidden' : ''}>
                    <X className="mr-1 h-3 w-3" /> Clear All Filters
                </Button>
                {/* Apply Filters button is now part of the main form submission within Popover, 
                    so an explicit "Apply Filters" button here can be removed if main form submit is preferred. 
                    If not, this button in PopoverContent should also trigger form submit.
                    For simplicity, user will click outside or the main Search button.
                */}
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
