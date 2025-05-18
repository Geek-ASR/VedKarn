
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { UserAvatar } from "@/components/core/user-avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Logo } from "@/components/core/logo";
import { Bell, LifeBuoy, LogOut, Settings, User as UserIcon, Menu, CalendarCheck, UserPlus, Gift, CheckCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    icon: CalendarCheck,
    title: "Session Confirmed",
    description: "Your session with Alex Chen is confirmed for tomorrow at 2 PM.",
    time: "5m ago",
    read: false,
  },
  {
    id: "2",
    icon: UserPlus,
    title: "New Mentee Request",
    description: "Sophia Lee has requested to book a session.",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    icon: Gift,
    title: "Feature Update",
    description: "Group session creation is now live for mentors!",
    time: "1d ago",
    read: true,
  },
   {
    id: "4",
    icon: CalendarCheck,
    title: "Session Reminder",
    description: "Upcoming session with Dr. Vance in 30 minutes.",
    time: "25m ago",
    read: false,
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    } else if (!loading && user && !user.role) {
      router.replace("/auth/complete-profile");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }
   if (!user.role) { // Still waiting for role, e.g. redirecting to complete-profile
     return <div className="flex h-screen items-center justify-center"><p>Finalizing setup...</p></div>;
   }

  const unreadNotificationsCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen w-full flex flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="p-4 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <Logo className="h-8 w-auto" />
                </Link>
              </div>
              <ScrollArea className="flex-1">
                 <SidebarNav user={user} className="m-2" />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:block">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Logo className="h-8 w-auto" />
            </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {unreadNotificationsCount > 0 && <Badge variant="destructive" className="h-5 px-1.5">{unreadNotificationsCount} New</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {mockNotifications.length === 0 && (
                  <DropdownMenuItem disabled className="text-center text-muted-foreground py-4">
                    No new notifications
                  </DropdownMenuItem>
                )}
                {mockNotifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className={`flex items-start gap-2.5 p-2.5 ${!notification.read ? 'bg-primary/5' : ''}`}>
                    <notification.icon className={`h-5 w-5 mt-0.5 ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.description}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{notification.time}</p>
                    </div>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-primary self-center"></div>}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                 <DropdownMenuItem disabled>
                    <Button variant="ghost" size="sm" className="w-full justify-center text-xs" disabled>Mark all as read (Mock)</Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#" className="flex items-center justify-center text-xs text-primary hover:underline">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <UserAvatar user={user} className="h-10 w-10" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile"><UserIcon className="mr-2 h-4 w-4" /> Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <LifeBuoy className="mr-2 h-4 w-4" /> Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-64 border-r bg-card p-4">
          <SidebarNav user={user} />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
