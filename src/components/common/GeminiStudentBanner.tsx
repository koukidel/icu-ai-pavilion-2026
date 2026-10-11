'use client';

import React, { useState } from 'react';
import { ExternalLink, GraduationCap, Copy, Check, Sparkles } from 'lucide-react';

const GEMINI_STUDENT_URL =
  'https://gemini.google/students/?utm_source=social&utm_medium=social&utm_campaign=microsite_campus_jp-campuscommunity-signupchallengeteam13';

export const GeminiStudentBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GEMINI_STUDENT_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = GEMINI_STUDENT_URL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (compact) {
    return (
      <div className="p-3 rounded-2xl border border-blue-500/25 bg-linear-to-r from-blue-50/80 to-indigo-50/80 text-ink shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-ink truncate">
              学生向け Gemini 特別特典リンク
            </div>
            <div className="text-[10px] text-blue-700 truncate">
              レポート・学習に役立つAIキャンペーン
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-blue-500/30 bg-white text-blue-700 hover:bg-blue-50 text-[11px] font-bold transition-all"
            title="リンクをコピー"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={GEMINI_STUDENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95"
          >
            <span>開く</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="学生向けGemini特典案内"
      className="p-4 rounded-3xl border border-blue-500/25 bg-linear-to-br from-blue-50/90 via-indigo-50/70 to-white text-ink shadow-sm relative overflow-hidden space-y-2.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
              <GraduationCap className="w-3 h-3" />
              学生限定キャンペーン
            </span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-100/80 px-2 py-0.5 rounded-full">
              Team 13
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-ink leading-snug">
            Google Gemini 学生向け特別特典リンク
          </h4>
          <p className="text-[11px] text-ink/75 leading-relaxed">
            ICU生・学生のみなさんへ。レポートの作成や論文の要約、英語の翻訳など、日々の大学生活や学習に役立つGoogle Geminiの公式学生キャンペーンです。
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <a
          href={GEMINI_STUDENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm transition-all text-center"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>学生特典ページを開く</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>

        <button
          onClick={handleCopy}
          className="py-2.5 px-3.5 rounded-2xl border border-blue-500/30 bg-white hover:bg-blue-50/60 active:scale-98 text-blue-800 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">コピー完了</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>URLをコピー</span>
            </>
          )}
        </button>
      </div>

      <div className="pt-2 border-t border-blue-500/15 flex items-center justify-between text-[10px] text-ink/60">
        <span>大学アカウントやGoogleアカウントで登録可能</span>
        <span className="text-blue-700 font-mono">gemini.google/students</span>
      </div>
    </aside>
  );
};
