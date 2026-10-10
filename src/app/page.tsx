'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { GeminiStudentBanner } from '@/components/common/GeminiStudentBanner';
import { FeedbackModal } from '@/components/common/FeedbackModal';
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
  MessageSquare,
} from 'lucide-react';

export default function MobileHubPage() {
  const router = useRouter();
  const { work, make, self, care, isZoneCompleted, completedZonesCount, resetSession } =
    usePavilionSession();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const zones = [
    {
      id: 'work',
      number: '01',
      title: 'WORK',
      subtitle: '思考とキャリア鏡像',
      catchphrase: '2030年の共創肩書 ＆ 深層コーチング',
      description: '日々のタスクを分解し、外部AIで深掘りできるキャリアプロンプトを導出します。',
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
      catchphrase: 'Claude / ChatGPTで動くWebゲーム制作',
      description: 'アイデアからゲーム仕様を選定。Claude Artifacts等で即動くコードを生成します。',
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
      subtitle: '3Dアバター工房',
      catchphrase: 'ピクサー調・サイバー等の立体分身',
      description: '自撮り写真と選んだスタイルから、高品質な3Dアバター生成プロンプトを作成します。',
      href: '/self',
      icon: User,
      color: 'violet',
      badge: 'Alter Ego',
      iconBg: 'bg-violet-light text-violet',
      completed: isZoneCompleted('self'),
      resultBadge: self ? 'アバター完成' : undefined,
    },
    {
      id: 'care',
      number: '04',
      title: 'CARE',
      subtitle: 'LOVOT写真工房',
      catchphrase: '展示ロボット × あなたの世界観',
      description: 'ブースのLOVOTを撮影し、Instagram等で映えるエモーショナルな写真を生成します。',
      href: '/care',
      icon: Heart,
      color: 'emerald',
      badge: 'LOVOT Studio',
      iconBg: 'bg-emerald-50 text-emerald-800',
      completed: isZoneCompleted('care'),
      resultBadge: care ? '撮影完了' : undefined,
    },
  ];

  return (
    <main className="p-4 space-y-4 pb-24 text-ink">
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
          パビリオンで嗜好を選ぶと、専門的に調律された<strong>プロンプト</strong>が生成されます。ChatGPTやGeminiに送って、あなたのスマートフォン上で本物の生成AIのパワーを解き放ちましょう。
        </p>
      </section>

      {/* Zone Selection Cards (The 4 Distinct Choices) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-teal-dark tracking-wider uppercase font-sans">
            体験ゾーンを選択
          </span>
          <span className="text-[11px] text-ink/60">自由巡回（全4ゾーン）</span>
        </div>

        <div className="space-y-2.5">
          {zones.map((zone) => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.id}
                onClick={() => router.push(zone.href)}
                className="group relative p-4 rounded-3xl bg-white border border-black/[0.06] hover:border-teal/40 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-festive cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${zone.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-teal-dark tracking-widest">
                          ZONE {zone.number}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-paper font-sans text-ink/60 border border-teal/15 font-semibold">
                          {zone.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-ink flex items-center gap-1.5">
                        <span>{zone.title}</span>
                        <span className="text-xs font-normal text-ink/60">
                          {zone.subtitle}
                        </span>
                      </h3>

                      <p className="text-xs font-bold text-teal-dark">
                        {zone.catchphrase}
                      </p>
                      <p className="text-[11px] text-ink/70 leading-relaxed pt-0.5">
                        {zone.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pt-1">
                    {zone.completed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        体験済
                      </span>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-paper-light group-hover:bg-teal group-hover:text-white flex items-center justify-center text-ink/50 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {zone.resultBadge && (
                  <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                    <span className="text-ink/60">記録データ:</span>
                    <span className="font-bold text-teal-dark truncate max-w-[200px]">
                      {zone.resultBadge}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Gemini Student Benefit Banner */}
      <GeminiStudentBanner />

      {/* Classroom Projector Banner */}
      <section className="p-3.5 rounded-2xl bg-chalk-bg text-chalk-white border border-teal/40 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-chalk-surface flex items-center justify-center text-chalk-yellow">
            <Tv2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              教室の黒板スクリーン投影中
            </div>
            <div className="text-[10px] text-chalk-white/70">
              来場者全員の共創データが集う巨大モニター
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

      {/* Feedback Survey Button */}
      <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal" />
          <div className="text-xs font-bold text-ink">パビリオンのアンケート</div>
        </div>
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="px-3 py-1 rounded-xl bg-teal-light text-teal-dark text-xs font-bold hover:bg-teal hover:text-white transition-colors"
        >
          回答する（1分）
        </button>
      </div>

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
                  {completedZonesCount}/4
                </span>
              </div>
              <div className="text-[10px] text-ink/60">
                {completedZonesCount === 4
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </main>
  );
}
