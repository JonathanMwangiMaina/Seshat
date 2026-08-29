import ProfileForm from '@/components/profile/ProfileForm';
import UpdatePasswordForm from '@/components/profile/UpdatePasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, initialLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !initialLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, initialLoading, mounted]);

  if (initialLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="items-center text-center">
          <UserCog className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
          <CardDescription>Manage your account details and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="account">Account Details</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <ProfileForm currentUser={user} />
            </TabsContent>
            <TabsContent value="password">
              <UpdatePasswordForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
