'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Camera, Smartphone, Lock, CheckCircle2, X } from 'lucide-react';

interface PrivacyOnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY = 'icu_privacy_agreed_2026';

export const PrivacyOnboardingModal: React.FC<PrivacyOnboardingModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const agreed = localStorage.getItem(STORAGE_KEY);
      if (!agreed) {
        // Small delay for smooth appearance after initial page mount
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [forceOpen]);

  const handleAgree = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleManualClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-paper rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-teal/20 relative space-y-4 text-ink max-h-[90vh] overflow-y-auto">
        {/* Close button (only shown when reopened manually) */}
        {forceOpen && (
          <button
            onClick={handleManualClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-ink/60 hover:text-ink hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-light text-teal-dark text-[10px] font-bold border border-teal/20">
            <ShieldCheck className="w-3 h-3 text-teal" />
            安心・安全のお約束
          </div>
          <h2 className="text-base font-extrabold text-ink leading-snug">
            個人情報の取り扱いについて
          </h2>
          <p className="text-xs text-ink/70 leading-relaxed">
            パビリオンを安心してお楽しみいただくため、データの取り扱いについてご案内します。
          </p>
        </div>

        {/* 3 Key Points */}
        <div className="space-y-2.5">
          {/* Point 1: Photos */}
          <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-dark">
              <Camera className="w-3.5 h-3.5 text-teal" />
              <span>写真や画像はサーバーに保存されません</span>
            </div>
            <p className="text-[11px] text-ink/75 leading-relaxed">
              アバターづくりやLOVOT撮影で使用した写真は、お客様のスマートフォン内（ブラウザ）でのみ扱われます。パビリオンのサーバー等に写真が保存・送信されることは一切ありません。
            </p>
          </div>

          {/* Point 2: Input Text & Local Storage */}
          <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-dark">
              <Smartphone className="w-3.5 h-3.5 text-teal" />
              <span>入力した内容はスマホ内だけに保存されます</span>
            </div>
            <p className="text-[11px] text-ink/75 leading-relaxed">
              診断で選んだ選択肢や入力内容は、お使いの端末に一時的に保存されます。体験終了時やホーム画面下の「データを消す」ボタンから、いつでもご自身で全消去できます。
            </p>
          </div>

          {/* Point 3: No Login Required */}
          <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-dark">
              <Lock className="w-3.5 h-3.5 text-teal" />
              <span>アカウント登録やログインは不要です</span>
            </div>
            <p className="text-[11px] text-ink/75 leading-relaxed">
              お名前やメールアドレス等の個人情報の登録は一切不要です。どなたでも完全匿名で安全にお楽しみいただけます。
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={handleAgree}
            className="w-full py-3 px-4 rounded-2xl bg-teal hover:bg-teal-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>確認して体験をはじめる</span>
          </button>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-ink/50">
            ICU祭 AIパビリオン 2026 企画運営チーム
          </span>
        </div>
      </div>
    </div>
  );
};
