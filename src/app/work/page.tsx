'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { WorkMode, TaskCard, WorkResult } from '@/types/pavilion';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  Bot,
  GraduationCap,
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  Heart,
  Cpu,
  RefreshCw,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default function WorkZonePage() {
  const router = useRouter();
  const { work, setWork } = usePavilionSession();

  const [mode, setMode] = useState<WorkMode>('student');
  const [step, setStep] = useState<'intro' | 'dialogue' | 'swipe' | 'result'>(
    work ? 'result' : 'intro'
  );

  const [interestInput, setInterestInput] = useState('');
  const [dialogueHistory, setDialogueHistory] = useState<
    Array<{ role: 'ai' | 'user'; text: string }>
  >([]);
  const [currentAiQuestion, setCurrentAiQuestion] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userReply, setUserReply] = useState('');

  const [taskCards, setTaskCards] = useState<TaskCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [delegatedCards, setDelegatedCards] = useState<TaskCard[]>([]);
  const [keptCards, setKeptCards] = useState<TaskCard[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<WorkResult | null>(work);

  const suggestionChips = {
    kids: ['ゲーム作り', '相棒ロボット', '動物の観察', 'お絵かき', '宇宙探検'],
    student: ['哲学・倫理の対話', '心理学とAI', '社会課題のデザイン', '言語と翻訳', '環境テクノロジー'],
    pro: ['アーキテクチャ設計', '組織開発・対話', '新規事業コンセプト', 'データ意思決定', 'クリエイティブ統括'],
  };

  const handleStartDialogue = async () => {
    if (!interestInput.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_question',
          mode,
          userInterest: interestInput,
          dialogueHistory: [],
        }),
      });
      const data = await res.json();
      setCurrentAiQuestion(data.question);
      setDialogueHistory([
        { role: 'user', text: interestInput },
        { role: 'ai', text: data.question },
      ]);
      setTurnCount(1);
      setStep('dialogue');
    } catch {
      const q = `「${interestInput}」について、あなたが最も熱中する瞬間と、AIに手伝ってほしい作業は何ですか？`;
      setCurrentAiQuestion(q);
      setDialogueHistory([
        { role: 'user', text: interestInput },
        { role: 'ai', text: q },
      ]);
      setTurnCount(1);
      setStep('dialogue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendDialogueReply = async () => {
    if (!userReply.trim() || isLoading) return;
    setIsLoading(true);

    const nextHistory = [
      ...dialogueHistory,
      { role: 'user' as const, text: userReply },
    ];
    setUserReply('');

    if (turnCount === 1) {
      try {
        const res = await fetch('/api/gemini/work', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_question',
            mode,
            userInterest: interestInput,
            dialogueHistory: nextHistory,
          }),
        });
        const data = await res.json();
        setCurrentAiQuestion(data.question);
        setDialogueHistory([...nextHistory, { role: 'ai', text: data.question }]);
        setTurnCount(2);
      } catch {
        const q = `なるほど。もしその作業をAIが完璧に代替したとき、あなたが「人間として誇りを持ち続けたい領域」はどこでしょうか？`;
        setCurrentAiQuestion(q);
        setDialogueHistory([...nextHistory, { role: 'ai', text: q }]);
        setTurnCount(2);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch('/api/gemini/work', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_cards',
            mode,
            userInterest: interestInput,
          }),
        });
        const data = await res.json();
        setTaskCards(data.cards);
        setStep('swipe');
      } catch {
        setTaskCards([]);
        setStep('swipe');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSwipeCard = async (decision: 'delegate' | 'keep') => {
    const card = taskCards[currentCardIndex];
    if (!card) return;

    let nextDelegated = [...delegatedCards];
    let nextKept = [...keptCards];

    if (decision === 'delegate') {
      nextDelegated.push(card);
      setDelegatedCards(nextDelegated);
    } else {
      nextKept.push(card);
      setKeptCards(nextKept);
    }

    if (currentCardIndex + 1 < taskCards.length) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsLoading(true);
      try {
        const res = await fetch('/api/gemini/work', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'finalize_diagnosis',
            mode,
            userInterest: interestInput,
            delegatedCount: nextDelegated.length,
            keptCount: nextKept.length,
          }),
        });
        const data = await res.json();
        const finalResult: WorkResult = {
          mode,
          userInterest: interestInput,
          futureTitle: data.futureTitle,
          workStyle: data.workStyle,
          synergyRatio: data.synergyRatio,
          delegatedCards: nextDelegated,
          keptCards: nextKept,
          feedbackSummary: data.feedbackSummary,
        };
        setDiagnosisResult(finalResult);
        setWork(finalResult);
        setStep('result');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-24 select-none">
      {/* Mode Selector Pill Bar */}
      <div className="p-1 rounded-full bg-white border border-black/[0.06] shadow-xs flex items-center justify-between">
        {[
          { id: 'kids' as WorkMode, title: 'キッズ探検', icon: Bot },
          { id: 'student' as WorkMode, title: 'スチューデント', icon: GraduationCap },
          { id: 'pro' as WorkMode, title: 'プロフェッショナル', icon: Briefcase },
        ].map((m) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-teal text-white shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: INTRO & INTEREST INPUT */}
      {step === 'intro' && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-light text-teal-dark flex items-center justify-center mx-auto text-2xl">
                💼
              </div>
              <h1 className="text-lg font-bold text-ink">
                思考と仕事の棚卸し
              </h1>
              <p className="text-xs text-ink/70">
                いま夢中になっているテーマを入力してください
              </p>
            </div>

            <textarea
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              rows={3}
              placeholder="例：デザインとコードをつなぐこと、心理学の対話..."
              className="w-full p-3 rounded-2xl border border-teal/20 bg-paper-light text-ink text-xs focus:outline-none focus:ring-2 focus:ring-teal/40"
            />

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestionChips[mode].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setInterestInput(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-ink/80 font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartDialogue}
              disabled={!interestInput.trim() || isLoading}
              className="w-full py-3 rounded-2xl bg-teal text-white font-bold text-xs hover:bg-teal-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isLoading ? '対話を準備中...' : 'AIとの深層対話をはじめよう'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SOCRATIC DIALOGUE */}
      {step === 'dialogue' && (
        <div className="space-y-3 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs px-1 text-ink/60">
            <span>深層対話: 質問 {turnCount} / 2</span>
            <span className="font-bold text-teal-dark">Socratic Mirror</span>
          </div>

          <div className="space-y-2.5 p-3.5 rounded-3xl bg-white border border-black/[0.06] shadow-sm max-h-[360px] overflow-y-auto">
            {dialogueHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  item.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {item.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-teal-light text-teal-dark flex items-center justify-center shrink-0 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    item.role === 'user'
                      ? 'bg-teal text-white rounded-tr-xs'
                      : 'bg-paper-light border border-black/[0.04] text-ink rounded-tl-xs'
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick reply chips */}
          <div className="flex flex-wrap gap-1 px-1">
            {[
              '本質的なアイデアを構想する時間',
              '人との温度ある対話',
              '細部の美意識を磨き上げる瞬間',
            ].map((txt) => (
              <button
                key={txt}
                onClick={() => setUserReply(txt)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-black/[0.08] text-ink/80 hover:bg-neutral-100"
              >
                {txt}
              </button>
            ))}
          </div>

          {/* Floating Bottom Prompt Bar for Dialogue */}
          <div className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40">
            <div className="p-2 rounded-2xl bg-white border border-black/[0.08] shadow-[0_10px_35px_rgb(0,0,0,0.12)] flex items-center gap-1.5">
              <input
                type="text"
                value={userReply}
                onChange={(e) => setUserReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendDialogueReply()}
                placeholder="あなたの考え・答えを入力..."
                className="flex-1 min-w-0 bg-transparent text-xs text-ink placeholder:text-ink/40 focus:outline-none px-2"
              />
              <button
                onClick={handleSendDialogueReply}
                disabled={!userReply.trim() || isLoading}
                className="w-8 h-8 rounded-full bg-teal disabled:opacity-40 hover:bg-teal-dark text-white flex items-center justify-center shrink-0 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: TACTILE CARD SWIPING */}
      {step === 'swipe' && taskCards.length > 0 && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-teal-dark">
              タスク仕分け: {currentCardIndex + 1} / {taskCards.length}
            </span>
            <span className="text-[11px] text-ink/60">
              委譲: {delegatedCards.length}枚 | 保持: {keptCards.length}枚
            </span>
          </div>

          {/* Tactile Card Deck */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-festive min-h-[220px] flex flex-col justify-between text-center relative overflow-hidden">
            <div className="inline-block mx-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-light text-teal-dark">
              TASK #{currentCardIndex + 1}
            </div>

            <div className="my-3 space-y-1">
              <h2 className="text-lg font-bold text-ink">
                {taskCards[currentCardIndex].label}
              </h2>
              <p className="text-xs text-ink/75 max-w-xs mx-auto leading-relaxed">
                {taskCards[currentCardIndex].description}
              </p>
            </div>

            <div className="text-[10px] text-ink/40">
              左右のボタンで箱へ仕分けしてください
            </div>
          </div>

          {/* Action buttons (Swipe alternatives) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSwipeCard('keep')}
              className="p-3.5 rounded-2xl border border-rose/30 bg-rose-light/60 hover:bg-rose-light text-rose-dark font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose" />
              <span>自分が抱きしめる</span>
              <span className="text-[9px] font-normal text-rose-dark/80">（人間が手放さないコア）</span>
            </button>

            <button
              onClick={() => handleSwipeCard('delegate')}
              className="p-3.5 rounded-2xl border border-teal/30 bg-teal-light/60 hover:bg-teal-light text-teal-dark font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95"
            >
              <Cpu className="w-4 h-4 text-teal" />
              <span>AIに委ねる箱</span>
              <span className="text-[9px] font-normal text-teal-dark/80">（AIの知性に任せる）</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULT */}
      {step === 'result' && diagnosisResult && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-festive space-y-3 text-center">
            <span className="text-[10px] font-bold text-rose px-2.5 py-0.5 rounded-full bg-rose-light uppercase font-mono">
              2030年の共創型肩書
            </span>

            <h2 className="text-xl font-extrabold text-teal-dark">
              「{diagnosisResult.futureTitle}」
            </h2>

            {/* Synergy Meter */}
            <div className="space-y-1 p-3 rounded-2xl bg-paper-light border border-teal/20 text-left">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-rose">人間: {100 - diagnosisResult.synergyRatio}%</span>
                <span className="text-teal-dark">AI委譲: {diagnosisResult.synergyRatio}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-rose/20 overflow-hidden flex">
                <div
                  className="h-full bg-rose transition-all"
                  style={{ width: `${100 - diagnosisResult.synergyRatio}%` }}
                />
                <div
                  className="h-full bg-teal transition-all"
                  style={{ width: `${diagnosisResult.synergyRatio}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-ink/80 leading-relaxed text-left">
              {diagnosisResult.feedbackSummary}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setStep('intro');
                setInterestInput('');
              }}
              className="flex-1 py-3 rounded-2xl bg-white border border-black/[0.08] text-ink text-xs font-bold hover:bg-neutral-50 flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal" />
              <span>再診断</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1 shadow-sm"
            >
              <span>ゾーン一覧へ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
