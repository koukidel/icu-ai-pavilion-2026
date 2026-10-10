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
      subtitle: '将来の仕事さがし',
      catchphrase: 'AIと一緒に働く未来を考える',
      description: '好きなことや苦手なことを整理して、2030年のあなたにぴったりな働き方を見つけます。',
      href: '/work',
      icon: Briefcase,
      color: 'teal',
      badge: 'キャリア診断',
      iconBg: 'bg-teal-light text-teal-dark',
      completed: isZoneCompleted('work'),
      resultBadge: work?.futureTitle,
    },
    {
      id: 'make',
      number: '02',
      title: 'MAKE',
      subtitle: 'ゲームづくり',
      catchphrase: 'AIで自分だけのゲームをつくる',
      description: 'ルールやキャラクターを選ぶだけで、ブラウザですぐに遊べるゲームの指示文が作れます。',
      href: '/make',
      icon: Gamepad2,
      color: 'rose',
      badge: 'ゲーム制作',
      iconBg: 'bg-rose-light text-rose-dark',
      completed: isZoneCompleted('make'),
      resultBadge: make?.title,
    },
    {
      id: 'self',
      number: '03',
      title: 'SELF',
      subtitle: '3Dアバターづくり',
      catchphrase: 'かわいい立体キャラクターをつくる',
      description: 'ピクサー風やドット絵など、好きなスタイルであなただけのアバター画像を作ります。',
      href: '/self',
      icon: User,
      color: 'violet',
      badge: 'アバター',
      iconBg: 'bg-violet-light text-violet',
      completed: isZoneCompleted('self'),
      resultBadge: self ? 'アバター完成' : undefined,
    },
    {
      id: 'care',
      number: '04',
      title: 'CARE',
      subtitle: 'LOVOTと写真撮影',
      catchphrase: '展示ロボットと記念撮影',
      description: 'ブースのロボット（LOVOT）の写真を撮って、SNSに載せたくなる可愛い画像を作ります。',
      href: '/care',
      icon: Heart,
      color: 'emerald',
      badge: 'ロボット写真',
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
            パビリオンへようこそ
          </span>
          <span className="text-[10px] font-mono text-ink/50 uppercase">ICU FES 2026</span>
        </div>

        <h1 className="text-2xl font-extrabold text-ink leading-tight pt-1">
          AIに、<span className="text-teal-dark">出会い</span>
          <span className="text-rose">直す。</span>
        </h1>

        <p className="text-xs text-ink/75 leading-relaxed">
          好きなコーナーを選んで質問に答えると、AIへの上手な指示文（プロンプト）が作れます。普段使っているChatGPTやGeminiに送って、自分だけのゲームや3Dアバター作りを体験してみましょう。
        </p>
      </section>

      {/* Zone Selection Cards */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-teal-dark tracking-wider uppercase font-sans">
            体験コーナーを選ぶ
          </span>
          <span className="text-[11px] text-ink/60">どこからでも体験できます（全4コーナー）</span>
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
                    <span className="text-ink/60">体験結果:</span>
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
              教室のスクリーンにも投影中
            </div>
            <div className="text-[10px] text-chalk-white/70">
              みんなが体験したデータが集まる大きな画面です
            </div>
          </div>
        </div>
        <Link
          href="/projector"
          target="_blank"
          className="px-3 py-1.5 rounded-xl bg-chalk-teal text-chalk-bg font-bold text-[11px] whitespace-nowrap hover:bg-teal-light transition-colors"
        >
          スクリーンを開く
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
          データを消して最初からやり直す
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
                <span>体験パスポート</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose text-white">
                  {completedZonesCount}/4
                </span>
              </div>
              <div className="text-[10px] text-ink/60">
                {completedZonesCount === 4
                  ? 'すべてのコーナーを体験しました！'
                  : '体験した内容が1枚のカードにまとまります'}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-rose text-white text-xs font-bold flex items-center gap-1 shadow-sm">
            <span>見る</span>
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
