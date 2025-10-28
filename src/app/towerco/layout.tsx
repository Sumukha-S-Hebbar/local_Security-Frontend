
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TowercoHeader from './header';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';

export default function TowercoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Towerco/MNO roles are 'T' and 'O'
        if (userData.role === 'SA' || userData.role === 'SG') {
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } else {
        // If no user data, they shouldn't be here
        router.replace('/');
      }
    }
  }, [router]);
  
  if (isAuthorized === null) {
    // You can return a loading skeleton here if you want
    return null;
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen">
        <TowercoHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-destructive/10 p-3 rounded-full">
                <ShieldOff className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="mt-4">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-medium">You do not have permission to view this page. Your role does not grant access to the TOWERCO/MNO Portal.</p>
              <Button onClick={() => router.back()} className="mt-6">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <TowercoHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
