'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePavilionSession } from '@/context/SessionContext';
import { PassportData } from '@/types/pavilion';
import { HakoniwaDioramaCanvas } from '@/components/passport/HakoniwaDioramaCanvas';
import { FeedbackModal } from '@/components/common/FeedbackModal';
import { GeminiStudentBanner } from '@/components/common/GeminiStudentBanner';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  Tv2,
  CheckCircle2,
  Share2,
  MessageSquare,
} from 'lucide-react';

export default function PassportPage() {
  const {
    work,
    make,
    self,
    care,
    passport,
    setPassport,
    completedZonesCount,
  } = usePavilionSession();

  const [activePassport, setActivePassport] = useState<PassportData | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const newPass: PassportData = {
      id: passport?.id || `pass-${Date.now()}`,
      createdAt: passport?.createdAt || new Date().toISOString(),
      work: work || undefined,
      make: make || undefined,
      self: self || undefined,
      care: care || undefined,
    };
    setActivePassport(newPass);
    setPassport(newPass);
    confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
  }, [work, make, self, care]);

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-16 select-none text-ink">
      {/* Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-light text-rose-dark text-[11px] font-bold border border-rose/30">
          <Sparkles className="w-3.5 h-3.5 text-rose" />
          AI Co-existence Passport
        </div>
        <h1 className="text-xl font-extrabold text-ink tracking-tight">
          AI共創パスポート <span className="text-rose">「箱庭」</span>
        </h1>
        <p className="text-[11px] text-ink/70">
          全4ゾーンの体験が集結した世界にひとつだけのデジタルパスポート
        </p>
      </div>

      {/* Progress pill */}
      <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-xs flex items-center justify-between">
        <div className="text-xs">
          <span className="font-bold text-teal-dark">
            進捗: {completedZonesCount} / 4 ゾーン完了
          </span>
          <div className="text-[10px] text-ink/60">
            {completedZonesCount === 4
              ? '完全版パスポートが完成しました！'
              : '他のゾーンをめぐるとカードにデータが追加されます'}
          </div>
        </div>

        {completedZonesCount < 4 && (
          <div className="flex gap-1">
            {!work && (
              <Link
                href="/work"
                className="px-2 py-0.5 rounded-lg text-[10px] bg-paper border border-teal/30 text-teal-dark font-bold"
              >
                +WORK
              </Link>
            )}
            {!make && (
              <Link
                href="/make"
                className="px-2 py-0.5 rounded-lg text-[10px] bg-paper border border-rose/30 text-rose-dark font-bold"
              >
                +MAKE
              </Link>
            )}
            {!self && (
              <Link
                href="/self"
                className="px-2 py-0.5 rounded-lg text-[10px] bg-paper border border-violet/30 text-violet font-bold"
              >
                +SELF
              </Link>
            )}
            {!care && (
              <Link
                href="/care"
                className="px-2 py-0.5 rounded-lg text-[10px] bg-paper border border-emerald-500/30 text-emerald-800 font-bold"
              >
                +CARE
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Passport 9:16 Canvas */}
      {activePassport && <HakoniwaDioramaCanvas passport={activePassport} />}

      {/* Feedback Survey Button */}
      <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal" />
          <div>
            <div className="text-xs font-bold text-ink">パビリオンのアンケート</div>
            <div className="text-[10px] text-ink/60">1分で完了します。ぜひ感想をお聞かせください</div>
          </div>
        </div>
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-teal text-white text-xs font-bold hover:bg-teal-dark transition-colors shrink-0 shadow-2xs"
        >
          回答する
        </button>
      </div>

      {/* Gemini Student Benefit Banner */}
      <GeminiStudentBanner />

      {/* Blackboard Live notification */}
      <div className="p-3.5 rounded-2xl bg-chalk-bg text-chalk-white border border-teal/40 space-y-1.5 shadow-chalkglow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv2 className="w-4 h-4 text-chalk-yellow" />
            <span className="text-xs font-bold text-white">黒板スクリーン連動</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-chalk-rose/30 text-chalk-rose border border-chalk-rose/50 font-bold">
            LIVE STREAM
          </span>
        </div>
        <p className="text-[11px] text-chalk-white/80 leading-relaxed">
          完成した「箱庭パスポート」は教室の黒板スクリーンにも美しく舞い落ちて展示されます。
        </p>
        <Link
          href="/projector"
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-chalk-teal hover:underline"
        >
          <span>黒板シアターを確認する</span>
          <ArrowRight className="w-3 h-3" />
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
