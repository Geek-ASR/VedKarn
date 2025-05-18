
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarClock, Construction, Frown } from "lucide-react";

export default function AvailabilityPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading...</p>; // Or a more sophisticated skeleton loader
  }

  if (user.role !== "mentor") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <Frown className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is for mentors only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      <Card>
        <CardHeader>
            <CardTitle>Current Availability Slots</CardTitle>
            <CardDescription>View and manage your existing time slots.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Placeholder for displaying current slots */}
            <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Feature Coming Soon!</AlertTitle>
                <AlertDescription>
                    The ability to view and manage your existing slots will be implemented here.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Add New Availability Slot</CardTitle>
            <CardDescription>Create a new time slot for mentees to book.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Placeholder for adding new slots form */}
             <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Feature Coming Soon!</AlertTitle>
                <AlertDescription>
                    The form to add new availability slots will be implemented here.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>

    </div>
  );
}
