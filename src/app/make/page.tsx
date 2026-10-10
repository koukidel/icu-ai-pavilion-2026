'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { EngineType, GameConfig } from '@/types/pavilion';
import { CanvasGameViewer } from '@/components/make/CanvasGameViewer';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Tv2,
  Share2,
  Send,
  Plus,
} from 'lucide-react';

export default function MakeZonePage() {
  const router = useRouter();
  const { make, setMake, publishGameToClassroom } = usePavilionSession();

  const [selectedEngine, setSelectedEngine] = useState<EngineType>(
    make?.engineType || 'flying'
  );
  const [charShape, setCharShape] = useState<'rose' | 'cat' | 'robot' | 'star' | 'bird'>(
    make?.characterShape || 'rose'
  );
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [activeConfig, setActiveConfig] = useState<GameConfig>(
    make || {
      id: 'default-game',
      title: '青いバラの空中散歩',
      engineType: 'flying',
      characterName: 'ブルーローズ',
      characterShape: 'rose',
      characterColor: '#dc4f89',
      themeName: 'Blue Rose Mystic',
      backgroundColor: '#0c1b24',
      speed: 5,
      gravity: 0.3,
      spawnRate: 75,
      specialRuleName: '花びらブースト',
      specialRuleDescription: '青い花びらを通過すると上昇気流が発生',
      createdAt: new Date().toISOString(),
    }
  );

  const engines: Array<{ id: EngineType; name: string; emoji: string }> = [
    { id: 'flying', name: '浮遊', emoji: '🕊️' },
    { id: 'fall_catch', name: 'キャッチ', emoji: '🧺' },
    { id: 'endless_run', name: 'ラン', emoji: '🏃' },
    { id: 'target_smash', name: '的当て', emoji: '🎯' },
    { id: 'balance_tower', name: 'タワー', emoji: '🧱' },
  ];

  const handleSelectEngine = (eng: EngineType) => {
    setSelectedEngine(eng);
    const updated = { ...activeConfig, engineType: eng };
    setActiveConfig(updated);
    setMake(updated);
  };

  const handlePromptSubmit = async () => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/make', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_game',
          prompt: promptText,
          engineType: selectedEngine,
        }),
      });
      const data = await res.json();
      const updated: GameConfig = {
        ...data.game,
        characterShape: charShape,
      };
      setActiveConfig(updated);
      setMake(updated);
      setPromptText('');
      confetti({ particleCount: 40, spread: 60 });
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-4 space-y-3 pb-24 select-none">
      {/* Engine Segmented Pill Bar */}
      <div className="p-1 rounded-full bg-white border border-black/[0.06] shadow-xs flex items-center justify-between overflow-x-auto">
        {engines.map((eng) => {
          const isSelected = selectedEngine === eng.id;
          return (
            <button
              key={eng.id}
              onClick={() => handleSelectEngine(eng.id)}
              className={`flex-1 py-1 px-2 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                isSelected
                  ? 'bg-rose text-white shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              <span>{eng.emoji}</span>
              <span>{eng.name}</span>
            </button>
          );
        })}
      </div>

      {/* Central Canvas Game Viewport */}
      <div className="rounded-3xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-3 flex flex-col items-center">
        <CanvasGameViewer config={activeConfig} />
      </div>

      {/* Character Motif Pill Selector */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-ink">主人公キャラクター</span>
          <span className="text-[10px] text-rose font-bold">
            {activeConfig.characterShape.toUpperCase()}
          </span>
        </div>

        <div className="flex justify-between gap-1.5">
          {[
            { id: 'rose' as const, emoji: '🌹', name: '青バラ' },
            { id: 'cat' as const, emoji: '🐱', name: '猫' },
            { id: 'robot' as const, emoji: '🤖', name: 'ロボ' },
            { id: 'star' as const, emoji: '⭐', name: 'スター' },
            { id: 'bird' as const, emoji: '🕊️', name: '小鳥' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCharShape(item.id);
                const updated = { ...activeConfig, characterShape: item.id };
                setActiveConfig(updated);
                setMake(updated);
              }}
              className={`flex-1 py-1.5 rounded-2xl border text-center transition-all ${
                charShape === item.id
                  ? 'bg-rose-light border-rose text-rose-dark font-bold shadow-2xs'
                  : 'bg-white border-black/[0.06] text-ink/70'
              }`}
            >
              <div className="text-base">{item.emoji}</div>
              <div className="text-[9px] mt-0.5">{item.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Classroom Blackboard Banner */}
      <div className="p-3 rounded-2xl bg-chalk-bg text-chalk-white border border-teal/40 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Tv2 className="w-4 h-4 text-chalk-yellow" />
          <span className="text-xs font-bold text-white">黒板スクリーンへ同時配信中</span>
        </div>
        <button
          onClick={() => publishGameToClassroom(activeConfig)}
          className="px-2.5 py-1 rounded-xl bg-chalk-surface hover:bg-chalk-teal hover:text-chalk-bg text-chalk-teal border border-chalk-teal/40 text-[10px] font-bold transition-colors"
        >
          再配信
        </button>
      </div>

      {/* Floating Bottom Prompt Bar */}
      <div className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40">
        <div className="p-2 rounded-2xl bg-white border border-black/[0.08] shadow-[0_10px_35px_rgb(0,0,0,0.12)] flex items-center gap-1.5">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
            placeholder="プロンプトでルール・タイトルを生成..."
            className="flex-1 min-w-0 bg-transparent text-xs text-ink placeholder:text-ink/40 focus:outline-none px-2"
          />
          <button
            onClick={handlePromptSubmit}
            disabled={!promptText.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-rose disabled:opacity-40 hover:bg-rose-dark text-white flex items-center justify-center shrink-0 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    </main>
  );
}
