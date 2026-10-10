'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { WorldTheme, SelfResult } from '@/types/pavilion';
import confetti from 'canvas-confetti';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  Send,
  Sliders,
  Eye,
  CheckCircle2,
  RefreshCw,
  Share2,
  ChevronDown,
  X,
  Palette,
} from 'lucide-react';

export default function SelfZonePage() {
  const router = useRouter();
  const { self, setSelf } = usePavilionSession();

  // Step: 'upload' -> 'scanning' -> 'studio'
  const [step, setStep] = useState<'upload' | 'scanning' | 'studio'>(
    self ? 'studio' : 'upload'
  );

  // Photo state
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Studio state
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'scene' | 'assets'>('scene');
  const [activeMode, setActiveMode] = useState<'design' | 'animation'>('design');
  const [worldTheme, setWorldTheme] = useState<WorldTheme>(
    self?.worldTheme || 'Blue Rose Mystic'
  );
  const [promptText, setPromptText] = useState('');
  const [hasGlasses, setHasGlasses] = useState(false);
  const [isVariationsOpen, setIsVariationsOpen] = useState(true);

  // 4 Variations modeled after the reference image
  const variations = [
    {
      id: 'var-1',
      title: 'Casual Green',
      color: '#4d7c0f',
      accentColor: '#84cc16',
      badge: 'カジュアル・日常',
      hairColor: '#451a03',
      shirtColor: '#4d7c0f',
      pantsColor: '#d97706',
      bagColor: '#78350f',
      description: '参考画像のピクサー調・緑Tシャツ＆カーキハーフパンツスタイル',
    },
    {
      id: 'var-2',
      title: 'Cyber Navy',
      color: '#168eac',
      accentColor: '#2dd4bf',
      badge: 'テックウェア',
      hairColor: '#1e293b',
      shirtColor: '#168eac',
      pantsColor: '#0f172a',
      bagColor: '#08718d',
      description: 'サイバーガラスと知的なテックウェアスタイル',
    },
    {
      id: 'var-3',
      title: 'Earth Scholar',
      color: '#98c97e',
      accentColor: '#f6dd59',
      badge: '自然・思索',
      hairColor: '#78350f',
      shirtColor: '#98c97e',
      pantsColor: '#713f12',
      bagColor: '#9a3412',
      description: 'ICUの木漏れ日と自然の温もりを感じるアースカラースタイル',
    },
    {
      id: 'var-4',
      title: 'Blue Rose Mystic',
      color: '#dc4f89',
      accentColor: '#9a7ab4',
      badge: '青バラ・魔法',
      hairColor: '#312e81',
      shirtColor: '#dc4f89',
      pantsColor: '#4338ca',
      bagColor: '#831843',
      description: '不可能な青を紡ぎ出すフェスティバル特別スタイル',
    },
  ];

  // World Theme lighting effects
  const effects = [
    {
      theme: 'Blue Rose Mystic' as WorldTheme,
      label: '青バラの光',
      gradient: 'from-blue-600 via-indigo-600 to-rose-600',
      lightingBg: 'rgba(22, 142, 172, 0.15)',
    },
    {
      theme: 'Neo Cyber' as WorldTheme,
      label: 'ネオ・サイバー',
      gradient: 'from-cyan-500 via-teal-500 to-blue-600',
      lightingBg: 'rgba(45, 212, 191, 0.15)',
    },
    {
      theme: 'Nature Warmth' as WorldTheme,
      label: '森の木漏れ日',
      gradient: 'from-amber-400 via-emerald-500 to-green-600',
      lightingBg: 'rgba(152, 201, 126, 0.18)',
    },
    {
      theme: 'Dreamy Cute' as WorldTheme,
      label: 'ドリーミー',
      gradient: 'from-pink-400 via-purple-400 to-yellow-300',
      lightingBg: 'rgba(220, 79, 137, 0.15)',
    },
  ];

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserPhotoUrl(url);
      startScanningProcess();
    }
  };

  const handleUsePresetPhoto = (presetName: string) => {
    setUserPhotoUrl(presetName);
    startScanningProcess();
  };

  const startScanningProcess = () => {
    setStep('scanning');
    setTimeout(() => {
      setStep('studio');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      saveAvatarToSession(variations[0], worldTheme);
    }, 1800);
  };

  const saveAvatarToSession = (
    currentVar: typeof variations[0],
    currentTheme: WorldTheme,
    statement?: string
  ) => {
    const statements: Record<WorldTheme, string> = {
      'Blue Rose Mystic': '不可能な青を、私自身の純粋な探究でこのキャンパスに咲かせる。',
      'Neo Cyber': '知性とアルゴリズムを味方に、まだ誰も見たことのない地平を切り拓く。',
      'Nature Warmth': '移り変わる時代の中で、人との温かなぬくもりと対話を一番の軸にする。',
      'Dreamy Cute': '小さなひらめきと遊び心を愛し、世界にやさしい驚きを届けていく。',
    };

    const result: SelfResult = {
      avatarId: `avatar-${Date.now()}`,
      avatarStyle: 'pixar_boy',
      worldTheme: currentTheme,
      userMood: currentVar.title,
      concernText: promptText || '自分らしさと未来の探究',
      blueRoseStatement: statement || statements[currentTheme],
    };
    setSelf(result);
  };

  // Submit prompt from floating prompt bar
  const handlePromptSubmit = () => {
    if (!promptText.trim()) return;
    if (promptText.includes('メガネ') || promptText.includes('めがね')) {
      setHasGlasses(true);
    }
    saveAvatarToSession(
      variations[activeVariationIndex],
      worldTheme,
      `「${promptText}」を胸に、不可能な青を咲かせる。`
    );
    setPromptText('');
    confetti({ particleCount: 30, spread: 50 });
  };

  const activeVar = variations[activeVariationIndex];

  return (
    <main className="flex-1 flex flex-col relative select-none">
      {/* Hidden file inputs for Camera & Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {/* PHASE 1: PHOTO CAPTURE / UPLOAD */}
      {step === 'upload' && (
        <div className="p-4 space-y-6 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-white border border-black/[0.08] shadow-sm flex items-center justify-center text-3xl mx-auto">
              📸
            </div>
            <h1 className="text-xl font-bold text-ink">
              あなたの顔写真から<br />3Dデフォルメアバターを生成
            </h1>
            <p className="text-xs text-ink/70 leading-relaxed">
              スマホで撮影した写真の特徴（髪型・輪郭・表情）をもとに、ピクサー調の3Dデフォルメキャラクターを創り出します。
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal text-white font-bold text-sm hover:bg-teal-dark transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>カメラで自撮りを撮影する</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-black/[0.08] text-ink font-bold text-xs hover:bg-paper-light transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
            >
              <Upload className="w-4 h-4 text-ink/70" />
              <span>写真ライブラリからアップロード</span>
            </button>
          </div>

          {/* Quick preset alternatives */}
          <div className="pt-4 border-t border-black/[0.06] space-y-2 text-center">
            <span className="text-[11px] text-ink/60 font-medium">
              撮影をスキップしてサンプル写真で試す:
            </span>
            <div className="flex justify-center gap-2">
              {[
                { name: '学生（ナチュラル）', emoji: '👦' },
                { name: '探究者（メガネ）', emoji: '🧑‍🔬' },
                { name: 'クリエイター', emoji: '🎨' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUsePresetPhoto(p.name)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-black/[0.08] text-[11px] font-semibold text-ink/80 hover:border-teal flex items-center gap-1 shadow-xs"
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: SCANNING ANIMATION */}
      {step === 'scanning' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-5 text-center">
          <div className="relative w-36 h-36 rounded-3xl bg-white border-2 border-teal/40 shadow-xl overflow-hidden flex items-center justify-center">
            <div className="text-6xl animate-pulse">👦</div>
            {/* Scanning beam line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-teal via-rose to-yellow animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal-dark text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal" />
              <span>AIスキャン解析中...</span>
            </div>
            <h2 className="text-base font-bold text-ink">
              輪郭と表情の特徴から3Dモデルを生成中
            </h2>
            <p className="text-xs text-ink/60">
              ソフトクレイの質感とピクサー調デフォルメを合成しています
            </p>
          </div>
        </div>
      )}

      {/* PHASE 3: STUDIO VIEW (MATCHING THE UPLOADED REFERENCE IMAGE media_1791563571932.png) */}
      {step === 'studio' && (
        <div className="flex-1 flex flex-col justify-between p-3 space-y-3 pb-24">
          {/* Top Sub-Bar: Segmented Controls (Scene | Assets) & (Design | Animation) */}
          <div className="flex items-center justify-between gap-2">
            {/* Pill tabs: Scene | Assets */}
            <div className="p-1 rounded-full bg-white border border-black/[0.06] shadow-xs flex items-center gap-1">
              <button
                onClick={() => setActiveTab('scene')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'scene'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                Scene
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'assets'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                Assets
              </button>
            </div>

            {/* Design | Animation pill */}
            <div className="p-1 rounded-full bg-white border border-black/[0.06] shadow-xs flex items-center gap-1">
              <button
                onClick={() => setActiveMode('design')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeMode === 'design'
                    ? 'bg-teal text-white shadow-xs'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                Design
              </button>
              <button
                onClick={() => setActiveMode('animation')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeMode === 'animation'
                    ? 'bg-teal text-white shadow-xs'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                Motion
              </button>
            </div>
          </div>

          {/* Central 3D Avatar Viewport & Floating Variations Dock */}
          <div className="relative rounded-3xl bg-white border border-black/[0.06] shadow-[0_10px_35px_rgb(0,0,0,0.05)] p-4 min-h-[360px] flex flex-col justify-center items-center overflow-hidden">
            {/* Soft Ambient Lighting behind 3D model */}
            <div
              className="absolute inset-0 transition-colors duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${activeVar.accentColor}25 0%, rgba(255,255,255,0) 70%)`,
              }}
            />

            {/* 3D Character Rendering (Deformed 3D Boy/Girl matching the reference image) */}
            <div className="relative z-10 flex flex-col items-center">
              {/* 3D Model Visual */}
              <div className="relative w-44 h-64 flex flex-col items-center justify-center animate-float">
                {/* Hair */}
                <div
                  className="w-24 h-14 rounded-t-3xl -mb-4 z-20 shadow-md relative"
                  style={{ backgroundColor: activeVar.hairColor }}
                >
                  {/* Fluffy tufts */}
                  <span
                    className="absolute -top-1 left-4 w-6 h-5 rounded-full"
                    style={{ backgroundColor: activeVar.hairColor }}
                  />
                  <span
                    className="absolute -top-2 right-6 w-8 h-6 rounded-full"
                    style={{ backgroundColor: activeVar.hairColor }}
                  />
                </div>

                {/* Face & Head */}
                <div className="relative w-22 h-20 rounded-full bg-[#fcd3b8] border-2 border-[#f7ba94] shadow-md flex flex-col items-center justify-center z-10">
                  {/* Ears */}
                  <span className="absolute -left-2.5 top-7 w-3.5 h-5 rounded-full bg-[#fcd3b8] border border-[#f7ba94]" />
                  <span className="absolute -right-2.5 top-7 w-3.5 h-5 rounded-full bg-[#fcd3b8] border border-[#f7ba94]" />

                  {/* Eyebrows */}
                  <div className="flex justify-between w-12 -mt-1">
                    <span
                      className="w-3.5 h-1 rounded-full"
                      style={{ backgroundColor: activeVar.hairColor }}
                    />
                    <span
                      className="w-3.5 h-1 rounded-full"
                      style={{ backgroundColor: activeVar.hairColor }}
                    />
                  </div>

                  {/* Eyes & Glasses */}
                  <div className="flex items-center justify-between w-11 mt-1 relative">
                    {hasGlasses && (
                      <div className="absolute -inset-1 border-2 border-black rounded-lg flex items-center justify-around pointer-events-none z-20">
                        <span className="w-4 h-4 rounded-full border border-black" />
                        <span className="w-1 border-t border-black" />
                        <span className="w-4 h-4 rounded-full border border-black" />
                      </div>
                    )}
                    <span className="w-2.5 h-3 rounded-full bg-[#1e293b]" />
                    <span className="w-2.5 h-3 rounded-full bg-[#1e293b]" />
                  </div>

                  {/* Nose & Smile */}
                  <span className="w-2.5 h-2 rounded-full bg-[#fb923c] mt-1" />
                  <span className="w-3.5 h-1.5 border-b-2 border-[#ea580c] rounded-full mt-0.5" />
                </div>

                {/* Body (T-shirt / Hoodie like the reference image) */}
                <div
                  className="relative w-28 h-20 rounded-2xl shadow-md -mt-2 z-10 flex flex-col items-center justify-between p-1"
                  style={{ backgroundColor: activeVar.shirtColor }}
                >
                  {/* Crossbody Bag Strap */}
                  <div
                    className="absolute inset-y-0 w-3 left-6 -rotate-25 shadow-xs"
                    style={{ backgroundColor: activeVar.bagColor }}
                  />

                  {/* Crossbody Bag pouch at hip */}
                  <div
                    className="absolute -right-1 bottom-1 w-8 h-7 rounded-lg shadow-md z-20 border border-black/10"
                    style={{ backgroundColor: activeVar.bagColor }}
                  />
                </div>

                {/* Shorts */}
                <div
                  className="w-24 h-10 -mt-1 flex justify-between px-2"
                  style={{ backgroundColor: activeVar.pantsColor }}
                >
                  <span
                    className="w-9 h-full rounded-b-md"
                    style={{ backgroundColor: activeVar.pantsColor }}
                  />
                  <span
                    className="w-9 h-full rounded-b-md"
                    style={{ backgroundColor: activeVar.pantsColor }}
                  />
                </div>

                {/* Legs & Sneakers */}
                <div className="flex justify-between w-20 -mt-1">
                  <div className="flex flex-col items-center">
                    <span className="w-3.5 h-5 bg-[#fcd3b8]" />
                    {/* Sneaker */}
                    <span className="w-7 h-4 rounded-full bg-[#fef08a] border border-[#fde047] shadow-xs" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-3.5 h-5 bg-[#fcd3b8]" />
                    {/* Sneaker */}
                    <span className="w-7 h-4 rounded-full bg-[#fef08a] border border-[#fde047] shadow-xs" />
                  </div>
                </div>
              </div>

              {/* Pedestal shadow */}
              <div className="w-32 h-4 rounded-full bg-black/10 blur-[3px] mt-2" />
            </div>

            {/* FLOATING VARIATIONS 2x2 DOCK (Directly from media_1791563571932.png) */}
            {isVariationsOpen && (
              <div className="absolute top-3 left-3 z-30 p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-black/[0.08] shadow-xl w-36 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between text-[10px] font-bold text-ink mb-1.5 px-0.5">
                  <span>Variations</span>
                  <div className="flex items-center gap-1 text-ink/50">
                    <span>{activeVariationIndex + 1} of 4</span>
                    <button
                      onClick={() => setIsVariationsOpen(false)}
                      className="hover:text-ink"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2x2 Grid Thumbnails */}
                <div className="grid grid-cols-2 gap-1.5">
                  {variations.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setActiveVariationIndex(idx);
                        saveAvatarToSession(v, worldTheme);
                      }}
                      style={{ borderColor: activeVariationIndex === idx ? v.color : undefined }}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        activeVariationIndex === idx
                          ? 'border-2 shadow-sm bg-neutral-50 scale-102'
                          : 'border-black/[0.08] bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white shadow-2xs font-bold"
                        style={{ backgroundColor: v.color }}
                      >
                        {idx === 0 ? '👕' : idx === 1 ? '⚡' : idx === 2 ? '🌿' : '🌹'}
                      </div>
                      <span className="text-[9px] font-bold text-ink mt-1 truncate max-w-full">
                        {v.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isVariationsOpen && (
              <button
                onClick={() => setIsVariationsOpen(true)}
                className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-white/90 border border-black/[0.08] text-[10px] font-bold text-ink shadow-sm flex items-center gap-1"
              >
                <span>Variations</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            )}

            {/* Retake Photo Button on top right */}
            <button
              onClick={() => setStep('upload')}
              className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-white/90 border border-black/[0.08] text-[10px] font-bold text-ink shadow-sm flex items-center gap-1 hover:bg-white"
            >
              <RefreshCw className="w-3 h-3 text-teal" />
              <span>写真変更</span>
            </button>
          </div>

          {/* World Theme & Lighting Effects Strip (Modeled after right panel in screenshot) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-ink flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-teal" /> 世界観・ライティング効果
              </span>
              <span className="text-[10px] text-teal-dark font-medium font-sans">
                {worldTheme}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {effects.map((eff) => (
                <button
                  key={eff.theme}
                  onClick={() => {
                    setWorldTheme(eff.theme);
                    saveAvatarToSession(activeVar, eff.theme);
                  }}
                  className={`p-2 rounded-2xl border text-center transition-all ${
                    worldTheme === eff.theme
                      ? 'border-2 border-teal bg-white shadow-xs ring-1 ring-teal'
                      : 'border-black/[0.06] bg-white/80 hover:bg-white'
                  }`}
                >
                  <div
                    className={`w-full h-8 rounded-xl bg-gradient-to-tr ${eff.gradient} shadow-2xs mb-1`}
                  />
                  <span className="text-[10px] font-bold text-ink truncate block">
                    {eff.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Statement preview card */}
          {self?.blueRoseStatement && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-light/50 to-teal-light/50 border border-rose/30">
              <div className="text-[10px] font-bold text-rose flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Blue Rose Statement（未来への宣言）
              </div>
              <p className="text-xs font-bold text-ink mt-0.5 leading-snug">
                「{self.blueRoseStatement}」
              </p>
            </div>
          )}

          {/* Floating Bottom Prompt Bar (Directly from media_1791563571932.png) */}
          <div className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40">
            <div className="p-2 rounded-2xl bg-white border border-black/[0.08] shadow-[0_10px_35px_rgb(0,0,0,0.12)] flex items-center gap-1.5">
              {/* Plus button */}
              <button
                onClick={() => setHasGlasses(!hasGlasses)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  hasGlasses ? 'bg-teal text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-ink'
                }`}
                title="メガネのオン/オフ"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Inspiration pill */}
              <button
                onClick={() =>
                  setPromptText('不可能な青を、私自身の探究でキャンパスに咲かせる。')
                }
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[10px] font-bold text-ink/80 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-yellow" />
                <span>Inspiration</span>
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                placeholder="衣装や装飾の指示、または未来への宣言..."
                className="flex-1 min-w-0 bg-transparent text-xs text-ink placeholder:text-ink/40 focus:outline-none px-1"
              />

              {/* Up-arrow Submit button */}
              <button
                onClick={handlePromptSubmit}
                disabled={!promptText.trim()}
                className="w-8 h-8 rounded-full bg-teal disabled:opacity-40 hover:bg-teal-dark text-white flex items-center justify-center shrink-0 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
