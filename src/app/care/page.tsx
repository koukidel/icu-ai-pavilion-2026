'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import { CareResult, LovotProfile } from '@/types/pavilion';
import { PromptLauncher } from '@/components/common/PromptLauncher';
import confetti from 'canvas-confetti';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  Check,
  RotateCcw,
} from 'lucide-react';

export default function CareZonePage() {
  const router = useRouter();
  const { work, self, care, setCare } = usePavilionSession();

  const [lovotPhotoUrl, setLovotPhotoUrl] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string>('icu_forest');

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
    { id: 'icu_forest', label: 'ICUの木漏れ日並木道', desc: '緑豊かな大学のキャンパス' },
    { id: 'bakayama', label: 'ICUバカ山の芝生広場', desc: '青空の下でのんびりピクニック' },
    { id: 'cyber_cafe', label: '未来のブックカフェ', desc: '温かいカフェでおしゃべり' },
    { id: 'starlit_night', label: '星降る夜のキャンパス', desc: '星空の下で寄り添う' },
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
      interactionLabel: '記念写真',
      reflectionNote: `LOVOTとの記念写真: ${scenes.find((s) => s.id === selectedScene)?.label || 'キャンパス'}`,
      timestamp: new Date().toISOString(),
    };

    setCare(careData);
  };

  const futureTitle = work?.futureTitle || '未来の探究者';
  const activeSceneObj = scenes.find((s) => s.id === selectedScene)!;

  // Plain & Charming LOVOT Photo Prompt
  const lovotPrompt = `あなたはプロのフォトグラファーです。
添付した家庭用ロボット「LOVOT（らぼっと）」の写真をもとに、思わずSNSに載せたくなるような、最高にかわいい写真を生成してください。

【写真の設定】
- 場所: ${activeSceneObj.label}（${activeSceneObj.desc}）
- 設定: 私（${futureTitle}）の頼れる可愛いパートナーロボット
- 雰囲気: やわらかな自然光、あたたかみのある色合い、一眼レフで撮ったような背景のきれいなボケ感
- LOVOTの表情: くりっとした潤んだ瞳、やわらかそうな身体、頭のツノ（センサーホーン）がほんのり温かく光る愛らしい姿

添付写真のLOVOTの丸いフォルムと愛嬌を活かして、心温まるすてきな1枚を出力してください。`;

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
            ZONE 04 : ロボットふれあい
          </span>
          <span className="text-[10px] text-ink/50">LOVOT</span>
        </div>
        <h1 className="text-xl font-extrabold text-ink">LOVOT写真コーナー</h1>
        <p className="text-xs text-ink/70 leading-relaxed">
          ブースにいるロボット（LOVOT）の写真を撮って、好きな背景を選ぶと、AIへの指示文が作れます。ChatGPTやGeminiに送ると、SNSに載せたくなる可愛い記念写真を作ってくれます。
        </p>
      </section>

      {/* 1. Take or Choose LOVOT Photo */}
      <div className="p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink">1. ロボット（LOVOT）を撮影する</span>
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
              <RotateCcw className="w-3 h-3" /> 撮り直す
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
                <span>カメラで撮る</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 rounded-2xl bg-paper-light border border-teal/20 text-teal-dark text-xs font-bold hover:bg-teal-light flex flex-col items-center justify-center gap-1 shadow-xs active:scale-98 transition-all"
              >
                <Upload className="w-5 h-5 text-teal" />
                <span>写真を選ぶ</span>
              </button>
            </div>

            {/* Sample selection */}
            <div className="pt-2 border-t border-black/[0.04] text-center">
              <span className="text-[10px] text-ink/60 block mb-1.5">
                または サンプル写真で試す
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

      {/* 2. Scene Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink flex items-center justify-between">
          <span>2. 写真の背景を選ぶ</span>
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
          <span>これまでの診断結果もプロンプトに反映されます</span>
        </div>
        <p className="text-[11px] text-ink/75 leading-relaxed">
          WORKコーナーで見つけたあなたの未来像<strong>「{futureTitle}」</strong>の頼れる相棒として、LOVOTが寄り添う設定になります。
        </p>
      </div>

      {/* Prompt Launcher */}
      <PromptLauncher
        title="かわいい写真をつくる指示文"
        subtitle="ChatGPTやGeminiに送信（LOVOTの写真を添付）して、かわいい写真を作ってもらいましょう。"
        targetType="photo"
        prompt={lovotPrompt}
        anatomy={{
          role: 'プロのフォトグラファー',
          objective: 'LOVOT写真とキャンパスの風景を合わせた素敵な写真の生成',
          constraints: 'やわらかな自然光、あたたかい色合い、LOVOTの丸い可愛さを活かす',
          outputFormat: '正方形または縦型の写真画像',
        }}
        userPreferences={{
          scene: selectedScene,
          futureTitle,
        }}
      />

      {/* Next Navigation to Final Passport */}
      <button
        onClick={() => router.push('/passport')}
        className="w-full py-3.5 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1.5 shadow-sm transition-all"
      >
        <span>体験パスポートを見る</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}
