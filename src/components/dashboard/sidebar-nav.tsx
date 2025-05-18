
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/types";
import { Home, User, Users, CalendarDays, Settings, Brain, Briefcase, CalendarClock } from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  user: UserProfile | null;
}

export function SidebarNav({ className, user, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  const commonItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const menteeItems = [
    ...commonItems,
    { href: "/dashboard/mentors", label: "Find Mentors", icon: Users },
    { href: "/dashboard/schedule", label: "My Schedule", icon: CalendarDays },
    { href: "/dashboard/recommendations", label: "AI Suggestions", icon: Brain },
  ];

  const mentorItems = [
    ...commonItems,
    { href: "/dashboard/availability", label: "Set Availability", icon: CalendarClock }, // Ensured icon is distinct if needed
    { href: "/dashboard/schedule", label: "My Schedule", icon: CalendarDays },
    { href: "/dashboard/mentees", label: "My Mentees", icon: Briefcase }, // Assuming this page exists or will be created
  ];

  const items = user?.role === "mentor" ? mentorItems : menteeItems;
  const displayItems = user?.role ? items : commonItems;


  return (
    <nav
      className={cn(
        "flex flex-col space-y-1 p-2 bg-sidebar rounded-lg shadow-sm text-sidebar-foreground",
        className
      )}
      {...props}
    >
      {displayItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            pathname === item.href
              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
          )}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
