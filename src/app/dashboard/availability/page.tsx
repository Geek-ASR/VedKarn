
"use client";

import { useAuth } from "@/context/auth-context";
import type { MentorProfile, AvailabilitySlot } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { format, parseISO, setHours, setMinutes, startOfDay, isBefore, isEqual, addMinutes } from 'date-fns';
import { CalendarClock, Trash2, PlusCircle, AlertCircle, Frown, Info } from "lucide-react";

const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')); // 00 to 23
const MINUTES_OPTIONS = ['00', '15', '30', '45'];

export default function AvailabilityPage() {
  const { user, updateMentorAvailability, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTimeHour, setStartTimeHour] = useState<string>('09');
  const [startTimeMinute, setStartTimeMinute] = useState<string>('00');
  const [endTimeHour, setEndTimeHour] = useState<string>('10');
  const [endTimeMinute, setEndTimeMinute] = useState<string>('00');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mentorProfile = user as MentorProfile | null;
  const availabilitySlots = useMemo(() => {
    return mentorProfile?.availabilitySlots?.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()) || [];
  }, [mentorProfile?.availabilitySlots]);

  const handleAddSlot = async () => {
    setFormError(null);
    if (!selectedDate || !mentorProfile) {
      setFormError("Please select a date.");
      return;
    }
    setIsSubmitting(true);

    const newSlotStart = setMinutes(setHours(startOfDay(selectedDate), parseInt(startTimeHour)), parseInt(startTimeMinute));
    const newSlotEnd = setMinutes(setHours(startOfDay(selectedDate), parseInt(endTimeHour)), parseInt(endTimeMinute));

    if (isBefore(newSlotEnd, newSlotStart) || isEqual(newSlotEnd, newSlotStart)) {
      setFormError("End time must be after start time.");
      setIsSubmitting(false);
      return;
    }
     if (isBefore(newSlotStart, addMinutes(new Date(), -5))) { // Allow creating slots very close to current time, but not in past
      setFormError("Cannot add slots in the past.");
      setIsSubmitting(false);
      return;
    }


    // Overlap validation
    const existingSlots = mentorProfile.availabilitySlots || [];
    const hasOverlap = existingSlots.some(slot => {
      const existingStart = parseISO(slot.startTime);
      const existingEnd = parseISO(slot.endTime);
      // Check if new slot overlaps with an existing slot
      // (StartA < EndB) and (EndA > StartB)
      return isBefore(newSlotStart, existingEnd) && isBefore(existingStart, newSlotEnd);
    });

    if (hasOverlap) {
      setFormError("This time slot overlaps with an existing one.");
      setIsSubmitting(false);
      return;
    }

    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      startTime: newSlotStart.toISOString(),
      endTime: newSlotEnd.toISOString(),
      isBooked: false,
    };

    try {
      await updateMentorAvailability(mentorProfile.id, [...existingSlots, newSlot]);
      toast({
        title: "Slot Added",
        description: `Availability added for ${format(newSlotStart, 'PPP p')} to ${format(newSlotEnd, 'p')}.`,
      });
      // Reset form (optional, or clear specific fields)
      // setSelectedDate(new Date()); // Consider if resetting date is good UX
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Could not add slot.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!mentorProfile) return;
    setIsSubmitting(true);
    try {
      const updatedSlots = (mentorProfile.availabilitySlots || []).filter(slot => slot.id !== slotId);
      await updateMentorAvailability(mentorProfile.id, updatedSlots);
      toast({
        title: "Slot Removed",
        description: "The availability slot has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Could not remove slot.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const upcomingSlots = availabilitySlots.filter(slot => isBefore(new Date(), parseISO(slot.endTime)));
  const pastSlots = availabilitySlots.filter(slot => !isBefore(new Date(), parseISO(slot.endTime)));


  if (authLoading) {
    return <div className="flex h-full items-center justify-center"><p>Loading availability...</p></div>;
  }

  if (!user || user.role !== "mentor") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md">
          <Frown className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>This page is for mentors only.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <CalendarClock className="mr-3 h-8 w-8 text-accent" /> Manage Your Availability
          </CardTitle>
          <CardDescription className="text-lg">
            Define when you are available for mentorship sessions. Mentees will be able to book these slots.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Add New Slot</CardTitle>
            <CardDescription>Select a date and time to add a new availability slot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="date-picker">Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border p-0"
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="flex gap-2">
                <Select value={startTimeHour} onValueChange={setStartTimeHour}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Hour" /></SelectTrigger>
                  <SelectContent>{HOURS_OPTIONS.map(h => <SelectItem key={`start-h-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={startTimeMinute} onValueChange={setStartTimeMinute}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Minute" /></SelectTrigger>
                  <SelectContent>{MINUTES_OPTIONS.map(m => <SelectItem key={`start-m-${m}`} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
             <div className="space-y-2">
              <Label>End Time</Label>
              <div className="flex gap-2">
                <Select value={endTimeHour} onValueChange={setEndTimeHour}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Hour" /></SelectTrigger>
                  <SelectContent>{HOURS_OPTIONS.map(h => <SelectItem key={`end-h-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={endTimeMinute} onValueChange={setEndTimeMinute}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Minute" /></SelectTrigger>
                  <SelectContent>{MINUTES_OPTIONS.map(m => <SelectItem key={`end-m-${m}`} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddSlot} disabled={isSubmitting || !selectedDate} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> {isSubmitting ? "Adding..." : "Add Slot"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Your Availability Slots</CardTitle>
            <CardDescription>View and manage your upcoming and past time slots.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upcoming">Upcoming ({upcomingSlots.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastSlots.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                    {upcomingSlots.length === 0 ? (
                         <Alert className="bg-blue-50 border-blue-200 text-blue-700">
                            <Info className="h-4 w-4 text-blue-500" />
                            <AlertTitle>No Upcoming Slots</AlertTitle>
                            <AlertDescription>You have no upcoming availability slots. Add some using the form!</AlertDescription>
                        </Alert>
                    ) : (
                        <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {upcomingSlots.map(slot => (
                            <li key={slot.id} className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                            <div>
                                <p className="font-semibold text-sm text-primary">{format(parseISO(slot.startTime), 'PPP')}</p>
                                <p className="text-xs text-foreground">
                                {format(parseISO(slot.startTime), 'p')} - {format(parseISO(slot.endTime), 'p')}
                                </p>
                                {slot.isBooked ? (
                                <Badge variant="secondary" className="mt-1 text-xs">Booked</Badge>
                                ) : (
                                <Badge variant="outline" className="mt-1 text-xs border-green-500 text-green-600 bg-green-50">Available</Badge>
                                )}
                            </div>
                            {!slot.isBooked && (
                                <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" disabled={isSubmitting}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this available slot? This action cannot be undone.
                                    </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                    <Button variant="destructive" onClick={() => handleDeleteSlot(slot.id)} disabled={isSubmitting}>
                                        {isSubmitting ? "Deleting..." : "Delete Slot"}
                                    </Button>
                                    </DialogFooter>
                                </DialogContent>
                                </Dialog>
                            )}
                            </li>
                        ))}
                        </ul>
                    )}
                </TabsContent>
                 <TabsContent value="past">
                     {pastSlots.length === 0 ? (
                         <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>No Past Slots</AlertTitle>
                            <AlertDescription>You have no past availability slots recorded.</AlertDescription>
                        </Alert>
                    ) : (
                        <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {pastSlots.map(slot => (
                            <li key={slot.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/60">
                            <div>
                                <p className="font-semibold text-sm text-muted-foreground">{format(parseISO(slot.startTime), 'PPP')}</p>
                                <p className="text-xs text-muted-foreground">
                                {format(parseISO(slot.startTime), 'p')} - {format(parseISO(slot.endTime), 'p')}
                                </p>
                                <Badge variant={slot.isBooked ? "default" : "outline"} className="mt-1 text-xs opacity-70">
                                 {slot.isBooked ? "Completed" : "Expired (Unbooked)"}
                                </Badge>
                            </div>
                            {/* No actions for past slots */}
                            </li>
                        ))}
                        </ul>
                    )}
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tabs and TabsList, TabsTrigger, TabsContent are assumed to be imported from '@/components/ui/tabs'
// For simplicity, if they are not already present, a basic implementation would be:
// const Tabs = ({ children, ...props }) => <div {...props}>{children}</div>;
// const TabsList = ({ children, ...props }) => <div {...props} className="flex border-b">{children}</div>;
// const TabsTrigger = ({ children, ...props }) => <button {...props} className="p-2 -mb-px border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary">{children}</button>;
// const TabsContent = ({ children, ...props }) => <div {...props}>{children}</div>;
// Ensure these are correctly imported from ShadCN. Added to imports.
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


    