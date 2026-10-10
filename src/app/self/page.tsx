'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { WorldTheme, SelfResult } from '@/types/pavilion';
import { PromptLauncher } from '@/components/common/PromptLauncher';
import confetti from 'canvas-confetti';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  Check,
  RotateCcw,
  Palette,
  User,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';

type AvatarStyleKey =
  | 'pixar_cute'
  | 'cyber_cool'
  | 'pixel_dot'
  | 'claymation'
  | 'chibi_anime'
  | 'voxel';

export default function SelfZonePage() {
  const router = useRouter();
  const { self, setSelf } = usePavilionSession();

  const [selectedStyle, setSelectedStyle] = useState<AvatarStyleKey>('pixar_cute');
  const [characterGender, setCharacterGender] = useState<'neutral' | 'boy' | 'girl'>('neutral');
  const [characterVibe, setCharacterVibe] = useState<'cute' | 'cool' | 'scholar' | 'street'>('cool');
  const [clothingColor, setClothingColor] = useState<string>('#4d7c0f');
  const [hasGlasses, setHasGlasses] = useState(false);
  const [userPhotoData, setUserPhotoData] = useState<string | null>(self?.avatarImageUrl || null);
  const [isPhotoGuideOpen, setIsPhotoGuideOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const avatarStyles: Array<{
    id: AvatarStyleKey;
    title: string;
    subtitle: string;
    badge: string;
    promptStyle: string;
  }> = [
    {
      id: 'pixar_cute',
      title: '3D Pixar Cute',
      subtitle: 'ピクサー調の愛らしい3Dキャラクター',
      badge: '人気 No.1',
      promptStyle: 'Pixar Disney 3D animation style, adorable stylized character, smooth shapes, expressive eyes',
    },
    {
      id: 'cyber_cool',
      title: '3D Cyberpunk Cool',
      subtitle: '近未来テックウェア＆サイバー調',
      badge: 'スタイリッシュ',
      promptStyle: 'Cyberpunk futuristic techwear style, sleek 3D render, glowing neon accents, cool confident demeanor',
    },
    {
      id: 'pixel_dot',
      title: 'Pixel Art (ドット絵)',
      subtitle: '温かみのあるレトロ16bitゲーム風',
      badge: 'レトロ',
      promptStyle: 'Charming 16-bit pixel art style, detailed isometric character sprite, nostalgic video game aesthetic',
    },
    {
      id: 'claymation',
      title: 'Claymation (粘土調)',
      subtitle: 'ストップモーション風の手作りクレイ',
      badge: 'クラフト',
      promptStyle: 'Handmade claymation stop-motion style, soft plasticine texture, warm artisanal lighting, Aardman inspired',
    },
    {
      id: 'chibi_anime',
      title: 'Chibi Anime (チビアニメ)',
      subtitle: '日本のデフォルメアニメスタイル',
      badge: 'アニメ',
      promptStyle: 'Cute Japanese anime chibi style, large sparkling eyes, soft cel shading, charming anime proportions',
    },
    {
      id: 'voxel',
      title: 'Low-Poly Voxel (箱庭)',
      subtitle: '立体ブロックで構成された箱庭世界',
      badge: 'ミニマル',
      promptStyle: 'Low-poly voxel art style, isometric miniature diorama, clean cubical forms, playful toy-like rendering',
    },
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUserPhotoData(dataUrl);
      saveToSession(dataUrl);
      confetti({ particleCount: 30, spread: 50 });
    };
    reader.readAsDataURL(file);
  };

  const saveToSession = (photoUrl?: string) => {
    const result: SelfResult = {
      avatarId: `avatar-${Date.now()}`,
      avatarStyle: 'pixar_boy',
      avatarImageUrl: photoUrl || userPhotoData || undefined,
      worldTheme: 'Blue Rose Mystic',
      userMood: characterVibe,
      concernText: `${selectedStyle} / ${characterVibe}`,
      blueRoseStatement: '自らの分身とともに、不可能な青の地平へと踏み出す。',
    };
    setSelf(result);
  };

  const activeStyleObj = avatarStyles.find((s) => s.id === selectedStyle)!;

  // Build the High-Resolution 3D Avatar Prompt
  const avatarPrompt = userPhotoData
    ? `あなたはプロフェッショナルな3Dキャラクターデザイナーおよびプロンプトエンジニアです。
添付した私の顔写真の特徴（髪型、輪郭、目元、全体の印象）を読み取り、以下の仕様で最高品質の3Dアバターポートレートを生成してください。

【キャラクター造形仕様】
- スタイル: ${activeStyleObj.promptStyle}
- 雰囲気・表情: ${characterVibe === 'cute' ? '親しみやすく愛らしい笑顔' : characterVibe === 'cool' ? '知的でクールな眼差し' : characterVibe === 'scholar' ? '思索的で穏やかな佇まい' : 'エネルギッシュなストリート感'}
- 小物・アクセサリ: ${hasGlasses ? '洗練された眼鏡、' : ''}青いバラのモチーフバッジ
- ライティング・質感: Octane Render 8K, 柔らかなスタジオシネマティックライティング, 鮮やかなカラーパレット, パステル背景
- カメラ: 正面バストアップ（胸から上）、カメラ目線、超高精細テクスチャ

添付写真の人物らしさをしっかり残した、最高のデフォルメ3Dキャラクターを出力してください。`
    : `A masterpiece 3D stylized character portrait in ${activeStyleObj.promptStyle}.
- Subject: A young ${characterGender === 'boy' ? 'boy' : characterGender === 'girl' ? 'girl' : 'person'} with a ${characterVibe} vibe, friendly smile, detailed expressive eyes
- Styling: Casual modern outfit with accent color ${clothingColor}, ${hasGlasses ? 'stylish glasses, ' : ''}a small blue rose emblem badge on chest
- Lighting: Soft volumetric studio lighting, subtle rim light, octane render 8k, Disney Pixar cinematic quality
- Composition: Waist-up portrait, clean pastel background with subtle glow, highly detailed textures.`;

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-24 text-ink">
      {/* Intro Header */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-light text-violet text-[10px] font-bold border border-violet/20">
            ZONE 03 : 3D AVATAR STUDIO
          </span>
          <span className="text-[10px] font-mono text-ink/50 uppercase">ALTER EGO</span>
        </div>
        <h1 className="text-xl font-extrabold text-ink">分身アバター工房</h1>
        <p className="text-xs text-ink/70 leading-relaxed">
          好みの立体スタイルを選ぶと、プロンプトが自動生成されます。ChatGPTやGeminiに送信（自撮り写真を添付も可能）すると、あなただけの高品質3Dアバターが完成します。
        </p>
      </section>

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

      {/* 1. Style Selection (The Core Request) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink flex items-center justify-between">
          <span>1. アバタースタイルを選ぶ</span>
          <span className="text-[10px] text-teal-dark font-mono">
            {activeStyleObj.title}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {avatarStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedStyle(style.id);
                  saveToSession();
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-violet bg-violet-light/50 text-violet-dark font-bold shadow-xs ring-1 ring-violet'
                    : 'border-black/[0.06] bg-white text-ink/80 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{style.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/5 text-ink/60 font-mono">
                    {style.badge}
                  </span>
                </div>
                <div className="text-[10px] opacity-75 mt-1 leading-snug">
                  {style.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Character Nuances (Vibe, Accessories) */}
      <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-xs space-y-3">
        <div className="text-xs font-bold text-ink">2. ディテール調整</div>

        {/* Vibe selection */}
        <div className="space-y-1">
          <span className="text-[11px] text-ink/70">雰囲気・表情</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'cute' as const, label: 'キュート' },
              { id: 'cool' as const, label: 'クール' },
              { id: 'scholar' as const, label: '知的・思索' },
              { id: 'street' as const, label: 'ストリート' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setCharacterVibe(v.id);
                  saveToSession();
                }}
                className={`py-1.5 text-center rounded-xl text-xs transition-all ${
                  characterVibe === v.id
                    ? 'bg-teal text-white font-bold shadow-2xs'
                    : 'bg-neutral-100 text-ink/70 hover:bg-neutral-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="flex items-center justify-between pt-1 border-t border-black/[0.04]">
          <span className="text-[11px] text-ink/70">メガネをかける</span>
          <button
            onClick={() => {
              setHasGlasses(!hasGlasses);
              saveToSession();
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              hasGlasses
                ? 'bg-teal-light text-teal-dark border border-teal'
                : 'bg-neutral-100 text-ink/60'
            }`}
          >
            {hasGlasses ? '着用中' : 'なし'}
          </button>
        </div>
      </div>

      {/* 3. Face Photo Integration Card */}
      <div className="p-3.5 rounded-2xl bg-linear-to-r from-teal-50/70 to-indigo-50/50 border border-teal/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-dark flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            自分の顔写真を反映させたい場合
          </span>
          {userPhotoData && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              写真設定済
            </span>
          )}
        </div>

        <p className="text-[11px] text-ink/75 leading-relaxed">
          ChatGPTやGeminiを開いたら、<strong>あなたの顔写真（自撮り）をチャット欄に添付して下のプロンプトを送信</strong>してください。AIがあなたの顔立ちを読み取り、選んだスタイルで立体化します。
        </p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-xl bg-white border border-teal/30 text-teal-dark text-xs font-bold hover:bg-teal-light flex items-center justify-center gap-1 shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>自撮りを撮影</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-xl bg-white border border-teal/30 text-teal-dark text-xs font-bold hover:bg-teal-light flex items-center justify-center gap-1 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>写真をアップロード</span>
          </button>
        </div>

        {userPhotoData && (
          <div className="flex items-center gap-2 pt-2 border-t border-teal/15">
            <img
              src={userPhotoData}
              alt="Uploaded avatar"
              className="w-10 h-10 rounded-xl object-cover border border-teal/30"
            />
            <div className="text-[10px] text-ink/70">
              <span className="font-bold text-teal-dark block">パスポート連携中</span>
              最終展示の箱庭パスポートにこの画像が反映されます
            </div>
          </div>
        )}
      </div>

      {/* Prompt Launcher: Send to External Image Generation LLMs */}
      <PromptLauncher
        title="3Dアバター生成プロンプト"
        subtitle="ChatGPT（DALL-E 3）やGeminiに送信して、あなたのアバターを生成しましょう。"
        targetType="avatar"
        prompt={avatarPrompt}
        anatomy={{
          role: '3Dキャラクターデザイナー & Octane 3Dレンダラー',
          objective: '顔写真または指定スタイルに基づく最高品質の立体デフォルメポートレート生成',
          constraints: 'スタジオライティング、Octane Render 8K、Disney/Pixar調の滑らかな立体造形、胸上アングル',
          outputFormat: '高解像度画像（アスペクト比 1:1 または 9:16）',
        }}
        userPreferences={{
          style: selectedStyle,
          vibe: characterVibe,
          hasGlasses,
          hasPhoto: !!userPhotoData,
        }}
      />

      {/* Next Zone Navigation */}
      <button
        onClick={() => router.push('/care')}
        className="w-full py-3.5 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1.5 shadow-sm transition-all"
      >
        <span>次は CARE（LOVOT写真工房）へ進む</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}
