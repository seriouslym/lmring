'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@lmring/ui';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CameraIcon,
  CheckIcon,
  CreditCardIcon,
  LoaderIcon,
  MailIcon,
  UserIcon,
} from 'lucide-react';
import * as React from 'react';
import { useSession } from '@/libs/AuthClient';

export default function AccountPage() {
  const [saved, setSaved] = React.useState(false);
  const { data: session, isPending, error } = useSession();

  // Show loading state
  if (isPending) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading account information...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !session) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <p className="text-destructive">
              Failed to load account information. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = session.user as typeof session.user & {
    status?: string;
    inviterId?: string;
  };

  // Format joined date
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  // Get initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user.email
      ? user.email.charAt(0).toUpperCase()
      : 'U';

  const handleSave = () => {
    // TODO: Implement actual save functionality with API call
    // This is currently a visual feedback placeholder
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Account</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-primary-foreground hover:bg-primary/90"
                  >
                    <CameraIcon className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold">{user.name || 'No name set'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={user.name || ''}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" defaultValue={user.email} className="pl-10" disabled />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-lg border border-input bg-transparent shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  {saved ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <Badge>Free</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">API Requests</span>
                    <span className="font-medium">0 / 1,000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `0%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">0% of monthly limit used</p>
                </div>
                <Button variant="outline" className="w-full">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Member Since
                  </span>
                  <span className="text-sm font-medium">{joinedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account ID</span>
                  <span className="text-xs font-mono">{user.id.slice(0, 12)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={user.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {user.status || 'active'}
                  </Badge>
                </div>
                {user.inviterId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Invited By</span>
                    <span className="text-xs font-mono">{user.inviterId.slice(0, 8)}...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
