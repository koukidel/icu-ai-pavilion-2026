'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import {
  Briefcase,
  Gamepad2,
  User,
  Heart,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Tv2,
  RotateCcw,
} from 'lucide-react';

export default function MobileHubPage() {
  const router = useRouter();
  const { work, make, self, care, isZoneCompleted, completedZonesCount, resetSession } =
    usePavilionSession();

  const zones = [
    {
      id: 'work',
      number: '01',
      title: 'WORK',
      subtitle: '思考と仕事の棚卸し',
      catchphrase: 'AIに委ねる箱、自分が抱きしめる箱',
      description: '日々のタスクを分解し、2030年の共創型肩書を導出します。',
      href: '/work',
      icon: Briefcase,
      color: 'teal',
      badge: 'Blue Career Mirror',
      iconBg: 'bg-teal-light text-teal-dark',
      completed: isZoneCompleted('work'),
      resultBadge: work?.futureTitle,
    },
    {
      id: 'make',
      number: '02',
      title: 'MAKE',
      subtitle: '言葉と絵のゲーム工房',
      catchphrase: '5つのミニゲームをつくる・あそぶ',
      description: 'アイデアから即座にミニゲームを生成。黒板スクリーンにも届きます。',
      href: '/make',
      icon: Gamepad2,
      color: 'rose',
      badge: 'Prompt-to-Play',
      iconBg: 'bg-rose-light text-rose-dark',
      completed: isZoneCompleted('make'),
      resultBadge: make?.title,
    },
    {
      id: 'self',
      number: '03',
      title: 'SELF',
      subtitle: '分身アバターと自己対話',
      catchphrase: '顔写真から3Dデフォルメアバターを生成',
      description: '自撮り写真からあなたの3D分身を創り、未来への宣言を紡ぎます。',
      href: '/self',
      icon: User,
      color: 'violet',
      badge: 'Alter Ego',
      iconBg: 'bg-violet-light text-violet',
      completed: isZoneCompleted('self'),
      resultBadge: self ? 'アバター完成' : undefined,
    },
  ];

  return (
    <main className="p-4 space-y-5 pb-24">
      {/* Welcome Hero Card */}
      <section className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper text-teal-dark text-[11px] font-bold border border-teal/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose animate-ping" />
            パビリオン受付完了
          </span>
          <span className="text-[10px] font-mono text-ink/50 uppercase">ICU FES 2026</span>
        </div>

        <h1 className="text-2xl font-extrabold text-ink leading-tight pt-1">
          AIに、<span className="text-teal-dark">出会い</span>
          <span className="text-rose">直す。</span>
        </h1>

        <p className="text-xs text-ink/75 leading-relaxed">
          気になるゾーンをタップして体験を始めましょう。どの順番からでも巡回できます。体験したデータは最後に1枚の「箱庭パスポート」に統合されます。
        </p>
      </section>

      {/* Zone Selection Cards (The 4 Distinct Choices) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-teal-dark tracking-wider uppercase font-sans">
            体験ゾーンを選択
          </span>
          <span className="text-[11px] text-ink/60">自由巡回（全3ゾーン）</span>
        </div>

        <div className="space-y-3">
          {zones.map((zone) => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.id}
                onClick={() => router.push(zone.href)}
                className="group relative p-4 rounded-3xl bg-white border border-black/[0.06] hover:border-teal/40 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-festive cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl ${zone.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-ink/40">
                          {zone.number}
                        </span>
                        <h2 className="text-base font-bold text-ink leading-tight">
                          {zone.title}
                        </h2>
                      </div>

                      {zone.completed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose px-2 py-0.5 rounded-full bg-rose-light border border-rose/30">
                          <CheckCircle2 className="w-3 h-3 text-rose fill-rose/20" />
                          完了
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-ink/50 px-2 py-0.5 rounded-full bg-neutral-100">
                          未体験
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-teal-dark">
                      {zone.subtitle}
                    </p>

                    <p className="text-[11px] text-ink/70 mt-1 line-clamp-2 leading-relaxed">
                      {zone.catchphrase}
                    </p>

                    {zone.resultBadge && (
                      <div className="mt-2 text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-paper-light border border-teal/20 text-ink font-semibold">
                        <span>獲得:</span>
                        <span className="text-teal-dark truncate max-w-[180px]">
                          {zone.resultBadge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="self-center pl-1 text-ink/30 group-hover:text-teal group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Classroom Blackboard Banner */}
      <section className="p-3.5 rounded-2xl bg-chalk-bg text-chalk-white border border-teal/40 flex items-center justify-between gap-3 shadow-chalkglow">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-chalk-teal/20 flex items-center justify-center shrink-0">
            <Tv2 className="w-4 h-4 text-chalk-teal" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-chalk-yellow uppercase">
              Classroom Screen
            </div>
            <div className="text-xs font-bold text-white">
              教室の黒板スクリーン投影中
            </div>
          </div>
        </div>
        <Link
          href="/projector"
          target="_blank"
          className="px-3 py-1.5 rounded-xl bg-chalk-teal text-chalk-bg font-bold text-[11px] whitespace-nowrap hover:bg-teal-light transition-colors"
        >
          黒板を開く
        </Link>
      </section>

      {/* Reset footer */}
      <footer className="pt-2 text-center">
        <button
          onClick={() => {
            if (confirm('体験データをすべてリセットしますか？')) {
              resetSession();
            }
          }}
          className="text-[11px] text-ink/50 hover:text-rose transition-colors inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          体験データをリセット（プライバシー保護）
        </button>
      </footer>

      {/* Floating Bottom Dock: Hakoniwa Passport */}
      <div className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40">
        <Link
          href="/passport"
          className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-black/[0.08] shadow-[0_10px_35px_rgb(0,0,0,0.12)] flex items-center justify-between gap-3 hover:border-rose/40 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose to-teal flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-yellow" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-ink flex items-center gap-1.5">
                <span>箱庭パスポート</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose text-white">
                  {completedZonesCount}/3
                </span>
              </div>
              <div className="text-[10px] text-ink/60">
                {completedZonesCount === 3
                  ? '完全版パスポートが発行可能です！'
                  : '体験したゾーンが集結します'}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-rose text-white text-xs font-bold flex items-center gap-1 shadow-sm">
            <span>開く</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </main>
  );
}
