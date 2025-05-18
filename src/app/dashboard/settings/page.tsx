
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { AlertCircle, CreditCard, BellRing, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Mock state for notification preferences
  const [emailBookings, setEmailBookings] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleDeleteAccount = () => {
    // In a real app, this would involve API calls and data cleanup
    logout(); // For mock, just log out
    localStorage.removeItem('vedkarn-user'); // Clear user from local storage
    toast({
      title: "Account Deleted (Mock)",
      description: "Your account has been successfully (mock) deleted. You have been logged out.",
    });
    router.push("/"); // Redirect to homepage
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Settings</CardTitle>
          <CardDescription className="text-lg">
            Manage your account preferences and settings.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><BellRing className="mr-2 h-5 w-5 text-accent"/> Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg shadow-sm">
            <Label htmlFor="email-bookings" className="flex flex-col space-y-1">
              <span>New Session Bookings</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">
                Receive email notifications for new session confirmations and cancellations.
              </span>
            </Label>
            <Switch
              id="email-bookings"
              checked={emailBookings}
              onCheckedChange={setEmailBookings}
              aria-label="Toggle new session booking notifications"
            />
          </div>
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg shadow-sm">
            <Label htmlFor="email-reminders" className="flex flex-col space-y-1">
              <span>Session Reminders</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">
                Get email reminders for your upcoming sessions.
              </span>
            </Label>
            <Switch
              id="email-reminders"
              checked={emailReminders}
              onCheckedChange={setEmailReminders}
              aria-label="Toggle session reminder notifications"
            />
          </div>
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg shadow-sm">
            <Label htmlFor="email-updates" className="flex flex-col space-y-1">
              <span>Platform Updates & Newsletters</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">
                Stay informed about new features, tips, and community news.
              </span>
            </Label>
            <Switch
              id="email-updates"
              checked={emailUpdates}
              onCheckedChange={setEmailUpdates}
              aria-label="Toggle platform update notifications"
            />
          </div>
        </CardContent>
      </Card>

      {user.role === "mentor" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><CreditCard className="mr-2 h-5 w-5 text-accent"/> Payment Settings (Mentor)</CardTitle>
            <CardDescription>Manage your payout methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/40 text-sm text-muted-foreground">
              <p className="mb-2">
                Connect your bank account or preferred payment provider to receive payouts for your mentorship sessions.
              </p>
              <Button disabled variant="outline">Connect Bank Account (Mock)</Button>
            </div>
             <p className="text-xs text-muted-foreground italic">
              Note: Payout functionality is for demonstration purposes only.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><AlertCircle className="mr-2 h-5 w-5 text-destructive"/> Account Management</CardTitle>
          <CardDescription>Manage your account data and security.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5 shadow-sm">
             <div>
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-destructive/80 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    VedKarn account and remove your data from our servers (mock).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    Yes, Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

