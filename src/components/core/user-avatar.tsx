import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface UserAvatarProps {
  user: UserProfile | null;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={user?.profileImageUrl} alt={user?.name || "User"} />
      <AvatarFallback>
        {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
      </AvatarFallback>
    </Avatar>
  );
}