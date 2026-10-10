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
  CheckCircle2,
  Tv2,
  Code2,
  Play,
  RotateCcw,
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
    { id: 'flying', name: '浮遊アクション', label: 'タップで上昇', detail: '障害物を潜り抜けるフロート' },
    { id: 'fall_catch', name: 'キャッチ', label: '落下アイテム回収', detail: '左右移動でスコア稼ぎ' },
    { id: 'endless_run', name: 'エンドレスラン', label: 'ジャンプ回避', detail: 'スピードが徐々に加速' },
    { id: 'target_smash', name: '的当て', label: 'ターゲット連打', detail: '制限時間内に撃破' },
    { id: 'balance_tower', name: 'タワー積み', label: 'バランス調整', detail: 'タイミングよく重ねる' },
  ];

  const themes = [
    { id: 'ICU Campus', label: 'ICUキャンパス（バカ山・本館）', bg: '#0c1b24' },
    { id: 'Blue Rose Mystic', label: '青いバラの神秘庭園', bg: '#102331' },
    { id: 'Cyber Neon', label: 'サイバーネオン2030', bg: '#0a0f1d' },
    { id: 'Retro Pixel', label: 'レトロ8bit宇宙', bg: '#18122B' },
  ];

  const characters: Array<{
    id: 'rose' | 'cat' | 'robot' | 'star' | 'bird';
    name: string;
    desc: string;
  }> = [
    { id: 'rose', name: '青いバラ', desc: '象徴的モチーフ' },
    { id: 'cat', name: 'サイバー猫', desc: '機敏な身のこなし' },
    { id: 'robot', name: '小型AIロボ', desc: '愛らしい相棒' },
    { id: 'star', name: '流星', desc: '神秘的な光の核' },
    { id: 'bird', name: 'ICUの野鳥', desc: '大木を飛び交う' },
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

  // Generate the Master Game-Creation Prompt
  const gamePrompt = `あなたは熟練のHTML5 Canvasゲーム開発者およびCreative Technologistです。
以下の仕様を満たす、完全自立型（外部ライブラリを一切使わず単一のHTMLファイルだけで完結する）のブラウザ向けミニゲームの全コードを出力してください。

【ゲーム仕様】
- ジャンル: ${engines.find((e) => e.id === selectedEngine)?.name} (${selectedEngine})
- 世界観テーマ: ${selectedTheme}
- 主人公キャラクター: ${characters.find((c) => c.id === charShape)?.name} (${charShape})
- プラットフォーム: モバイル（スマートフォンのタッチ操作）およびPC（キーボード矢印キー）両対応

【必須機能と演出】
1. HTML5 Canvas 2Dコンテキストのみを用い、流麗な60fpsゲームループ（requestAnimationFrame）を実装すること。
2. スコア加算表示、ライフ/残機、ゲームオーバー画面、および「リトライ」ボタンを含めること。
3. パーティクル演出（アイテム取得時やジャンプ時の光の粒子）を取り入れ、視覚的に心地よいジュース感（Game Juice）を出すこと。
4. 単一の \`index.html\` として保存してブラウザで開けば、そのまま完全にプレイ可能であること。

【出力形式】
<!DOCTYPE html> から始まる、完全なHTMLコードのみを出力してください。`;

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-24 text-ink">
      {/* Intro Header */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-light text-rose-dark text-[10px] font-bold border border-rose/20">
            ZONE 02 : GAME MAKER
          </span>
          <span className="text-[10px] font-mono text-ink/50 uppercase">PROMPT-TO-PLAY</span>
        </div>
        <h1 className="text-xl font-extrabold text-ink">言葉と絵のゲーム工房</h1>
        <p className="text-xs text-ink/70 leading-relaxed">
          好みのゲームルールとテーマを選ぶと、プロンプトが自動生成されます。外部AI（ClaudeやChatGPT）へ送ると、本物の自作ゲームがその場でプログラミングされます。
        </p>
      </section>

      {/* 1. Engine / Genre Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink flex items-center justify-between">
          <span>1. ゲームジャンルを選ぶ</span>
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
          <label className="text-xs font-bold text-ink">3. 世界観テーマ</label>
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
            アプリ内即時プレイプレビュー
          </span>
          <span className="text-[10px] text-ink/50">タップで今すぐ操作可能</span>
        </div>
        <div className="rounded-3xl bg-white border border-black/[0.06] shadow-sm p-3 flex flex-col items-center">
          <CanvasGameViewer config={activeConfig} />
        </div>
      </div>

      {/* Prompt Launcher: Send to External LLMs */}
      <PromptLauncher
        title="ゲーム制作プロンプト（Claude / ChatGPT向け）"
        subtitle="このプロンプトをClaude（Artifacts機能）やChatGPTに送ると、完全自立型のWebゲームコードが生成されます。"
        targetType="game"
        prompt={gamePrompt}
        anatomy={{
          role: '熟練のHTML5 Canvasゲーム開発者（フルスタック・エンジニア）',
          objective: '単一ファイル完結型（HTML/CSS/JS）のプレイ可能ゲームの自動生成',
          constraints: '外部ライブラリ不使用、60fpsループ、タッチ/キーボード両対応、ゲームオーバー/リトライ実装',
          outputFormat: '<!DOCTYPE html> から始まる単一HTMLコード',
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
            <span className="font-bold text-white block">教室の黒板スクリーンへ同時配信中</span>
            <span className="text-[10px] text-chalk-white/70">
              設定したゲーム構成がプロジェクターの広場に届きます
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
          スクリーンへ送信
        </button>
      </div>

      {/* Next Zone Navigation */}
      <button
        onClick={() => router.push('/self')}
        className="w-full py-3.5 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1.5 shadow-sm transition-all"
      >
        <span>次は SELF（3Dアバター工房）へ進む</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}
