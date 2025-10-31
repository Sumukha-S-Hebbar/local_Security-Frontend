
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SitesPageClient } from './_components/sites-page-client';

function SitesPageSkeleton() {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
}

export default function AgencySitesPage() {
  return (
    <Suspense fallback={<SitesPageSkeleton />}>
      <SitesPageClient />
    </Suspense>
  );
}

    