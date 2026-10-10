'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { EngineType, GameConfig } from '@/types/pavilion';
import { CanvasGameViewer } from '@/components/make/CanvasGameViewer';
import { PromptLauncher } from '@/components/common/PromptLauncher';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  Tv2,
  Play,
} from 'lucide-react';

export default function MakeZonePage() {
  const router = useRouter();
  const { make, setMake, publishGameToClassroom } = usePavilionSession();

  const [selectedEngine, setSelectedEngine] = useState<EngineType>(
    make?.engineType || 'flying'
  );
  const [selectedTheme, setSelectedTheme] = useState<string>(
    make?.themeName || 'ICU Campus'
  );
  const [charShape, setCharShape] = useState<'rose' | 'cat' | 'robot' | 'star' | 'bird'>(
    make?.characterShape || 'rose'
  );

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

  const engines: Array<{
    id: EngineType;
    name: string;
    label: string;
    detail: string;
  }> = [
    { id: 'flying', name: '浮遊アクション', label: 'タップで浮く', detail: '障害物を避けて進む' },
    { id: 'fall_catch', name: 'アイテムキャッチ', label: '落下アイテム回収', detail: '左右に動いてスコアを稼ぐ' },
    { id: 'endless_run', name: 'ラン＆ジャンプ', label: '走ってジャンプ', detail: '障害物を跳び越える' },
    { id: 'target_smash', name: '的当てタップ', label: '的をタップ', detail: '時間内にたくさん当てる' },
    { id: 'balance_tower', name: 'タワー積み', label: 'バランス積み上げ', detail: 'タイミングよく重ねる' },
  ];

  const themes = [
    { id: 'ICU Campus', label: 'ICUキャンパス（緑の並木道）', bg: '#0c1b24' },
    { id: 'Blue Rose Mystic', label: '青いバラの夜空庭園', bg: '#102331' },
    { id: 'Cyber Neon', label: 'サイバーネオンの街', bg: '#0a0f1d' },
    { id: 'Retro Pixel', label: 'レトロゲーム風の宇宙', bg: '#18122B' },
  ];

  const characters: Array<{
    id: 'rose' | 'cat' | 'robot' | 'star' | 'bird';
    name: string;
    desc: string;
  }> = [
    { id: 'rose', name: '青いバラ', desc: 'ふわふわ飛ぶバラ' },
    { id: 'cat', name: 'サイバー猫', desc: 'すばしっこいネコ' },
    { id: 'robot', name: '小型AIロボ', desc: '頼れる相棒ロボ' },
    { id: 'star', name: '流星', desc: 'きらきら光る星' },
    { id: 'bird', name: 'ICUの小鳥', desc: '森を飛び交うトリ' },
  ];

  const handleUpdate = (
    eng: EngineType,
    thm: string,
    chr: 'rose' | 'cat' | 'robot' | 'star' | 'bird'
  ) => {
    const updated: GameConfig = {
      ...activeConfig,
      engineType: eng,
      themeName: thm,
      characterShape: chr,
      title: `${thm}の${characters.find((c) => c.id === chr)?.name || '冒険'}`,
    };
    setActiveConfig(updated);
    setMake(updated);
  };

  // Plain & Effective Game-Creation Prompt
  const gamePrompt = `あなたは親切で腕の良いゲームプログラマーです。
以下の設定をもとに、スマホでもPCでもブラウザで開くだけですぐに遊べる楽しいWebミニゲームを作ってください。
外部ライブラリは一切使わず、単一のHTMLファイル（HTML+CSS+JavaScript）だけで動くようにしてください。

【ゲームの設定】
- ゲームの種類: ${engines.find((e) => e.id === selectedEngine)?.name}
- ステージの雰囲気: ${themes.find((t) => t.id === selectedTheme)?.label || selectedTheme}
- 主人公キャラクター: ${characters.find((c) => c.id === charShape)?.name}
- 操作方法: スマホの画面タップ、またはキーボードの矢印キーで操作可能

【入れてほしい機能】
1. なめらかに動くゲーム画面（HTML5 Canvasを使用）
2. スコア表示、残機（ライフ）、ゲームオーバー画面
3. ゲームオーバー後に「もう一度あそぶ」ボタンを押すとすぐにやり直せる機能
4. アイテムを取った時やジャンプした時に、星などの光の粒が出る楽しいエフェクト
5. 誰でも直感的にルールが分かるシンプルなゲームバランス

【出力の形式】
<!DOCTYPE html> から始まる、完全なHTMLコードのみを出力してください。余計な挨拶や解説は不要です。`;

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-24 text-ink">
      {/* Intro Header */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-light text-rose-dark text-[10px] font-bold border border-rose/20">
            ZONE 02 : ゲームづくり
          </span>
          <span className="text-[10px] text-ink/50">遊べるゲームをつくる</span>
        </div>
        <h1 className="text-xl font-extrabold text-ink">ゲームづくり工房</h1>
        <p className="text-xs text-ink/70 leading-relaxed">
          好きなゲームの種類やキャラクターを選ぶと、AIへの指示文（プロンプト）が作れます。ChatGPTやClaudeに送ると、ブラウザですぐに遊べる自作ゲームを作ってくれます。
        </p>
      </section>

      {/* 1. Engine / Genre Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink flex items-center justify-between">
          <span>1. ゲームの種類を選ぶ</span>
          <span className="text-[10px] text-teal-dark font-mono">
            {engines.find((e) => e.id === selectedEngine)?.name}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {engines.map((eng) => {
            const isSelected = selectedEngine === eng.id;
            return (
              <button
                key={eng.id}
                onClick={() => {
                  setSelectedEngine(eng.id);
                  handleUpdate(eng.id, selectedTheme, charShape);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-rose bg-rose-light text-rose-dark font-bold shadow-xs'
                    : 'border-black/[0.06] bg-white text-ink/80 hover:bg-neutral-50'
                }`}
              >
                <div className="text-xs font-bold">{eng.name}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{eng.detail}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Character & Theme Selector */}
      <div className="grid grid-cols-2 gap-3">
        {/* Character */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink">2. 主人公</label>
          <div className="space-y-1">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCharShape(c.id);
                  handleUpdate(selectedEngine, selectedTheme, c.id);
                }}
                className={`w-full p-1.5 px-2.5 rounded-xl border text-left text-xs transition-all ${
                  charShape === c.id
                    ? 'border-teal bg-teal-light text-teal-dark font-bold'
                    : 'border-black/[0.06] bg-white text-ink/75 hover:bg-neutral-50'
                }`}
              >
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink">3. ステージの雰囲気</label>
          <div className="space-y-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTheme(t.id);
                  handleUpdate(selectedEngine, t.id, charShape);
                }}
                className={`w-full p-1.5 px-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedTheme === t.id
                    ? 'border-teal bg-teal-light text-teal-dark font-bold'
                    : 'border-black/[0.06] bg-white text-ink/75 hover:bg-neutral-50'
                }`}
              >
                <span className="truncate block">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Built-in Instant Preview Viewport */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-ink flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-rose fill-rose" />
            お試しプレイ画面
          </span>
          <span className="text-[10px] text-ink/50">画面をタップして動かせます</span>
        </div>
        <div className="rounded-3xl bg-white border border-black/[0.06] shadow-sm p-3 flex flex-col items-center">
          <CanvasGameViewer config={activeConfig} />
        </div>
      </div>

      {/* Prompt Launcher: Send to External LLMs */}
      <PromptLauncher
        title="ゲームをつくる指示文（Claude / ChatGPT用）"
        subtitle="この文章をClaudeやChatGPTに送ると、ブラウザですぐに遊べるゲームのプログラムを作ってくれます。"
        targetType="game"
        prompt={gamePrompt}
        anatomy={{
          role: '親切なWebゲームプログラマー',
          objective: '単一のHTMLファイルですぐに遊べるゲームのコード作成',
          constraints: '外部ライブラリ不使用、スマホとPC両対応、リトライボタン付き',
          outputFormat: '<!DOCTYPE html> から始まるHTMLコード',
        }}
        userPreferences={{
          engine: selectedEngine,
          character: charShape,
          theme: selectedTheme,
        }}
      />

      {/* Classroom Broadcasting Banner */}
      <div className="p-3.5 rounded-2xl bg-chalk-bg text-chalk-white border border-teal/40 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Tv2 className="w-4 h-4 text-chalk-yellow" />
          <div className="text-xs">
            <span className="font-bold text-white block">教室のスクリーンにも届きます</span>
            <span className="text-[10px] text-chalk-white/70">
              あなたが選んだゲームの設定が大きな画面に表示されます
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            publishGameToClassroom(activeConfig);
            confetti({ particleCount: 30, spread: 50 });
          }}
          className="px-3 py-1.5 rounded-xl bg-chalk-surface hover:bg-chalk-teal hover:text-chalk-bg text-chalk-teal border border-chalk-teal/40 text-xs font-bold transition-colors shrink-0"
        >
          スクリーンに送る
        </button>
      </div>

      {/* Next Zone Navigation */}
      <button
        onClick={() => router.push('/self')}
        className="w-full py-3.5 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1.5 shadow-sm transition-all"
      >
        <span>次は アバターづくり（SELF）へ進む</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}
