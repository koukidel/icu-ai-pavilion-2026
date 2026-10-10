'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { NavigationHeader } from './NavigationHeader';

export const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isProjector = pathname === '/projector';

  if (isProjector) {
    return <div className="min-h-screen bg-chalk-bg">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-paper flex justify-center">
      {/* Mobile-First Frame: Exactly 390px-430px wide, centered on larger screens */}
      <div className="w-full max-w-md min-h-screen bg-paper-light border-x border-teal/15 shadow-2xl flex flex-col relative overflow-x-hidden">
        <NavigationHeader />
        <div className="flex-1 flex flex-col pb-6">{children}</div>
      </div>
    </div>
  );
};
