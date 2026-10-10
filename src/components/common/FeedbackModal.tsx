'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Check, X, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [favoriteZone, setFavoriteZone] = useState<string>('work');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedbackData = {
      rating,
      favoriteZone,
      comment,
      submittedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('icu_ai_pavilion_feedback', JSON.stringify(feedbackData));
      fetch('/api/classroom/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FEEDBACK_SUBMITTED',
          payload: {
            rating,
            favoriteZone,
            commentPreview: comment.slice(0, 40),
          },
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-paper rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-teal/20 relative space-y-4 text-ink">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-ink/60 hover:text-ink hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">
              ご協力ありがとうございました！
            </h3>
            <p className="text-xs text-ink/70">
              いただいた感想は今後の企画の参考にさせていただきます。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-light text-teal-dark text-[10px] font-bold border border-teal/20">
                1分アンケート
              </span>
              <h2 className="text-base font-extrabold text-ink mt-1">
                パビリオンはいかがでしたか？
              </h2>
              <p className="text-xs text-ink/70 mt-0.5">
                簡単なご感想をお聞かせください。
              </p>
            </div>

            {/* Star Rating */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink/70">
                全体の感想
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform active:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-ink/20'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold ml-2 text-ink/80">
                  {rating === 5
                    ? 'とても楽しかった'
                    : rating === 4
                    ? '楽しかった'
                    : rating === 3
                    ? '普通'
                    : 'いまいち'}
                </span>
              </div>
            </div>

            {/* Favorite Zone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink/70">
                一番楽しかったコーナー
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'work', label: 'WORK（将来の仕事）' },
                  { id: 'make', label: 'MAKE（ゲームづくり）' },
                  { id: 'self', label: 'SELF（3Dアバター）' },
                  { id: 'care', label: 'CARE（LOVOT写真）' },
                ].map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setFavoriteZone(zone.id)}
                    className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                      favoriteZone === zone.id
                        ? 'border-teal bg-teal-light text-teal-dark font-bold shadow-xs'
                        : 'border-teal/20 bg-white/70 text-ink/80 hover:bg-white'
                    }`}
                  >
                    {zone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink/70">
                感想や気になったところ（自由記入）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="楽しかったこと、もっとこうしてほしい点など"
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-teal/20 bg-white text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-teal"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-teal text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-teal-dark active:scale-[0.98] transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              送信する
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
