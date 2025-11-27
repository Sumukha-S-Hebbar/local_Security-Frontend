
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, UserCheck, Users, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type BasicCounts = {
  total_patrol_officers_count: number;
  total_guards_count: number;
  total_sites_count: number;
  total_agencies_count: number;
};


export function TowercoAnalyticsDashboard({
  counts,
}: {
  counts: BasicCounts;
}) {
  const router = useRouter();

  const resourceCards = [
    {
        key: 'sites',
        label: 'Sites',
        count: counts.total_sites_count,
        description: 'All sites under your portfolio.',
        icon: Building2,
        href: '/towerco/sites',
        color: 'text-purple-600',
        bg: 'bg-purple-600/10',
        ring: 'ring-purple-600'
    },
    {
        key: 'agencies',
        label: 'Security Agencies',
        count: counts.total_agencies_count,
        description: 'Contracted security partners',
        icon: Briefcase,
        href: '/towerco/agencies',
        color: 'text-indigo-600',
        bg: 'bg-indigo-600/10',
        ring: 'ring-indigo-600'
    },
    {
        key: 'patrol-officers',
        label: 'Patrolling Officers',
        count: counts.total_patrol_officers_count,
        description: 'Team leaders managing guards',
        icon: UserCheck,
        href: '/towerco/patrolling-officers',
        color: 'text-cyan-600',
        bg: 'bg-cyan-600/10',
        ring: 'ring-cyan-600'
    },
    {
        key: 'guards',
        label: 'Guards',
        count: counts.total_guards_count,
        description: 'Personnel across all agencies',
        icon: Users,
        href: '#', // TBD
        color: 'text-blue-600',
        bg: 'bg-blue-600/10',
        ring: 'ring-blue-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Status</CardTitle>
        <CardDescription className="font-medium">
          Click a resource to see the list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {resourceCards.map((item) => (
            <div
              key={item.key}
              onClick={() => item.href !== '#' && router.push(item.href)}
              role="button"
              tabIndex={0}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-all hover:shadow-md',
                item.bg, 'hover:ring-2', item.ring
              )}
            >
              <item.icon className={cn('h-8 w-8', item.color)} />
              <div>
                <p className={cn('font-semibold', item.color)}>{item.label}</p>
                <p className="text-2xl font-bold">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
