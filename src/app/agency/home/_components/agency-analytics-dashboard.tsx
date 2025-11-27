
import Link from 'next/link';
import type { BasicCounts } from '../page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Building2, UserCheck, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AgencyAnalyticsDashboard({
  counts,
}: {
  counts: BasicCounts;
}) {
  const router = useRouter();

  const resourceCards = [
    {
      key: 'assigned_sites',
      label: 'Assigned Sites',
      count: counts.total_assigned_sites_count,
      description: 'Sites with assigned personnel',
      icon: Building2,
      href: '/agency/sites?tab=assigned',
      color: 'text-white',
      bg: 'bg-[#1b2a41]',
      ring: 'ring-purple-600'
    },
    {
      key: 'unassigned_sites',
      label: 'Unassigned Sites',
      count: counts.total_unassigned_sites_count,
      description: 'Sites needing personnel',
      icon: Building2,
      href: '/agency/sites?tab=unassigned',
      color: 'text-black',
      bg: 'bg-[#00b48d]',
      ring: 'ring-orange-600'
    },
    {
      key: 'patrol_officers',
      label: 'Patrolling Officers',
      count: counts.total_patrol_officers_count,
      description: 'Team leaders managing guards',
      icon: UserCheck,
      href: '/agency/patrolling-officers',
      color: 'text-black',
      bg: 'bg-[#00b48d]',
      ring: 'ring-cyan-600'
    },
    {
      key: 'guards',
      label: 'Guards',
      count: counts.total_guards_count,
      description: 'Personnel across all sites',
      icon: Users,
      href: '/agency/guards',
      color: 'text-white',
      bg: 'bg-[#1b2a41]',
      ring: 'ring-blue-600'
    },
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
                item.bg
              )}
            >
              <item.icon className={cn('h-8 w-8', item.color)} />
              <div>
                <p className={cn('font-semibold', item.color)}>{item.label}</p>
                <p className={cn('text-2xl font-bold', item.color)}>{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
