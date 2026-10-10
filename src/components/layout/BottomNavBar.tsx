'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import {
  Home,
  Briefcase,
  Gamepad2,
  User,
  Heart,
  Sparkles,
} from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const pathname = usePathname();
  const { isZoneCompleted } = usePavilionSession();

  if (pathname === '/projector') {
    return null;
  }

  const navItems = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/work', label: 'WORK', icon: Briefcase, completed: isZoneCompleted('work') },
    { href: '/make', label: 'MAKE', icon: Gamepad2, completed: isZoneCompleted('make') },
    { href: '/self', label: 'SELF', icon: User, completed: isZoneCompleted('self') },
    { href: '/care', label: 'CARE', icon: Heart, completed: isZoneCompleted('care') },
    { href: '/passport', label: '箱庭', icon: Sparkles },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-light/95 backdrop-blur-md border-t border-teal/20 pb-safe shadow-lg">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
                isActive
                  ? 'text-teal-dark font-bold'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-dark scale-110' : 'text-ink/60'}`} />
                {item.completed && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose ring-1 ring-white" />
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
