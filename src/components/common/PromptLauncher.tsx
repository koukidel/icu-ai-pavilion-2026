'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PromptLauncherProps {
  title: string;
  subtitle?: string;
  prompt: string;
  targetType: 'career' | 'avatar' | 'game' | 'photo';
  anatomy?: {
    role?: string;
    objective?: string;
    constraints?: string;
    outputFormat?: string;
  };
  userPreferences?: Record<string, any>;
  onPromptChange?: (newPrompt: string) => void;
  className?: string;
}

export const PromptLauncher: React.FC<PromptLauncherProps> = ({
  title,
  subtitle,
  prompt: initialPrompt,
  targetType,
  anatomy,
  userPreferences,
  onPromptChange,
  className = '',
}) => {
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setCurrentPrompt(initialPrompt);
  }, [initialPrompt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setCopied(true);
      showToast('指示文をコピーしました');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = currentPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showToast('指示文をコピーしました');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleLaunchChatGPT = () => {
    // Deep link with query parameter opens ChatGPT with prompt loaded in composer
    const url = `https://chatgpt.com/?q=${encodeURIComponent(currentPrompt)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLaunchGemini = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
    } catch {
      // ignore
    }
    showToast('コピー完了！Geminiが開いたら入力欄に「貼り付け」て送信してください');
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
  };

  const handleLaunchClaude = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
    } catch {
      // ignore
    }
    showToast('コピー完了！Claudeが開いたら入力欄に「貼り付け」て送信してください');
    window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer');
  };

  const handleEnhanceWithGemini = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: currentPrompt,
          targetType,
          userPreferences,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPrompt) {
          setCurrentPrompt(data.enhancedPrompt);
          if (onPromptChange) onPromptChange(data.enhancedPrompt);
          showToast('指示文をより詳しく整えました');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-teal/20 bg-paper-light p-4 space-y-3.5 shadow-sm text-ink ${className}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 p-3 bg-ink text-white rounded-xl shadow-2xl text-xs font-medium flex items-center justify-between border border-white/20 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-light text-teal-dark text-[10px] font-bold border border-teal/20">
            AIへの指示文（プロンプト）
          </span>
          <h3 className="text-sm font-bold text-ink mt-1">{title}</h3>
          {subtitle && <p className="text-xs text-ink/70 mt-0.5">{subtitle}</p>}
        </div>

        {/* Enhance Button */}
        <button
          onClick={handleEnhanceWithGemini}
          disabled={isEnhancing}
          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-teal/30 bg-white text-teal-dark hover:bg-teal-light transition-colors disabled:opacity-50 shadow-xs"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin text-teal' : 'text-teal-dark'}`} />
          {isEnhancing ? '調整中...' : '詳しくする'}
        </button>
      </div>

      {/* Prompt Display Box */}
      <div className="relative rounded-xl border border-teal/20 bg-white p-3 font-mono text-[11px] leading-relaxed text-ink/90 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
        {currentPrompt}
      </div>

      {/* Quick Copy & Word Count */}
      <div className="flex items-center justify-between text-[11px] text-ink/60">
        <span>{currentPrompt.length} 文字</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 font-bold text-teal-dark hover:text-teal transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">コピー完了</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>文章をコピー</span>
            </>
          )}
        </button>
      </div>

      {/* 1-Click Launchers into Consumer LLMs */}
      <div className="space-y-2 pt-1">
        <div className="text-[10px] font-bold tracking-wider text-ink/50">
          ワンタップでAIを開く
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* ChatGPT Button */}
          <button
            onClick={handleLaunchChatGPT}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 transition-all shadow-xs text-center group active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold mb-1 shadow-xs">
              GPT
            </div>
            <span className="text-[11px] font-bold">ChatGPT</span>
            <span className="text-[9px] text-emerald-700/80 mt-0.5">すぐ実行</span>
          </button>

          {/* Gemini Button */}
          <button
            onClick={handleLaunchGemini}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-500/20 bg-blue-50/60 hover:bg-blue-100/70 text-blue-900 transition-all shadow-xs text-center group active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold mb-1 shadow-xs">
              ✦
            </div>
            <span className="text-[11px] font-bold">Gemini</span>
            <span className="text-[9px] text-blue-700/80 mt-0.5">コピーして開く</span>
          </button>

          {/* Claude Button */}
          <button
            onClick={handleLaunchClaude}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-600/20 bg-amber-50/60 hover:bg-amber-100/70 text-amber-950 transition-all shadow-xs text-center group active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold mb-1 shadow-xs">
              C
            </div>
            <span className="text-[11px] font-bold">Claude</span>
            <span className="text-[9px] text-amber-800/80 mt-0.5">コピーして開く</span>
          </button>
        </div>
      </div>

      {/* Prompt Engineering Anatomy Accordion */}
      {anatomy && (
        <div className="border-t border-teal/15 pt-2">
          <button
            onClick={() => setIsAnatomyOpen(!isAnatomyOpen)}
            className="w-full flex items-center justify-between text-[11px] text-ink/70 hover:text-ink font-bold py-1"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal" />
              指示文の書き方のコツ
            </span>
            {isAnatomyOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isAnatomyOpen && (
            <div className="mt-2 space-y-2 p-3 rounded-xl bg-white/70 border border-teal/10 text-[10px] leading-relaxed">
              {anatomy.role && (
                <div>
                  <span className="font-bold text-teal-dark block">AIの役割（どんな立場で答えてもらうか）</span>
                  <span className="text-ink/80">{anatomy.role}</span>
                </div>
              )}
              {anatomy.objective && (
                <div>
                  <span className="font-bold text-teal-dark block">やってほしいこと</span>
                  <span className="text-ink/80">{anatomy.objective}</span>
                </div>
              )}
              {anatomy.constraints && (
                <div>
                  <span className="font-bold text-teal-dark block">守ってほしいルール</span>
                  <span className="text-ink/80">{anatomy.constraints}</span>
                </div>
              )}
              {anatomy.outputFormat && (
                <div>
                  <span className="font-bold text-teal-dark block">答え方の形式</span>
                  <span className="text-ink/80">{anatomy.outputFormat}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
