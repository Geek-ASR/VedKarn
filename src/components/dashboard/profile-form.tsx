"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import type { UserProfile, ExperienceItem, MentorProfile, MenteeProfile } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, UploadCloud, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/core/user-avatar";

const experienceSchema = z.object({
  id: z.string().optional(), // Keep existing ID if editing
  institutionName: z.string().min(1, "Institution name is required."),
  roleOrDegree: z.string().min(1, "Role or degree is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const profileFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  bio: z.string().optional(),
  profileImageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  interests: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
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

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { control, register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  const watchedProfileImageUrl = watch("profileImageUrl");

  // Populate form with user data
  useEffect(() => {
    if (user) {
      const defaultValues: Partial<ProfileFormData> = {
        name: user.name || "",
        bio: user.bio || "",
        profileImageUrl: user.profileImageUrl || "",
        interests: user.interests?.join(', ') || "",
      };
      if (user.role === 'mentor') {
        const mentorData = user as MentorProfile;
        defaultValues.expertise = mentorData.expertise?.join(', ') || "";
        defaultValues.universities = mentorData.universities || [];
        defaultValues.companies = mentorData.companies || [];
        defaultValues.yearsOfExperience = mentorData.yearsOfExperience || 0;
      } else if (user.role === 'mentee') {
        const menteeData = user as MenteeProfile;
        defaultValues.learningGoals = menteeData.learningGoals || "";
        defaultValues.desiredUniversities = menteeData.desiredUniversities?.join(', ') || "";
        defaultValues.desiredJobRoles = menteeData.desiredJobRoles?.join(', ') || "";
        defaultValues.desiredCompanies = menteeData.desiredCompanies?.join(', ') || "";
      }
      reset(defaultValues);
    }
  }, [user, reset, isEditing]); // Re-populate when isEditing changes to reset to current user state or edit state

  const { fields: uniFields, append: appendUni, remove: removeUni } = useFieldArray({ control, name: "universities" });
  const { fields: compFields, append: appendComp, remove: removeComp } = useFieldArray({ control, name: "companies" });

  const onSubmit = async (data: ProfileFormData) => {
    const profileUpdateData: Partial<UserProfile> = {
      name: data.name,
      bio: data.bio,
      profileImageUrl: data.profileImageUrl,
      interests: data.interests,
    };

    if (user?.role === 'mentor') {
      (profileUpdateData as Partial<MentorProfile>).expertise = data.expertise;
      (profileUpdateData as Partial<MentorProfile>).universities = data.universities?.map(exp => ({ ...exp, id: exp.id || `new-${Date.now()}` })) || [];
      (profileUpdateData as Partial<MentorProfile>).companies = data.companies?.map(exp => ({ ...exp, id: exp.id || `new-${Date.now()}` })) || [];
      (profileUpdateData as Partial<MentorProfile>).yearsOfExperience = data.yearsOfExperience;
    } else if (user?.role === 'mentee') {
      (profileUpdateData as Partial<MenteeProfile>).learningGoals = data.learningGoals;
      (profileUpdateData as Partial<MenteeProfile>).desiredUniversities = data.desiredUniversities;
      (profileUpdateData as Partial<MenteeProfile>).desiredJobRoles = data.desiredJobRoles;
      (profileUpdateData as Partial<MenteeProfile>).desiredCompanies = data.desiredCompanies;
    }

    try {
      await updateUserProfile(profileUpdateData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Could not update profile.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !user) {
    return <p>Loading profile...</p>;
  }
  
  const currentAvatar = watchedProfileImageUrl || user.profileImageUrl;

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>View and manage your personal information and preferences.</CardDescription>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center space-x-6 mb-6">
            <UserAvatar user={{...user, profileImageUrl: currentAvatar}} className="h-24 w-24 text-3xl" />
            {isEditing && (
                 <div className="space-y-2 flex-1">
                    <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                    <Input id="profileImageUrl" placeholder="https://example.com/image.png" {...register("profileImageUrl")} />
                    {errors.profileImageUrl && <p className="text-sm text-destructive">{errors.profileImageUrl.message}</p>}
                </div>
            )}
          </div>

          {/* Common Fields */}
          <FormField label="Full Name" error={errors.name?.message} isEditing={isEditing} value={user.name}>
            <Input id="name" {...register("name")} disabled={!isEditing} />
          </FormField>
          <FormField label="Email" isEditing={false} value={user.email}>
            <Input id="email" value={user.email} disabled />
          </FormField>
          <FormField label="Bio" error={errors.bio?.message} isEditing={isEditing} value={user.bio}>
            <Textarea id="bio" placeholder="Tell us about yourself..." {...register("bio")} disabled={!isEditing} />
          </FormField>
          <FormField label="Interests (comma-separated)" error={errors.interests?.message} isEditing={isEditing} value={user.interests?.join(', ')}>
            <Input id="interests" placeholder="e.g., AI, Web Development" {...register("interests")} disabled={!isEditing} />
          </FormField>

          {/* Mentor Specific Fields */}
          {user.role === "mentor" && (
            <>
              <h3 className="text-xl font-semibold pt-6 border-t mt-8">Mentor Details</h3>
              <FormField label="Expertise (comma-separated)" error={errors.expertise?.message} isEditing={isEditing} value={(user as MentorProfile).expertise?.join(', ')}>
                <Input id="expertise" placeholder="e.g., Machine Learning, Career Advice" {...register("expertise")} disabled={!isEditing} />
              </FormField>
               <FormField label="Years of Experience" error={errors.yearsOfExperience?.message} isEditing={isEditing} value={(user as MentorProfile).yearsOfExperience?.toString()}>
                <Input id="yearsOfExperience" type="number" placeholder="e.g., 5" {...register("yearsOfExperience")} disabled={!isEditing} />
              </FormField>

              <ExperienceSection
                title="Universities Attended"
                fields={uniFields}
                register={register}
                remove={removeUni}
                append={() => appendUni({ id: `new-${Date.now()}`, institutionName: "", roleOrDegree: "", startDate: "", endDate: "", description: "" })}
                errors={errors.universities}
                namePrefix="universities"
                isEditing={isEditing}
              />
              <ExperienceSection
                title="Companies Worked At"
                fields={compFields}
                register={register}
                remove={removeComp}
                append={() => appendComp({ id: `new-${Date.now()}`, institutionName: "", roleOrDegree: "", startDate: "", endDate: "", description: "" })}
                errors={errors.companies}
                namePrefix="companies"
                isEditing={isEditing}
              />
            </>
          )}

          {/* Mentee Specific Fields */}
          {user.role === "mentee" && (
            <>
              <h3 className="text-xl font-semibold pt-6 border-t mt-8">Mentee Details</h3>
              <FormField label="Learning Goals" error={errors.learningGoals?.message} isEditing={isEditing} value={(user as MenteeProfile).learningGoals}>
                <Textarea id="learningGoals" placeholder="What do you hope to achieve?" {...register("learningGoals")} disabled={!isEditing}/>
              </FormField>
              <FormField label="Dream Universities (comma-separated)" error={errors.desiredUniversities?.message} isEditing={isEditing} value={(user as MenteeProfile).desiredUniversities?.join(', ')}>
                <Input id="desiredUniversities" placeholder="e.g., Stanford, MIT" {...register("desiredUniversities")} disabled={!isEditing}/>
              </FormField>
              <FormField label="Desired Job Roles (comma-separated)" error={errors.desiredJobRoles?.message} isEditing={isEditing} value={(user as MenteeProfile).desiredJobRoles?.join(', ')}>
                <Input id="desiredJobRoles" placeholder="e.g., Data Scientist" {...register("desiredJobRoles")} disabled={!isEditing}/>
              </FormField>
              <FormField label="Dream Companies (comma-separated)" error={errors.desiredCompanies?.message} isEditing={isEditing} value={(user as MenteeProfile).desiredCompanies?.join(', ')}>
                <Input id="desiredCompanies" placeholder="e.g., Google, Microsoft" {...register("desiredCompanies")} disabled={!isEditing}/>
              </FormField>
            </>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={authLoading || !isDirty}>
                <Save className="mr-2 h-4 w-4" /> {authLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  isEditing: boolean;
  value?: string | string[] | number | null;
}

function FormField({ label, children, error, isEditing, value }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      {isEditing ? (
        <>
          {children}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      ) : (
        <p className="text-muted-foreground break-words whitespace-pre-wrap">
          {Array.isArray(value) ? value.join(', ') : (value || "N/A")}
        </p>
      )}
    </div>
  );
}


interface ExperienceSectionProps {
  title: string;
  fields: any[]; // from useFieldArray
  register: any; // from useForm
  remove: (index: number) => void;
  append: () => void;
  errors: any; // form errors for this section
  namePrefix: "universities" | "companies";
  isEditing: boolean;
}

function ExperienceSection({ title, fields, register, remove, append, errors, namePrefix, isEditing }: ExperienceSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">{title}</Label>
      {fields.map((field, index) => (
        <Card key={field.id} className="p-4 space-y-3 bg-muted/30">
          <FormField label="Institution Name" error={errors?.[index]?.institutionName?.message} isEditing={isEditing} value={field.institutionName}>
            <Input placeholder="Institution Name" {...register(`${namePrefix}.${index}.institutionName`)} disabled={!isEditing} />
          </FormField>
          <FormField label="Role / Degree" error={errors?.[index]?.roleOrDegree?.message} isEditing={isEditing} value={field.roleOrDegree}>
            <Input placeholder="Role / Degree" {...register(`${namePrefix}.${index}.roleOrDegree`)} disabled={!isEditing}/>
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="Start Date" error={errors?.[index]?.startDate?.message} isEditing={isEditing} value={field.startDate}>
              <Input type="date" {...register(`${namePrefix}.${index}.startDate`)} disabled={!isEditing}/>
            </FormField>
            <FormField label="End Date (Optional)" error={errors?.[index]?.endDate?.message} isEditing={isEditing} value={field.endDate}>
              <Input type="date" {...register(`${namePrefix}.${index}.endDate`)} disabled={!isEditing}/>
            </FormField>
          </div>
          <FormField label="Description (Optional)" error={errors?.[index]?.description?.message} isEditing={isEditing} value={field.description}>
            <Textarea placeholder="Description" {...register(`${namePrefix}.${index}.description`)} disabled={!isEditing}/>
          </FormField>
          {isEditing && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive mt-2">
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          )}
        </Card>
      ))}
      {isEditing && (
        <Button type="button" variant="outline" onClick={append} className="mt-2">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
        </Button>
      )}
       {!isEditing && fields.length === 0 && <p className="text-muted-foreground">No {title.toLowerCase()} added yet.</p>}
    </div>
  );
}