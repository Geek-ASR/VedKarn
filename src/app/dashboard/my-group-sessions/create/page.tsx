
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Save, Frown } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const groupSessionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  date: z.date({ required_error: "Session date is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)."), // HH:MM format
  duration: z.string().min(1, "Duration is required (e.g., 60 minutes, 1.5 hours)."),
  maxParticipants: z.coerce.number().min(1, "Max participants must be at least 1.").max(100, "Max 100 participants."),
  price: z.string().min(1, "Price is required (e.g., Free, $20, Rs. 500)."),
  tagsString: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type GroupSessionFormData = z.infer<typeof groupSessionSchema>;

export default function CreateGroupSessionPage() {
  const { user, createGroupSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GroupSessionFormData>({
    resolver: zodResolver(groupSessionSchema),
    defaultValues: {
      maxParticipants: 10,
      price: "Free",
    }
  });

  const selectedDate = watch("date");

  const onSubmit = async (data: GroupSessionFormData) => {
    if (!user || user.role !== 'mentor') {
      toast({ title: "Error", description: "You must be a mentor to create sessions.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const sessionDateTime = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    sessionDateTime.setHours(hours, minutes, 0, 0);

    const formattedDate = format(sessionDateTime, "MMMM do, yyyy 'at' h:mm a");

    try {
      await createGroupSession({
        title: data.title,
        description: data.description,
        date: formattedDate, // Use the combined and formatted date/time
        tags: data.tagsString ? data.tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        imageUrl: data.imageUrl,
        maxParticipants: data.maxParticipants,
        price: data.price,
        duration: data.duration,
        // hostId, hostName, participantCount will be set by createGroupSession in context
      });
      toast({ title: "Success!", description: "Group session created successfully." });
      router.push("/dashboard/my-group-sessions");
    } catch (error) {
      toast({ title: "Error Creating Session", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user || user.role !== 'mentor') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md">
            <Frown className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>This page is for mentors only.</AlertDescription>
            <Button variant="link" onClick={() => router.push('/dashboard')} className="mt-2">Go to Dashboard</Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Sessions
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Create New Group Session</CardTitle>
          <CardDescription>Fill in the details below to schedule your group session.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Session Title</Label>
              <Input id="title" {...register("title")} placeholder="e.g., Mastering React Hooks" />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Provide a detailed description of your session..." rows={4} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date">Session Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setValue("date", date as Date, { shouldValidate: true })}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <Label htmlFor="time">Session Start Time (HH:MM)</Label>
                <Input id="time" type="time" {...register("time")} />
                {errors.time && <p className="text-sm text-destructive mt-1">{errors.time.message}</p>}
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" {...register("duration")} placeholder="e.g., 90 minutes / 1.5 hours" />
                    {errors.duration && <p className="text-sm text-destructive mt-1">{errors.duration.message}</p>}
                </div>
                <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input id="maxParticipants" type="number" {...register("maxParticipants")} placeholder="e.g., 15" />
                    {errors.maxParticipants && <p className="text-sm text-destructive mt-1">{errors.maxParticipants.message}</p>}
                </div>
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" {...register("price")} placeholder="e.g., Free, $25, Rs. 500" />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="tagsString">Tags (comma-separated)</Label>
              <Input id="tagsString" {...register("tagsString")} placeholder="e.g., React, JavaScript, Career Advice" />
            </div>

            <div>
              <Label htmlFor="imageUrl">Cover Image URL (Optional)</Label>
              <Input id="imageUrl" {...register("imageUrl")} placeholder="https://example.com/image.png" />
              {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Creating Session..." : "Create Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
