
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
        color: 'text-white',
        bg: 'bg-[#1b2a41]',
        ring: 'ring-blue-600'
    },
    {
        key: 'agencies',
        label: 'Security Agencies',
        count: counts.total_agencies_count,
        description: 'Contracted security partners',
        icon: Briefcase,
        href: '/towerco/agencies',
        color: 'text-black',
        bg: 'bg-[#00b4d8]',
        ring: 'ring-indigo-600'
    },
    {
        key: 'patrol-officers',
        label: 'Patrolling Officers',
        count: counts.total_patrol_officers_count,
        description: 'Team leaders managing guards',
        icon: UserCheck,
        href: '#',
        color: 'text-black',
        bg: 'bg-[#00b4d8]',
        ring: 'ring-cyan-600'
    },
    {
        key: 'guards',
        label: 'Guards',
        count: counts.total_guards_count,
        description: 'Personnel across all agencies',
        icon: Users,
        href: '#',
        color: 'text-white',
        bg: 'bg-[#1b2a41]',
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
              tabIndex={item.href !== '#' ? 0 : -1}
              className={cn(
                'flex items-center gap-4 rounded-lg p-4 transition-all hover:shadow-md',
                item.bg,
                item.href !== '#' ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
            >
              <item.icon className={cn('h-8 w-8', item.color)} />
              <div>
                <p className={cn('font-semibold', item.color)}>{item.label}</p>
                <p className={cn("text-2xl font-bold", item.color)}>{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
