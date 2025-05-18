
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, getMentorByProfileString, getMockMentorProfiles } from "@/context/auth-context";
import type { MentorProfile, AvailabilitySlot, Booking } from "@/lib/types";
import { UserAvatar } from "@/components/core/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Briefcase, GraduationCap, Star, Clock, CheckCircle, ExternalLink, Info, Frown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";


const MOCK_MENTORS_DB: MentorProfile[] = Object.values(getMockMentorProfiles())
  .map(profileString => getMentorByProfileString(profileString))
  .filter((mentor): mentor is MentorProfile => Boolean(mentor));


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

  useEffect(() => {
    if (mentorId) {
      setTimeout(() => {
        const foundMentor = MOCK_MENTORS_DB.find(m => m.id === mentorId);
        setMentor(foundMentor || null);
        setLoading(false);
      }, 500);
    }
  }, [mentorId]);

  const handleBookSession = () => {
    if (!currentUser || currentUser.role !== 'mentee' || !mentor || !selectedSlot) {
      toast({ title: "Booking Error", description: "Cannot complete booking. Ensure you're logged in as a mentee and selected a slot.", variant: "destructive" });
      return;
    }
    
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
    
    const updatedMentorAvailability = mentor.availabilitySlots?.map(slot => 
        slot.id === selectedSlot.id ? { ...slot, isBooked: true, bookedByMenteeId: currentUser.id } : slot
    );
    
    const updatedMentor = {
        ...mentor,
        availabilitySlots: updatedMentorAvailability
    };
    
    setMentor(updatedMentor); 

    const mentorIndex = MOCK_MENTORS_DB.findIndex(m => m.id === mentor.id);
    if(mentorIndex > -1) {
      MOCK_MENTORS_DB[mentorIndex] = updatedMentor;
    }

    setSelectedSlot(null);

    toast({
      title: "Session Booked!",
      description: `Your session with ${mentor.name} on ${format(parseISO(selectedSlot.startTime), "PPP 'at' p")} is confirmed. You'll be able to join via an in-app video call from your schedule closer to the time.`,
      action: (
        <ToastAction altText="View Schedule" asChild>
          <Link href="/dashboard/schedule">View Schedule</Link>
        </ToastAction>
      ),
      duration: 10000,
    });
  };

  if (loading) {
    return <MentorProfileSkeleton />;
  }

  if (!mentor) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
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
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="bg-gradient-to-br from-primary/20 to-accent/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <UserAvatar user={mentor} className="h-24 w-24 md:h-32 md:w-32 text-4xl md:text-5xl border-4 border-background shadow-lg" />
            <div className="flex-1 mt-2 md:mt-0">
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary mb-1">{mentor.name}</CardTitle>
              <CardDescription className="text-md md:text-lg text-muted-foreground mb-2">
                {mentor.companies?.[0]?.roleOrDegree || mentor.universities?.[0]?.roleOrDegree || 'Experienced Professional'}
              </CardDescription>
              {mentor.yearsOfExperience !== undefined && (
                <Badge variant="secondary" className="text-sm py-1 px-3 shadow-sm">
                  <Star className="h-4 w-4 mr-1.5 text-amber-500 fill-amber-500" /> {mentor.yearsOfExperience} Years of Experience
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-2 border-b pb-1">About Me</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{mentor.bio || "No detailed bio provided."}</p>
            </section>

            {mentor.expertise && mentor.expertise.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3 border-b pb-1">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="outline" className="py-1 px-3 text-sm bg-accent/10 text-accent-foreground border-accent/30">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}

            {mentor.companies && mentor.companies.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center border-b pb-1"><Briefcase className="h-5 w-5 mr-2 text-primary" /> Professional Experience</h3>
                <ul className="space-y-4">
                  {mentor.companies.map(exp => (
                    <li key={exp.id || exp.institutionName} className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-md text-primary">{exp.roleOrDegree} at {exp.institutionName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(exp.startDate), 'MMM yyyy')} - {exp.endDate ? format(parseISO(exp.endDate), 'MMM yyyy') : 'Present'}
                      </p>
                      {exp.description && <p className="text-sm mt-2 text-foreground/80">{exp.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {mentor.universities && mentor.universities.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center border-b pb-1"><GraduationCap className="h-5 w-5 mr-2 text-primary" /> Education</h3>
                 <ul className="space-y-4">
                  {mentor.universities.map(exp => (
                    <li key={exp.id || exp.institutionName} className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-md text-primary">{exp.roleOrDegree} - {exp.institutionName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(exp.startDate), 'MMM yyyy')} - {exp.endDate ? format(parseISO(exp.endDate), 'MMM yyyy') : 'Graduated'}
                      </p>
                       {exp.description && <p className="text-sm mt-2 text-foreground/80">{exp.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
          </div>
          
          <div className="md:col-span-1 space-y-6 sticky top-24 self-start">
             <Alert className="bg-blue-50 border-blue-200 text-blue-700 mb-6">
                <Info className="h-5 w-5 text-blue-500" />
                <AlertTitle className="font-semibold">Note on In-App Sessions</AlertTitle>
                <AlertDescription>
                    Booking a session confirms your slot. In a full version of VedKarn, you would join your session via a secure, built-in video call feature directly on our platform. For this demo, the booking is confirmed, and you can imagine accessing the video call from your schedule page.
                </AlertDescription>
            </Alert>
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Book a Session</CardTitle>
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
                      disabled={(date) => 
                        date < new Date(new Date().setDate(new Date().getDate() -1)) || 
                        !(mentor.availabilitySlots?.some(slot => 
                            !slot.isBooked && format(parseISO(slot.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>

                {selectedDate && availableSlotsForDate.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <h4 className="font-medium text-sm text-foreground">Available slots for {format(selectedDate, "PPP")}:</h4>
                    {availableSlotsForDate.map(slot => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className="w-full justify-start text-sm py-2 h-auto"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <Clock className="mr-2 h-4 w-4" /> 
                        {format(parseISO(slot.startTime), 'p')} - {format(parseISO(slot.endTime), 'p')}
                      </Button>
                    ))}
                  </div>
                )}
                {selectedDate && availableSlotsForDate.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No available slots for this day. Please pick another date.</p>
                )}
              </CardContent>
              {currentUser?.role === 'mentee' && selectedSlot && (
                <CardFooter>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleBookSession}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Confirm Booking for {format(parseISO(selectedSlot.startTime), 'p')}
                  </Button>
                </CardFooter>
              )}
               {currentUser?.role !== 'mentee' && (
                <CardFooter>
                    <p className="text-xs text-muted-foreground w-full text-center">Only Mentees can book sessions.</p>
                </CardFooter>
               )}
               {!selectedSlot && currentUser?.role === 'mentee' && (
                  <CardFooter>
                    <p className="text-xs text-muted-foreground w-full text-center">Please select a date and time slot to book.</p>
                  </CardFooter>
               )}
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MentorProfileSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="bg-gradient-to-br from-primary/20 to-accent/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
            <div className="flex-1 space-y-2 mt-2 md:mt-0">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {[...Array(3)].map((_, i) => (
              <section key={i} className="space-y-3">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                 <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-4/6" />
              </section>
            ))}
          </div>
          <div className="md:col-span-1 space-y-6">
             <Skeleton className="h-20 w-full" /> 
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

