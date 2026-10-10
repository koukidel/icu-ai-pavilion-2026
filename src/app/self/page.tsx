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
  ArrowRight,
  Check,
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
  const [characterVibe, setCharacterVibe] = useState<'cute' | 'cool' | 'scholar' | 'street'>('cool');
  const [hasGlasses, setHasGlasses] = useState(false);
  const [userPhotoData, setUserPhotoData] = useState<string | null>(self?.avatarImageUrl || null);

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
      title: '3D ピクサー風（かわいい）',
      subtitle: 'アニメ映画のような愛らしい立体キャラクター',
      badge: '人気',
      promptStyle: 'Pixar Disney 3D animation style, adorable stylized character, smooth shapes, expressive eyes',
    },
    {
      id: 'cyber_cool',
      title: '3D サイバー風（かっこいい）',
      subtitle: '近未来的な衣装とクールな雰囲気',
      badge: 'おすすめ',
      promptStyle: 'Cyberpunk futuristic techwear style, sleek 3D render, glowing neon accents, cool confident demeanor',
    },
    {
      id: 'pixel_dot',
      title: 'ドット絵（レトロゲーム風）',
      subtitle: 'どこか懐かしい16bit風のドット絵',
      badge: 'レトロ',
      promptStyle: 'Charming 16-bit pixel art style, detailed isometric character sprite, nostalgic video game aesthetic',
    },
    {
      id: 'claymation',
      title: '粘土アニメ風（クレイ調）',
      subtitle: '手作りの温かみがある粘土キャラクター',
      badge: '手作り感',
      promptStyle: 'Handmade claymation stop-motion style, soft plasticine texture, warm artisanal lighting',
    },
    {
      id: 'chibi_anime',
      title: 'ちびキャラ・アニメ風',
      subtitle: '大きな瞳が特徴のデフォルメアニメ調',
      badge: 'アニメ',
      promptStyle: 'Cute Japanese anime chibi style, large sparkling eyes, soft cel shading, charming anime proportions',
    },
    {
      id: 'voxel',
      title: 'ブロック調（マインクラフト風）',
      subtitle: '立方体のブロックで作られた立体キャラクター',
      badge: 'ブロック',
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
      blueRoseStatement: 'AIを頼れる相棒にして、自分らしく前へ進んでいく。',
    };
    setSelf(result);
  };

  const activeStyleObj = avatarStyles.find((s) => s.id === selectedStyle)!;

  // Build Plain & High-Quality 3D Avatar Prompt
  const avatarPrompt = userPhotoData
    ? `あなたはプロのキャラクターデザイナーです。
添付した顔写真をもとに、その人の特徴（髪型、輪郭、目元、やさしい表情）を活かして、以下のスタイルでかわいい3Dデフォルメ・キャラクターの画像を生成してください。

【キャラクターの設定】
- スタイル: ${activeStyleObj.promptStyle}
- 雰囲気: ${characterVibe === 'cute' ? '親しみやすく愛らしい笑顔' : characterVibe === 'cool' ? '知的でクールな表情' : characterVibe === 'scholar' ? 'おだやかで優しい表情' : '元気いっぱいの明るい表情'}
- 小物: ${hasGlasses ? 'おしゃれなメガネ、' : ''}胸元に小さな青いバラのブローチ
- 背景: すっきりとしたパステルカラーの背景
- 構図: 胸から上のバストアップ、正面向き

写真の人物の面影を残しつつ、親しみやすく魅力的な立体キャラクターを出力してください。`
    : `A cute 3D stylized character portrait in ${activeStyleObj.promptStyle}.
- Subject: A young person with a ${characterVibe} vibe, warm and friendly smile, expressive eyes
- Outfit: Casual everyday outfit, ${hasGlasses ? 'wearing glasses, ' : ''}with a small blue rose badge
- Lighting: Soft studio lighting, clean background, 3D animated film quality
- Composition: Bust portrait, looking at camera.`;

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-24 text-ink">
      {/* Intro Header */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-light text-violet text-[10px] font-bold border border-violet/20">
            ZONE 03 : アバターづくり
          </span>
          <span className="text-[10px] text-ink/50">3Dアバター</span>
        </div>
        <h1 className="text-xl font-extrabold text-ink">3Dアバター工房</h1>
        <p className="text-xs text-ink/70 leading-relaxed">
          好きなスタイルを選ぶと、AIへの指示文が作れます。ChatGPTやGeminiに送る（自分の写真を一緒に送ることも可能）と、あなた専用の3Dアバター画像を作ってくれます。
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

      {/* 1. Style Selection */}
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

      {/* 2. Character Details */}
      <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-xs space-y-3">
        <div className="text-xs font-bold text-ink">2. 表情や小物の調整</div>

        {/* Vibe selection */}
        <div className="space-y-1">
          <span className="text-[11px] text-ink/70">雰囲気</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'cute' as const, label: 'かわいい' },
              { id: 'cool' as const, label: 'クール' },
              { id: 'scholar' as const, label: 'おだやか' },
              { id: 'street' as const, label: '元気' },
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

        {/* Glasses toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-black/[0.04]">
          <span className="text-[11px] text-ink/70">メガネ</span>
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
            {hasGlasses ? 'かける' : 'なし'}
          </button>
        </div>
      </div>

      {/* 3. Face Photo Integration Card */}
      <div className="p-3.5 rounded-2xl bg-linear-to-r from-teal-50/70 to-indigo-50/50 border border-teal/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-dark flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            自分の顔写真をアバターにしたいとき
          </span>
          {userPhotoData && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              写真あり
            </span>
          )}
        </div>

        <p className="text-[11px] text-ink/75 leading-relaxed">
          ChatGPTやGeminiのチャット欄に<strong>自分の顔写真を貼り付けて、下の文章を一緒に送信</strong>してください。AIがあなたの髪型や表情を読み取って、アバターを描いてくれます。
        </p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-xl bg-white border border-teal/30 text-teal-dark text-xs font-bold hover:bg-teal-light flex items-center justify-center gap-1 shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>自撮りを撮る</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-xl bg-white border border-teal/30 text-teal-dark text-xs font-bold hover:bg-teal-light flex items-center justify-center gap-1 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>写真を選ぶ</span>
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
              <span className="font-bold text-teal-dark block">パスポートに登録中</span>
              最後の体験パスポートにこの写真が表示されます
            </div>
          </div>
        )}
      </div>

      {/* Prompt Launcher */}
      <PromptLauncher
        title="3Dアバターをつくる指示文"
        subtitle="ChatGPTやGeminiに送信して、あなただけのアバター画像を作ってもらいましょう。"
        targetType="avatar"
        prompt={avatarPrompt}
        anatomy={{
          role: 'プロの3Dキャラクターデザイナー',
          objective: '顔写真や好みに合わせた立体アバター画像の作成',
          constraints: '親しみやすい立体感、やわらかな光、正面からのポートレート',
          outputFormat: '正方形のイラスト画像',
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
        <span>次は ロボットふれあい（CARE）へ進む</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}
