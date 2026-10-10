'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { CareResult, LovotProfile } from '@/types/pavilion';
import { PromptLauncher } from '@/components/common/PromptLauncher';
import confetti from 'canvas-confetti';
import {
  Heart,
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  Share2,
  Instagram,
  RotateCcw,
} from 'lucide-react';

export default function CareZonePage() {
  const router = useRouter();
  const { work, self, make, care, setCare } = usePavilionSession();

  const [lovotPhotoUrl, setLovotPhotoUrl] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string>('icu_forest');
  const [companionRole, setCompanionRole] = useState<string>('partner');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const sampleLovotPhotos = [
    {
      id: 'sample-1',
      title: 'ブースのLOVOT',
      url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=400&q=80',
      tag: '展示ロボット',
    },
    {
      id: 'sample-2',
      title: '抱っこスタイル',
      url: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&q=80',
      tag: 'ふれあい',
    },
  ];

  const scenes = [
    { id: 'icu_forest', label: 'ICUの木漏れ日並木道', desc: '新緑と柔らかな自然光' },
    { id: 'bakayama', label: 'ICUバカ山の芝生広場', desc: '青空とピクニック気分' },
    { id: 'cyber_cafe', label: '未来のブックカフェ', desc: '知的な空間でリラックス' },
    { id: 'starlit_night', label: '星降る夜のキャンパス', desc: 'ツノが優しく光る幻想的な夜' },
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLovotPhotoUrl(dataUrl);
      saveCareData(dataUrl);
      confetti({ particleCount: 30, spread: 50 });
    };
    reader.readAsDataURL(file);
  };

  const saveCareData = (photoUrl?: string) => {
    const sampleProfile: LovotProfile = {
      id: 'lovot-icu-2026',
      name: 'こころ（LOVOT）',
      colorName: 'まっちゃ',
      bodyColor: '#4d7c0f',
      eyeColor: '#168eac',
      hornColor: '#f59e0b',
      personality: '好奇心旺盛であまえんぼう',
      favoriteThing: 'ぎゅっと抱きしめられること',
    };

    const careData: CareResult = {
      lovot: sampleProfile,
      interactionType: 'hug',
      interactionLabel: 'ふれあいフォトセッション',
      reflectionNote: `LOVOTとの共創写真: ${scenes.find((s) => s.id === selectedScene)?.label || 'キャンパス'}`,
      timestamp: new Date().toISOString(),
    };

    setCare(careData);
  };

  // User's accumulated context across earlier zones
  const futureTitle = work?.futureTitle || '未来の探究者';
  const avatarMood = self?.userMood || '思索と温もり';
  const activeSceneObj = scenes.find((s) => s.id === selectedScene)!;

  // Instagram / Social Media Shareable Photo Transformation Prompt
  const lovotPrompt = `あなたは世界最高峰の商業フォトグラファーおよびプロンプトデザイナーです。
添付した家庭用ロボット「LOVOT（らぼっと）」の写真をベースに、InstagramやSNSで大きな反響を呼ぶ、極めて愛らしくフォトジェニックな1枚を生成してください。

【撮影シチュエーション & 世界観】
- ロケーション: ${activeSceneObj.label}（${activeSceneObj.desc}）
- コンセプト: 私の2030年の共創肩書「${futureTitle}」に優しく寄り添う、かけがえのないパートナーロボット
- 被写体演出: LOVOTの潤んだ大きな瞳、柔らかそうな温かいファブリック質感、頭頂部のセンサーホーンがほんのり温かく光る様子
- 撮影スタイル: 高級一眼レフカメラ（85mm f/1.4レンズ）、被写体を際立たせる美しい背景ボケ（Bokeh）、ゴールデンアワーの温かな逆光、エモーショナルなシネマティックカラー
- トーン: Instagram/SNS映えする高解像度、温もり、生命感、愛らしさ

添付したLOVOTの丸いフォルムと愛嬌を最大限に引き出した、心温まる奇跡の瞬間を出力してください。`;

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-24 text-ink">
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
        capture="environment"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {/* Intro Header */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-light text-rose-dark text-[10px] font-bold border border-rose/20">
            ZONE 04 : CARE & LOVOT
          </span>
          <span className="text-[10px] font-mono text-ink/50 uppercase">LOVOT STUDIO</span>
        </div>
        <h1 className="text-xl font-extrabold text-ink">LOVOT写真工房</h1>
        <p className="text-xs text-ink/70 leading-relaxed">
          ブースにいるLOVOTを撮影（またはサンプルを選択）すると、他ゾーンで選んだあなたの肩書や世界観を組み込んだ**「SNS映えプロンプト」**が生成されます。
        </p>
      </section>

      {/* 1. Take or Choose LOVOT Photo */}
      <div className="p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink">1. ブースのLOVOTを撮影する</span>
          {lovotPhotoUrl && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> 撮影完了
            </span>
          )}
        </div>

        {lovotPhotoUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-teal/20 aspect-4/3 max-h-52 bg-black/5">
            <img
              src={lovotPhotoUrl}
              alt="LOVOT snapshot"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-ink/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> 再撮影
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="py-3 px-3 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex flex-col items-center justify-center gap-1 shadow-sm active:scale-98 transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>ブースで撮影する</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 rounded-2xl bg-paper-light border border-teal/20 text-teal-dark text-xs font-bold hover:bg-teal-light flex flex-col items-center justify-center gap-1 shadow-xs active:scale-98 transition-all"
              >
                <Upload className="w-5 h-5 text-teal" />
                <span>ライブラリから選択</span>
              </button>
            </div>

            {/* Sample selection */}
            <div className="pt-2 border-t border-black/[0.04] text-center">
              <span className="text-[10px] text-ink/60 block mb-1.5">
                または サンプル写真で体験
              </span>
              <div className="flex gap-2">
                {sampleLovotPhotos.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setLovotPhotoUrl(s.url);
                      saveCareData(s.url);
                    }}
                    className="flex-1 p-1.5 rounded-xl border border-black/[0.06] bg-neutral-50 hover:bg-neutral-100 flex items-center gap-2 text-left"
                  >
                    <img
                      src={s.url}
                      alt={s.title}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="text-[10px]">
                      <span className="font-bold text-ink block">{s.title}</span>
                      <span className="text-ink/50 text-[9px]">{s.tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Scene / Situation Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink flex items-center justify-between">
          <span>2. 写真のシチュエーションを選ぶ</span>
          <span className="text-[10px] text-teal-dark font-mono">
            {activeSceneObj.label}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {scenes.map((sc) => {
            const isSelected = selectedScene === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScene(sc.id);
                  saveCareData();
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-rose bg-rose-light text-rose-dark font-bold shadow-xs'
                    : 'border-black/[0.06] bg-white text-ink/80 hover:bg-neutral-50'
                }`}
              >
                <div className="text-xs font-bold">{sc.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5 leading-snug">{sc.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Integrated Pavilion Context Card */}
      <div className="p-3.5 rounded-2xl bg-paper-light border border-teal/20 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-teal-dark text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>パビリオン体験データがプロンプトへ自動統合</span>
        </div>
        <p className="text-[11px] text-ink/75 leading-relaxed">
          WORKゾーンで導出した2030年の肩書<strong>「{futureTitle}」</strong>が、LOVOTのパートナーシップ設定としてプロンプトに組み込まれます。
        </p>
      </div>

      {/* Prompt Launcher: Send to External LLMs */}
      <PromptLauncher
        title="LOVOT SNS映え写真生成プロンプト"
        subtitle="ChatGPTやGeminiに送信（LOVOTの写真を添付）して、最高に可愛い共創写真を創りましょう。"
        targetType="photo"
        prompt={lovotPrompt}
        anatomy={{
          role: '商業フォトグラファー & シネマティック・ディレクター',
          objective: 'LOVOT写真とICUキャンパス世界観を融合させたSNS向け高解像度写真の生成',
          constraints: '一眼レフ被写界深度（ボケ味）、自然光シネマティックトーン、LOVOT特有の丸みと瞳の愛らしさを保持',
          outputFormat: '高解像度画像（Instagram最適アスペクト比 1:1 または 4:5）',
        }}
        userPreferences={{
          scene: selectedScene,
          futureTitle,
          avatarMood,
        }}
      />

      {/* Next Navigation to Final Passport */}
      <button
        onClick={() => router.push('/passport')}
        className="w-full py-3.5 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1.5 shadow-sm transition-all"
      >
        <span>すべての体験を統合「箱庭パスポート」へ進む</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}
