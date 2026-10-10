'use client';

import React from 'react';
import { ExternalLink, GraduationCap } from 'lucide-react';

export const GeminiStudentBanner: React.FC = () => {
  return (
    <aside
      aria-label="学生向けGemini特典案内"
      className="p-4 rounded-2xl border border-blue-500/20 bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-white text-ink shadow-xs relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              <GraduationCap className="w-3 h-3" />
              学生のみなさんへ
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">Gemini活用ガイド</span>
          </div>
          <h4 className="text-xs font-bold text-ink">
            Google Gemini は無料で使えます
          </h4>
          <p className="text-[11px] text-ink/70 leading-relaxed">
            Googleアカウントがあれば、レポートの調べものやアイデア出し、英語の翻訳など、毎日の勉強に役立つAIをいつでも無料で利用できます。
          </p>
        </div>

        <a
          href="https://gemini.google.com/app"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
        >
          <span>Geminiを開く</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="mt-2.5 pt-2 border-t border-blue-500/10 flex items-center justify-between text-[10px] text-ink/60">
        <span>大学のアカウントでもそのまま使えます</span>
        <a
          href="https://one.google.com/explore-plan/gemini-advanced"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline flex items-center gap-0.5"
        >
          <span>Advancedプランの詳細</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </aside>
  );
};
