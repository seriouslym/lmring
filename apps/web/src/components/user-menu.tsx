'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@lmring/ui';
import { LayoutDashboardIcon, LogOutIcon, PaletteIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { authClient } from '@/libs/AuthClient';

interface UserMenuProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push(`/${locale}/sign-in`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative h-9 w-9 rounded-full ring-offset-background apple-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          <Avatar className="h-9 w-9 apple-shadow">
            <AvatarImage src={user?.image} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground font-medium">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem
          onClick={() => router.push(`/${locale}/account`)}
          className="apple-transition"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span className="font-medium">Account</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(`/${locale}/theme`)}
          className="apple-transition"
        >
          <PaletteIcon className="mr-2 h-4 w-4" />
          <span className="font-medium">Theme</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(`/${locale}/arena`)}
          className="apple-transition"
        >
          <LayoutDashboardIcon className="mr-2 h-4 w-4" />
          <span className="font-medium">Arena</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(`/${locale}/settings`)}
          className="apple-transition"
        >
          <SettingsIcon className="mr-2 h-4 w-4" />
          <span className="font-medium">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer apple-transition"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span className="font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
