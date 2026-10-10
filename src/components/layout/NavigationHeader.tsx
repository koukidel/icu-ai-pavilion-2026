'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import {
  Sparkles,
  ArrowLeft,
  Tv2,
  CheckCircle2,
} from 'lucide-react';

export const NavigationHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { completedZonesCount, isZoneCompleted } = usePavilionSession();

  if (pathname === '/projector') {
    return null;
  }

  const isHome = pathname === '/';

  // Zone metadata for studio header
  const getZoneMeta = () => {
    if (pathname.startsWith('/work')) return { title: 'WORK スタジオ', badge: '01', zone: 'work' };
    if (pathname.startsWith('/make')) return { title: 'MAKE スタジオ', badge: '02', zone: 'make' };
    if (pathname.startsWith('/self')) return { title: 'SELF スタジオ', badge: '03', zone: 'self' };
    if (pathname.startsWith('/passport')) return { title: '箱庭パスポート', badge: 'FINAL', zone: null };
    return null;
  };

  const zoneMeta = getZoneMeta();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.06] shadow-xs px-4 py-2.5">
      {isHome ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose/15 flex items-center justify-center text-rose">
              <Sparkles className="w-4 h-4 text-rose" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-teal-dark font-sans uppercase">
                ICU FESTIVAL 2026
              </div>
              <div className="text-sm font-bold text-ink leading-tight flex items-center gap-1.5">
                AI Pavilion <span className="text-rose text-xs font-serif font-normal">BLUE ROSE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Projector icon */}
            <Link
              href="/projector"
              target="_blank"
              className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="教室黒板シアターを開く"
            >
              <Tv2 className="w-4 h-4 text-ink" />
            </Link>
          </div>
        </div>
      ) : (
        /* Studio Header: Clean '← 戻る', Title, and Completion Badge */
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ゾーン一覧</span>
          </button>

          <div className="text-center">
            <div className="text-xs font-bold text-ink flex items-center gap-1">
              <span>{zoneMeta?.title}</span>
              {zoneMeta?.zone && isZoneCompleted(zoneMeta.zone as any) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-rose fill-rose/20" />
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal/20">
              ZONE {zoneMeta?.badge}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
