"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Brain, CalendarCheck, Search, UserPlus } from "lucide-react";
import Image from "next/image";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  if (!user) return <p>Loading user data...</p>;

  const welcomeMessage = `Welcome back, ${user.name || "User"}!`;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">{welcomeMessage}</CardTitle>
          <CardDescription className="text-lg">
            {user.role === "mentor"
              ? "Manage your availability, connect with mentees, and make an impact."
              : "Discover mentors, schedule sessions, and accelerate your growth."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Image 
                src="https://placehold.co/1200x400.png"
                alt="Dashboard Welcome Banner"
                data-ai-hint="team collaboration"
                width={1200}
                height={400}
                className="rounded-lg object-cover"
            />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user.role === "mentee" && (
          <>
            <ActionCard
              title="Find Mentors"
              description="Search and filter our extensive network of experienced mentors."
              href="/dashboard/mentors"
              icon={Search}
              actionText="Explore Mentors"
            />
            <ActionCard
              title="AI Mentor Suggestions"
              description="Get personalized mentor recommendations based on your profile and goals."
              href="/dashboard/recommendations"
              icon={Brain}
              actionText="View Suggestions"
            />
            <ActionCard
              title="My Scheduled Sessions"
              description="View and manage your upcoming mentoring sessions."
              href="/dashboard/schedule"
              icon={CalendarCheck}
              actionText="Check Schedule"
            />
          </>
        )}

        {user.role === "mentor" && (
          <>
            <ActionCard
              title="Set Your Availability"
              description="Update your calendar to let mentees know when you're available."
              href="/dashboard/availability"
              icon={CalendarCheck}
              actionText="Manage Availability"
            />
            <ActionCard
              title="View Your Mentees"
              description="See who has booked sessions with you and manage your mentorships."
              href="/dashboard/mentees"
              icon={UserPlus}
              actionText="See Mentees"
            />
             <ActionCard
              title="Update Your Profile"
              description="Keep your profile updated to attract the right mentees."
              href="/dashboard/profile"
              icon={User}
              actionText="Edit Profile"
            />
          </>
        )}
      </div>
       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
           <Button variant="outline" asChild><Link href="/dashboard/profile">My Profile</Link></Button>
           {user.role === 'mentee' && <Button variant="outline" asChild><Link href="/dashboard/settings">Notification Settings</Link></Button>}
           {user.role === 'mentor' && <Button variant="outline" asChild><Link href="/dashboard/settings">Payment Settings</Link></Button>}
           <Button variant="outline" disabled>Help & Support</Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  actionText: string;
}

function ActionCard({ title, description, href, icon: Icon, actionText }: ActionCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <Icon className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button asChild className="w-full">
          <Link href={href}>
            {actionText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}