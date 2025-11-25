
'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, ShieldAlert, ShieldQuestion } from 'lucide-react';
import type { BasicCounts } from '../page';


export function IncidentStatusBreakdown({
  counts,
}: {
  counts: BasicCounts;
}) {
  const router = useRouter();

  const statusCards = [
    {
      status: 'sos',
      label: 'SOS',
      count: counts.sos_count,
      icon: ShieldAlert,
      className: 'bg-destructive/10 text-destructive',
      ring: 'ring-destructive',
    },
    {
      status: 'active',
      label: 'Active',
      count: counts.active_incidents_count,
      icon: ShieldAlert,
      className: 'bg-destructive/10 text-destructive',
      ring: 'ring-destructive',
    },
    {
      status: 'under-review',
      label: 'Under Review',
      count: counts.under_review_incidents_count,
      icon: ShieldQuestion,
      className: 'bg-[#FFC107]/10 text-[#FFC107]',
      ring: 'ring-[#FFC107]',
    },
    {
      status: 'resolved',
      label: 'Resolved',
      count: counts.resolved_incidents_count,
      icon: CheckCircle2,
      className: 'bg-chart-2/10 text-chart-2',
      ring: 'ring-chart-2',
    },
  ] as const;

  const handleStatusClick = (status: string) => {
    router.push(`/agency/incidents?status=${status}`);
  };

  return (
    <Card>
      <CardHeader>
            <CardTitle>Incident Status Breakdown</CardTitle>
            <CardDescription className="font-medium">
            Click a status to see the list of incidents.
            </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusCards.map((item) => (
            <div
              key={item.status}
              onClick={() => handleStatusClick(item.status)}
              role="button"
              tabIndex={0}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-all hover:shadow-md',
                item.className
              )}
            >
              <item.icon className="h-8 w-8" />
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-2xl font-bold">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
