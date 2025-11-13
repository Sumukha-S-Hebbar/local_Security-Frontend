
'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type Module = {
  name: string;
  key: string;
  href: string;
};

const allModules: Module[] = [
  { name: 'Terriq', key: 'realestate', href: '#' }, // Dynamic href
  { name: 'Fortiq', key: 'security', href: '#' }, // Href will be replaced by portal-specific home
  { name: 'Energy', key: 'energy', href: '#' },
  { name: 'Incident Management', key: 'incident management', href: '#' },
  { name: 'Preventive Maintenance', key: 'preventive maintenance', href: '#' },
  { name: 'Site Master', key: 'site master', href: '#' },
];

export function ModuleSwitcher({ portalHome }: { portalHome: '/agency/home' | '/towerco/home' }) {
  const pathname = usePathname();
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataString = localStorage.getItem('userData');
      setOrigin(window.location.origin);
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          const modules = userData?.user?.organization?.subscribed_modules || userData?.user?.subcontractor?.subscribed_modules || [];
          // Normalize to lowercase for case-insensitive comparison
          setEnabledModules(modules.map((m: string) => m.toLowerCase()));
        } catch (error) {
          console.error("Failed to parse user data for module switcher:", error);
          setEnabledModules([]);
        }
      }
    }
  }, []);

  const isModuleEnabled = (moduleKey: string) => {
    return enabledModules.includes(moduleKey.toLowerCase());
  };
  
  const getModuleHref = (module: Module) => {
    if (module.key === 'security') {
      return portalHome;
    }
    if (module.key === 'realestate') {
      return `${origin}/`;
    }
    return module.href;
  }

  const isSecurityModuleActive = () => {
      return pathname.startsWith('/agency') || pathname.startsWith('/towerco');
  }

  return (
    <div className="bg-background border-b h-12 flex items-center">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-center gap-4 sm:gap-6 text-sm h-full">
          {allModules.map((module) => {
            const enabled = isModuleEnabled(module.key);
            const isActive = module.key === 'security' && isSecurityModuleActive();

            return (
              <Link
                key={module.name}
                href={enabled ? getModuleHref(module) : '#'}
                className={cn(
                  'flex items-center px-3 font-semibold transition-colors h-full',
                  enabled
                    ? 'text-primary hover:text-[#ff8200]'
                    : 'text-muted-foreground/60 cursor-not-allowed',
                  isActive && 'text-destructive border-l border-r border-destructive',
                  !isActive && ''
                )}
                aria-disabled={!enabled}
                onClick={(e) => !enabled && e.preventDefault()}
              >
                {module.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
