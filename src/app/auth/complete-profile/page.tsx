
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import type { UserRole, ExperienceItem, MentorProfile, MenteeProfile, UserProfile } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, UploadCloud } from "lucide-react";
import { useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const experienceSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required."),
  roleOrDegree: z.string().min(1, "Role or degree is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  bio: z.string().optional(),
  profileImageUrl: z.string().optional(), // For simplicity, direct URL input
  interests: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  role: z.enum(["mentee", "mentor"], { required_error: "Role selection is required." }),
  // Mentor specific
  expertise: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  universities: z.array(experienceSchema).optional(),
  companies: z.array(experienceSchema).optional(),
  yearsOfExperience: z.coerce.number().min(0).optional(),
  // Mentee specific
  learningGoals: z.string().optional(),
  desiredUniversities: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  desiredJobRoles: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  desiredCompanies: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfilePage() {
  const { user, completeProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      profileImageUrl: user?.profileImageUrl || "",
      interests: user?.interests?.join(', ') || "",
      role: user?.role || undefined,
      universities: user?.role === 'mentor' ? (user as MentorProfile).universities : [],
      companies: user?.role === 'mentor' ? (user as MentorProfile).companies : [],
      expertise: user?.role === 'mentor' ? (user as MentorProfile).expertise?.join(', ') : "",
      yearsOfExperience: user?.role === 'mentor' ? (user as MentorProfile).yearsOfExperience : 0,
      learningGoals: user?.role === 'mentee' ? (user as MenteeProfile).learningGoals : "",
      desiredUniversities: user?.role === 'mentee' ? (user as MenteeProfile).desiredUniversities?.join(', ') : "",
      desiredJobRoles: user?.role === 'mentee' ? (user as MenteeProfile).desiredJobRoles?.join(', ') : "",
      desiredCompanies: user?.role === 'mentee' ? (user as MenteeProfile).desiredCompanies?.join(', ') : "",
    }
  });

  const selectedRole = watch("role");

  const { fields: uniFields, append: appendUni, remove: removeUni } = useFieldArray({ control, name: "universities" });
  const { fields: compFields, append: appendComp, remove: removeComp } = useFieldArray({ control, name: "companies" });

  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("bio", user.bio || "");
      setValue("profileImageUrl", user.profileImageUrl || "");
      setValue("interests", user.interests?.join(', ') || "");
      if (user.role) setValue("role", user.role);

      if (user.role === 'mentor') {
        const mentorData = user as MentorProfile;
        setValue("universities", mentorData.universities || []);
        setValue("companies", mentorData.companies || []);
        setValue("expertise", mentorData.expertise?.join(', ') || "");
        setValue("yearsOfExperience", mentorData.yearsOfExperience || 0);
      } else if (user.role === 'mentee') {
        const menteeData = user as MenteeProfile;
        setValue("learningGoals", menteeData.learningGoals || "");
        setValue("desiredUniversities", menteeData.desiredUniversities?.join(', ') || "");
        setValue("desiredJobRoles", menteeData.desiredJobRoles?.join(', ') || "");
        setValue("desiredCompanies", menteeData.desiredCompanies?.join(', ') || "");
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    if (!data.role) {
      toast({ title: "Error", description: "Please select a role.", variant: "destructive" });
      return;
    }
    
    const profilePayload: Partial<UserProfile> = {
      name: data.name,
      bio: data.bio,
      profileImageUrl: data.profileImageUrl,
      interests: data.interests,
    };

    if (data.role === 'mentor') {
      (profilePayload as Partial<MentorProfile>).expertise = data.expertise;
      (profilePayload as Partial<MentorProfile>).universities = data.universities || [];
      (profilePayload as Partial<MentorProfile>).companies = data.companies || [];
      (profilePayload as Partial<MentorProfile>).yearsOfExperience = data.yearsOfExperience;
    } else if (data.role === 'mentee') {
      (profilePayload as Partial<MenteeProfile>).learningGoals = data.learningGoals;
      (profilePayload as Partial<MenteeProfile>).desiredUniversities = data.desiredUniversities;
      (profilePayload as Partial<MenteeProfile>).desiredJobRoles = data.desiredJobRoles;
      (profilePayload as Partial<MenteeProfile>).desiredCompanies = data.desiredCompanies;
    }

    try {
      await completeProfile(profilePayload, data.role as UserRole);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Could not update profile.",
        variant: "destructive",
      });
    }
  };
  
  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  if (!user && !authLoading) {
     router.push('/auth/signin'); // Should be handled by AuthProvider, but as a safeguard
     return null;
  }

  return (
    <div className="flex flex-col items-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Tell us more about yourself to get started on VedKarn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-4 pt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mentee" id="role-mentee" />
                      <Label htmlFor="role-mentee">Mentee (Student)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mentor" id="role-mentor" />
                      <Label htmlFor="role-mentor">Mentor</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="A brief introduction about yourself..." {...register("bio")} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                <div className="flex items-center space-x-2">
                    <Input id="profileImageUrl" placeholder="https://example.com/image.png" {...register("profileImageUrl")} />
                    {/* Basic file upload simulation - not functional
                    <Button type="button" variant="outline" size="icon" disabled>
                        <UploadCloud className="h-4 w-4" />
                    </Button>
                    */}
                </div>
                {errors.profileImageUrl && <p className="text-sm text-destructive">{errors.profileImageUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input id="interests" placeholder="e.g., AI, Web Development, Data Science" {...register("interests")} />
            </div>

            {/* Mentor Specific Fields */}
            {selectedRole === "mentor" && (
              <>
                <h3 className="text-lg font-semibold pt-4 border-t mt-6">Mentor Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                  <Input id="expertise" placeholder="e.g., Machine Learning, Career Advice" {...register("expertise")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input id="yearsOfExperience" type="number" placeholder="e.g., 5" {...register("yearsOfExperience")} />
                    {errors.yearsOfExperience && <p className="text-sm text-destructive">{errors.yearsOfExperience.message}</p>}
                </div>

                {/* Universities */}
                <div className="space-y-2">
                  <Label>Universities Attended</Label>
                  {uniFields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-2">
                      <Input placeholder="University Name" {...register(`universities.${index}.institutionName`)} />
                      {errors.universities?.[index]?.institutionName && <p className="text-sm text-destructive">{errors.universities[index]?.institutionName?.message}</p>}
                      <Input placeholder="Degree / Role" {...register(`universities.${index}.roleOrDegree`)} />
                      {errors.universities?.[index]?.roleOrDegree && <p className="text-sm text-destructive">{errors.universities[index]?.roleOrDegree?.message}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="date" placeholder="Start Date" {...register(`universities.${index}.startDate`)} />
                        <Input type="date" placeholder="End Date (Optional)" {...register(`universities.${index}.endDate`)} />
                      </div>
                      {errors.universities?.[index]?.startDate && <p className="text-sm text-destructive">{errors.universities[index]?.startDate?.message}</p>}
                      <Textarea placeholder="Description (Optional)" {...register(`universities.${index}.description`)} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeUni(index)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove University
                      </Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendUni({ institutionName: "", roleOrDegree: "", startDate: "", endDate: "", description: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add University
                  </Button>
                </div>

                {/* Companies */}
                <div className="space-y-2">
                  <Label>Companies Worked At</Label>
                  {compFields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-2">
                      <Input placeholder="Company Name" {...register(`companies.${index}.institutionName`)} />
                      {errors.companies?.[index]?.institutionName && <p className="text-sm text-destructive">{errors.companies[index]?.institutionName?.message}</p>}
                      <Input placeholder="Job Title / Role" {...register(`companies.${index}.roleOrDegree`)} />
                      {errors.companies?.[index]?.roleOrDegree && <p className="text-sm text-destructive">{errors.companies[index]?.roleOrDegree?.message}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="date" placeholder="Start Date" {...register(`companies.${index}.startDate`)} />
                        <Input type="date" placeholder="End Date (Optional)" {...register(`companies.${index}.endDate`)} />
                      </div>
                      {errors.companies?.[index]?.startDate && <p className="text-sm text-destructive">{errors.companies[index]?.startDate?.message}</p>}
                      <Textarea placeholder="Description (Optional)" {...register(`companies.${index}.description`)} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeComp(index)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Company
                      </Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendComp({ institutionName: "", roleOrDegree: "", startDate: "", endDate: "", description: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Company
                  </Button>
                </div>
              </>
            )}

            {/* Mentee Specific Fields */}
            {selectedRole === "mentee" && (
              <>
                <h3 className="text-lg font-semibold pt-4 border-t mt-6">Mentee Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="learningGoals">Learning Goals</Label>
                  <Textarea id="learningGoals" placeholder="What do you hope to achieve?" {...register("learningGoals")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desiredUniversities">Dream Universities (comma-separated)</Label>
                  <Input id="desiredUniversities" placeholder="e.g., Stanford, MIT" {...register("desiredUniversities")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desiredJobRoles">Desired Job Roles (comma-separated)</Label>
                  <Input id="desiredJobRoles" placeholder="e.g., Data Scientist, Software Engineer" {...register("desiredJobRoles")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desiredCompanies">Dream Companies (comma-separated)</Label>
                  <Input id="desiredCompanies" placeholder="e.g., Google, Microsoft" {...register("desiredCompanies")} />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
