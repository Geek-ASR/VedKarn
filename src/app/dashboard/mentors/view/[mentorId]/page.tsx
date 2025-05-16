
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, getMentorByProfileString } from "@/context/auth-context";
import type { MentorProfile, AvailabilitySlot, Booking } from "@/lib/types";
import { UserAvatar } from "@/components/core/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Briefcase, GraduationCap, Star, Clock, CheckCircle, ExternalLink, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// In a real app, this would come from your database/API
const MOCK_MENTORS_DB: MentorProfile[] = Object.values(getMockMentorProfiles())
  .map(profileString => getMentorByProfileString(profileString))
  .filter(Boolean) as MentorProfile[];


export default function MentorProfilePage() {
  const params = useParams();
  const mentorId = params.mentorId as string;
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]); // Local state for bookings

  useEffect(() => {
    if (mentorId) {
      // Simulate API call
      setTimeout(() => {
        const foundMentor = MOCK_MENTORS_DB.find(m => m.id === mentorId);
        setMentor(foundMentor || null);
        setLoading(false);
      }, 500);
    }
  }, [mentorId]);

  const handleBookSession = () => {
    if (!currentUser || currentUser.role !== 'mentee' || !mentor || !selectedSlot) {
      toast({ title: "Booking Error", description: "Cannot complete booking. Please ensure you are logged in as a mentee and have selected a slot.", variant: "destructive" });
      return;
    }
    
    // Mock booking creation
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      mentorId: mentor.id,
      menteeId: currentUser.id,
      slotId: selectedSlot.id,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      status: 'confirmed',
      meetingNotes: `Session with ${mentor.name} for ${currentUser.name}`
    };

    // Update mentor's availability slot (mock)
    const updatedMentor = {
        ...mentor,
        availabilitySlots: mentor.availabilitySlots?.map(slot => 
            slot.id === selectedSlot.id ? { ...slot, isBooked: true, bookedByMenteeId: currentUser.id } : slot
        )
    };
    setMentor(updatedMentor); // Update local mentor state
    // In a real app, update MOCK_MENTORS_DB or backend
    const mentorIndex = MOCK_MENTORS_DB.findIndex(m => m.id === mentor.id);
    if(mentorIndex > -1) MOCK_MENTORS_DB[mentorIndex] = updatedMentor;


    setBookings(prev => [...prev, newBooking]); // Add to local bookings
    setSelectedSlot(null); // Reset selected slot

    toast({
      title: "Session Booked!",
      description: `Your session with ${mentor.name} on ${format(parseISO(selectedSlot.startTime), "PPP 'at' p")} is confirmed. A mock Google Meet link would be generated here.`,
      action: <Button asChild variant="link"><Link href="/dashboard/schedule">View Schedule</Link></Button>,
      duration: 7000,
    });
    // In a real app, call Google Calendar API here
    // For demo: alert("Google Calendar & Meet API would be called here to create event and link.");
  };

  if (loading) {
    return <MentorProfileSkeleton />;
  }

  if (!mentor) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <Frown className="h-4 w-4" />
        <AlertTitle>Mentor Not Found</AlertTitle>
        <AlertDescription>The mentor profile you are looking for does not exist or could not be loaded.</AlertDescription>
        <Button onClick={() => router.back()} variant="link" className="mt-2">Go Back</Button>
      </Alert>
    );
  }
  
  const availableSlotsForDate = mentor.availabilitySlots?.filter(slot => 
    !slot.isBooked && selectedDate && format(parseISO(slot.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ) || [];

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-gradient-to-br from-primary/20 to-accent/20 p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <UserAvatar user={mentor} className="h-32 w-32 text-5xl border-4 border-background shadow-lg" />
            <div className="flex-1">
              <CardTitle className="text-4xl font-bold text-primary mb-1">{mentor.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mb-2">
                {mentor.companies?.[0]?.roleOrDegree || mentor.universities?.[0]?.roleOrDegree || 'Experienced Professional'}
              </CardDescription>
              {mentor.yearsOfExperience !== undefined && (
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Star className="h-4 w-4 mr-1.5 text-amber-500 fill-amber-500" /> {mentor.yearsOfExperience} Years of Experience
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-2">About Me</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{mentor.bio || "No detailed bio provided."}</p>
            </section>

            {mentor.expertise && mentor.expertise.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-2">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="outline" className="py-1 px-3 text-sm bg-accent/10 text-accent-foreground border-accent/30">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}

            {mentor.companies && mentor.companies.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center"><Briefcase className="h-5 w-5 mr-2 text-primary" /> Professional Experience</h3>
                <ul className="space-y-4">
                  {mentor.companies.map(exp => (
                    <li key={exp.id} className="p-4 border rounded-lg bg-card shadow-sm">
                      <h4 className="font-semibold text-md">{exp.roleOrDegree} at {exp.institutionName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(exp.startDate), 'MMM yyyy')} - {exp.endDate ? format(parseISO(exp.endDate), 'MMM yyyy') : 'Present'}
                      </p>
                      {exp.description && <p className="text-sm mt-1 text-foreground/80">{exp.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {mentor.universities && mentor.universities.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center"><GraduationCap className="h-5 w-5 mr-2 text-primary" /> Education</h3>
                 <ul className="space-y-4">
                  {mentor.universities.map(exp => (
                    <li key={exp.id} className="p-4 border rounded-lg bg-card shadow-sm">
                      <h4 className="font-semibold text-md">{exp.roleOrDegree} - {exp.institutionName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(exp.startDate), 'MMM yyyy')} - {exp.endDate ? format(parseISO(exp.endDate), 'MMM yyyy') : 'Graduated'}
                      </p>
                       {exp.description && <p className="text-sm mt-1 text-foreground/80">{exp.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
             <Alert className="bg-blue-50 border-blue-200 text-blue-700">
                <Info className="h-5 w-5 text-blue-500" />
                <AlertTitle className="font-semibold">Note on Scheduling</AlertTitle>
                <AlertDescription>
                    Booking a session will mock the creation of a Google Calendar event and a Google Meet link. Full API integration is for demonstration purposes.
                </AlertDescription>
            </Alert>
          </div>
          
          {/* Booking Section */}
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Book a Session</CardTitle>
                <CardDescription>Select a date and time that works for you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={date => { setSelectedDate(date); setSelectedSlot(null); }}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || 
                        !(mentor.availabilitySlots?.some(slot => !slot.isBooked && format(parseISO(slot.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')))
                      }
                    />
                  </PopoverContent>
                </Popover>

                {selectedDate && availableSlotsForDate.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <h4 className="font-medium text-sm">Available slots for {format(selectedDate, "PPP")}:</h4>
                    {availableSlotsForDate.map(slot => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <Clock className="mr-2 h-4 w-4" /> 
                        {format(parseISO(slot.startTime), 'p')} - {format(parseISO(slot.endTime), 'p')}
                      </Button>
                    ))}
                  </div>
                )}
                {selectedDate && availableSlotsForDate.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No available slots for this day.</p>
                )}
              </CardContent>
              {currentUser?.role === 'mentee' && selectedSlot && (
                <CardFooter>
                  <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleBookSession}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Confirm Booking for {format(parseISO(selectedSlot.startTime), 'p')}
                  </Button>
                </CardFooter>
              )}
               {currentUser?.role !== 'mentee' && (
                <CardFooter>
                    <p className="text-xs text-muted-foreground w-full text-center">Only Mentees can book sessions.</p>
                </CardFooter>
               )}
            </Card>
            
            {/* Placeholder for Google Meet/Calendar actions */}
            {/* <Button variant="outline" className="w-full" disabled>
                <ExternalLink className="mr-2 h-4 w-4" /> Add to Google Calendar (Mock)
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MentorProfileSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="overflow-hidden">
        <CardHeader className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2 mt-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <section key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </section>
            ))}
          </div>
          <div className="md:col-span-1 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to get mock mentor profiles
function getMockMentorProfiles(): string[] {
  return Object.values(MOCK_MENTORS_DB)
    .filter(u => u.role === 'mentor')
    .map(mentor => {
      const m = mentor as MentorProfile;
      return `Name: ${m.name}, Bio: ${m.bio}, Expertise: ${m.expertise?.join(', ') || 'N/A'}, Universities: ${m.universities.map(u => `${u.roleOrDegree} at ${u.institutionName}`).join('; ') || 'N/A'}, Companies: ${m.companies.map(c => `${c.roleOrDegree} at ${c.institutionName}`).join('; ') || 'N/A'}, Years of Exp: ${m.yearsOfExperience || 0}`;
    });
};


    