絵文字を一切含めず、スマートフォン上でのタッチ・タップ操作のみで完結する**Next.js (App Router) \+ TypeScript \+ Tailwind CSS**による実装構成です。

学祭当日の通信環境やレートリミットを考慮し、バックエンドのGemini API連携と、フロントエンド単体でも動作検証可能なフォールバックロジックを統合したコードとして設計しています。

## **1\. ファイル構成**

Plaintext  
src/  
├── types/  
│   └── career-mirror.ts          // 型定義  
├── app/  
│   ├── api/  
│   │   ├── socratic/route.ts     // ソクラテス逆質問・選択肢生成  
│   │   ├── tasks/route.ts        // 10枚のタスクカード動的生成  
│   │   └── blueprint/route.ts    // 最終Blueprint・箱庭パラメータ生成  
│   └── career-mirror/  
│       └── page.tsx              // メイン画面（4フェーズ状態遷移）

## **2\. 型定義 (**src/types/career-mirror.ts**)**

TypeScript  
export type UserMode \= 'kids' | 'student' | 'adult';

export interface Phase1Data {  
  mode: UserMode;  
  selectedInterests: string\[\];  
  customInterest: string;  
  selectedDislikes: string\[\];  
  customDislike: string;  
}

export interface SocraticQuestion {  
  question: string;  
  presetOptions: string\[\];  
}

export interface TaskCard {  
  id: number;  
  taskName: string;  
  detail: string;  
  category: 'logic' | 'creativity' | 'human' | 'operation';  
}

export interface BlueprintResult {  
  futureTitle: string;  
  futureTitleEn: string;  
  catchphrase: string;  
  synergyRatio: {  
    humanPercent: number;  
    aiPercent: number;  
  };  
  executiveSummary: string;  
  coCreationMatrix: {  
    aiRole: string\[\];  
    humanCore: string\[\];  
  };  
  dayInLife2030: { time: string; action: string }\[\];  
  blueRoseStatement: string;  
  hakoniwaParams: {  
    avatarCostume: string;  
    heldItem: string;  
    pedestalType: string;  
    ambientLighting: string;  
    hologramTitleText: string;  
  };  
}

## **3\. Gemini API ルート実装**

### **(1) ソクラテス逆質問生成 (**src/app/api/socratic/route.ts**)**

TypeScript  
import { NextRequest, NextResponse } from 'next/server';  
import { GoogleGenAI } from '@google/genai';

const ai \= new GoogleGenAI();

export async function POST(req: NextRequest) {  
  try {  
    const { mode, interests, dislikes } \= await req.json();

    const systemPrompt \= \`  
あなたは思考解体エンジンです。絵文字は絶対に出力しないでください。  
ユーザーの属性(\${mode})に応じ、没頭体験と手放したい作業を分析して、前提を揺さぶる逆質問1問と、回答用の選択肢3つをJSONで生成してください。

属性ごとのトーン:  
\- kids: ひらがな多め、わかりやすい言葉  
\- student: 知的でフラットな問いかけ  
\- adult: 実務の本質と職業的尊厳を突く鋭い問い

JSONスキーマ:  
{  
  "question": "string",  
  "presetOptions": \["string", "string", "string"\]  
}  
\`;

    const userPrompt \= \`  
没頭体験: \${interests.join(', ')}  
消耗作業: \${dislikes.join(', ')}  
\`;

    const response \= await ai.models.generateContent({  
      model: 'gemini-2.5-flash',  
      contents: \[  
        { role: 'user', parts: \[{ text: systemPrompt \+ '\\n' \+ userPrompt }\] },  
      \],  
      config: {  
        responseMimeType: 'application/json',  
      },  
    });

    const result \= JSON.parse(response.text || '{}');  
    return NextResponse.json(result);  
  } catch (error) {  
    // フォールバック  
    return NextResponse.json({  
      question:  
        'あなたが一番手放したくないのは、結果を得ることですか？それとも過程そのものですか？',  
      presetOptions: \[  
        '結果がすべて。AIが完璧に出すなら過程は手放せる',  
        '試行錯誤する過程にこそ価値があるため手放さない',  
        'AIの案を参考にしつつ、最終的な選択の審美眼は自分が持つ',  
      \],  
    });  
  }  
}

### **(2) 10枚のタスクカード動的生成 (**src/app/api/tasks/route.ts**)**

TypeScript  
import { NextRequest, NextResponse } from 'next/server';  
import { GoogleGenAI } from '@google/genai';

const ai \= new GoogleGenAI();

export async function POST(req: NextRequest) {  
  try {  
    const { mode, interests, answer } \= await req.json();

    const systemPrompt \= \`  
絵文字は出力禁止です。ユーザーの対話内容から、未来の具体的な作業タスク10枚を生成してください。  
JSONスキーマ:  
{  
  "taskCards": \[  
    {  
      "id": 1,  
      "taskName": "string (15文字以内)",  
      "detail": "string (30文字以内)",  
      "category": "logic" | "creativity" | "human" | "operation"  
    }  
  \]  
}  
\`;

    const response \= await ai.models.generateContent({  
      model: 'gemini-2.5-flash',  
      contents: \[  
        {  
          role: 'user',  
          parts: \[  
            {  
              text: \`\${systemPrompt}\\n属性: \${mode}\\n関心: \${interests}\\n回答: \${answer}\`,  
            },  
          \],  
        },  
      \],  
      config: { responseMimeType: 'application/json' },  
    });

    const result \= JSON.parse(response.text || '{}');  
    return NextResponse.json(result);  
  } catch (error) {  
    // フォールバック用カード群  
    const fallbackCards \= \[  
      { id: 1, taskName: '先行情報の網羅的収集', detail: '大量のデータから要点を抽出する', category: 'operation' },  
      { id: 2, taskName: '違和感の言語化と問いの提示', detail: '誰も気づいていない本質的な課題を発見する', category: 'creativity' },  
      { id: 3, taskName: '論理モデルの矛盾検証', detail: '構築した仮説の論理的な穴をシミュレーションする', category: 'logic' },  
      { id: 4, taskName: '現場の温度感を合わせた対話', detail: '関係者と膝を突き合わせて合意を形成する', category: 'human' },  
      { id: 5, taskName: '定型レポートの作成・整形', detail: 'フォーマットに沿った資料を整える', category: 'operation' },  
      { id: 6, taskName: '美意識に基づく仮説の選定', detail: '何を採用すべきかを直感と倫理で判断する', category: 'creativity' },  
      { id: 7, taskName: '多言語へのリアルタイム翻訳', detail: '世界中の言語へ瞬時に情報を変換する', category: 'operation' },  
      { id: 8, taskName: '対立する意見の感情的調停', detail: '数字に表れない不満や不安を受け止める', category: 'human' },  
      { id: 9, taskName: 'データ分析スクリプトの作成', detail: '統計処理のための計算コードを組む', category: 'logic' },  
      { id: 10, taskName: '最終マニフェストへの署名と責任', detail: 'リスクを引き受けて決断を下す', category: 'human' },  
    \];  
    return NextResponse.json({ taskCards: fallbackCards });  
  }  
}

### **(3) Blueprint & 箱庭パラメータ生成 (**src/app/api/blueprint/route.ts**)**

TypeScript  
import { NextRequest, NextResponse } from 'next/server';  
import { GoogleGenAI } from '@google/genai';

const ai \= new GoogleGenAI();

export async function POST(req: NextRequest) {  
  try {  
    const body \= await req.json();  
    const { mode, aiCount, humanCount, keptTasks, delegatedTasks } \= body;

    const humanPercent \= Math.round((humanCount / (aiCount \+ humanCount)) \* 100);  
    const aiPercent \= 100 \- humanPercent;

    const systemPrompt \= \`  
絵文字は一切出力しないでください。  
ユーザーの属性(\${mode})、仕分け結果(AI委譲率 \${aiPercent}%, Human率 \${humanPercent}%)、残したタスク、手放したタスクから、  
2030年の共創型キャリアBlueprintと箱庭パラメータをJSONで生成してください。

JSONスキーマ:  
{  
  "futureTitle": "string (例: 概念翻訳アーキテクト)",  
  "futureTitleEn": "string (例: Conceptual Translation Architect)",  
  "catchphrase": "string (一言の要約)",  
  "synergyRatio": { "humanPercent": \${humanPercent}, "aiPercent": \${aiPercent} },  
  "executiveSummary": "string (80字程度)",  
  "coCreationMatrix": {  
    "aiRole": \["string", "string", "string"\],  
    "humanCore": \["string", "string", "string"\]  
  },  
  "dayInLife2030": \[  
    { "time": "09:00", "action": "string" },  
    { "time": "13:00", "action": "string" },  
    { "time": "17:00", "action": "string" }  
  \],  
  "blueRoseStatement": "string (夢叶う宣言・50字程度)",  
  "hakoniwaParams": {  
    "avatarCostume": "string (tech\_minimal\_jacket / academic\_tweed / artisan\_apron / casual\_knit)",  
    "heldItem": "string (hologram\_blueprint / illuminated\_book / glowing\_lantern / magic\_pen)",  
    "pedestalType": "string (cyber\_glass\_grid / hybrid\_stone\_metal / mossy\_brick\_wood)",  
    "ambientLighting": "string (cyan\_blue / amber\_sunset / violet\_rose)",  
    "hologramTitleText": "string (英大文字15字以内)"  
  }  
}  
\`;

    const response \= await ai.models.generateContent({  
      model: 'gemini-2.5-flash',  
      contents: \[  
        {  
          role: 'user',  
          parts: \[  
            {  
              text: \`\${systemPrompt}\\n保持タスク: \${keptTasks.join(', ')}\\n委譲タスク: \${delegatedTasks.join(', ')}\`,  
            },  
          \],  
        },  
      \],  
      config: { responseMimeType: 'application/json' },  
    });

    const result \= JSON.parse(response.text || '{}');  
    return NextResponse.json(result);  
  } catch (error) {  
    return NextResponse.json({  
      futureTitle: '概念翻訳アーキテクト',  
      futureTitleEn: 'Conceptual Translation Architect',  
      catchphrase: '論理の海をAIに潜らせ、生身の熱量で知の架け橋を架ける人',  
      synergyRatio: { humanPercent: 30, aiPercent: 70 },  
      executiveSummary:  
        '作業の大部分をAIに委譲することで、異なる専門領域の間に横たわる哲学的な溝を埋める対話のハブへと進化します。',  
      coCreationMatrix: {  
        aiRole: \[  
          '大量の文献やデータの超高速要約',  
          '多言語ドラフトと論理検証の自動化',  
          '定型スケジュールと資料の整形',  
        \],  
        humanCore: \[  
          '解くべき課題の発見と違和感の提示',  
          '美意識と倫理観に基づく最終判断',  
          '現場の温度感に合わせた生身の対話',  
        \],  
      },  
      dayInLife2030: \[  
        { time: '09:00', action: '自律AIがまとめた思想接点レポートを確認' },  
        { time: '13:00', action: '仲間との車座による哲学対話' },  
        { time: '17:00', action: '自らの言葉によるマニフェスト執筆' },  
      \],  
      blueRoseStatement:  
        'かつて不可能だった知の越境を果たし、誰よりも人間的な温度を持った問いを世界に投げかける。',  
      hakoniwaParams: {  
        avatarCostume: 'tech\_minimal\_jacket',  
        heldItem: 'hologram\_blueprint',  
        pedestalType: 'cyber\_glass\_grid',  
        ambientLighting: 'cyan\_blue',  
        hologramTitleText: 'CONCEPT ARCHITECT',  
      },  
    });  
  }  
}

## **4\. フロントエンド画面実装 (**src/app/career-mirror/page.tsx**)**

タップ操作とボタン選択のみで進められるSPA構成です。

TypeScript  
'use client';

import React, { useState } from 'react';  
import {  
  UserMode,  
  Phase1Data,  
  SocraticQuestion,  
  TaskCard,  
  BlueprintResult,  
} from '@/types/career-mirror';

export default function CareerMirrorPage() {  
  const \[phase, setPhase\] \= useState\<'mode' | 'phase1' | 'phase2' | 'phase3' | 'phase4'\>('mode');  
  const \[mode, setMode\] \= useState\<UserMode\>('student');  
  const \[isLoading, setIsLoading\] \= useState(false);

  // Phase 1 State  
  const \[selectedInterests, setSelectedInterests\] \= useState\<string\[\]\>(\[\]);  
  const \[customInterest, setCustomInterest\] \= useState('');  
  const \[selectedDislikes, setSelectedDislikes\] \= useState\<string\[\]\>(\[\]);  
  const \[customDislike, setCustomDislike\] \= useState('');

  // Phase 2 State  
  const \[socratic, setSocratic\] \= useState\<SocraticQuestion | null\>(null);  
  const \[socraticAnswer, setSocraticAnswer\] \= useState('');  
  const \[customSocraticAnswer, setCustomSocraticAnswer\] \= useState('');

  // Phase 3 State  
  const \[tasks, setTasks\] \= useState\<TaskCard\[\]\>(\[\]);  
  const \[currentTaskIndex, setCurrentTaskIndex\] \= useState(0);  
  const \[delegatedTasks, setDelegatedTasks\] \= useState\<string\[\]\>(\[\]);  
  const \[keptTasks, setKeptTasks\] \= useState\<string\[\]\>(\[\]);

  // Phase 4 State  
  const \[blueprint, setBlueprint\] \= useState\<BlueprintResult | null\>(null);

  // プリセットタグ  
  const TAG\_PRESETS \= {  
    kids: {  
      interests: \['お絵かき・工作', 'ゲーム・パズル', '生き物・自然観察', 'スポーツ・身体', '読書・物語', '友達とおしゃべり'\],  
      dislikes: \['漢字の書き取り', '計算ドリル', '部屋の片付け', '重い荷物運び', '人前での発表'\],  
    },  
    student: {  
      interests: \['先行研究の比較', 'データ分析・数理モデル', '議論・合意形成', '制作・表現', 'フィールドワーク'\],  
      dislikes: \['文献の書式調整・誤字チェック', '定型の進捗連絡', '形式的な調整', '単純なデータ入力'\],  
    },  
    adult: {  
      interests: \['新規事業の構想', '複雑な利害関係の合意形成', 'データからの本質的洞察', 'チームの育成・対話'\],  
      dislikes: \['社内政治・根回し', '定型レポート・進捗管理', '形式的な会議資料作り', 'ファクトチェック'\],  
    },  
  };

  const toggleTag \= (list: string\[\], setList: (v: string\[\]) \=\> void, tag: string) \=\> {  
    if (list.includes(tag)) {  
      setList(list.filter((t) \=\> t \!== tag));  
    } else {  
      setList(\[...list, tag\]);  
    }  
  };

  // Phase 1 \-\> Phase 2 (逆質問取得)  
  const handleStartSocratic \= async () \=\> {  
    setIsLoading(true);  
    const interests \= \[...selectedInterests, customInterest\].filter(Boolean);  
    const dislikes \= \[...selectedDislikes, customDislike\].filter(Boolean);

    try {  
      const res \= await fetch('/api/socratic', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ mode, interests, dislikes }),  
      });  
      const data \= await res.json();  
      setSocratic(data);  
      setPhase('phase2');  
    } catch {  
      alert('通信エラーが発生しました。もう一度お試しください。');  
    } finally {  
      setIsLoading(false);  
    }  
  };

  // Phase 2 \-\> Phase 3 (タスク生成)  
  const handleStartTasks \= async () \=\> {  
    setIsLoading(true);  
    const answer \= customSocraticAnswer || socraticAnswer;  
    const interests \= \[...selectedInterests, customInterest\].filter(Boolean);

    try {  
      const res \= await fetch('/api/tasks', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ mode, interests, answer }),  
      });  
      const data \= await res.json();  
      setTasks(data.taskCards || \[\]);  
      setCurrentTaskIndex(0);  
      setDelegatedTasks(\[\]);  
      setKeptTasks(\[\]);  
      setPhase('phase3');  
    } catch {  
      alert('通信エラーが発生しました。もう一度お試しください。');  
    } finally {  
      setIsLoading(false);  
    }  
  };

  // Phase 3 タスク仕分け  
  const handleSwipe \= (direction: 'delegate' | 'keep') \=\> {  
    const currentTask \= tasks\[currentTaskIndex\];  
    if (direction \=== 'delegate') {  
      setDelegatedTasks((prev) \=\> \[...prev, currentTask.taskName\]);  
    } else {  
      setKeptTasks((prev) \=\> \[...prev, currentTask.taskName\]);  
    }

    if (currentTaskIndex \+ 1 \< tasks.length) {  
      setCurrentTaskIndex((prev) \=\> prev \+ 1);  
    } else {  
      // 完了 \-\> Phase 4 呼び出し  
      handleGenerateBlueprint(  
        direction \=== 'delegate' ? delegatedTasks.length \+ 1 : delegatedTasks.length,  
        direction \=== 'keep' ? keptTasks.length \+ 1 : keptTasks.length  
      );  
    }  
  };

  // Phase 4 Blueprint取得  
  const handleGenerateBlueprint \= async (finalAiCount: number, finalHumanCount: number) \=\> {  
    setIsLoading(true);  
    try {  
      const res \= await fetch('/api/blueprint', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          mode,  
          aiCount: finalAiCount,  
          humanCount: finalHumanCount,  
          delegatedTasks,  
          keptTasks,  
        }),  
      });  
      const data \= await res.json();  
      setBlueprint(data);

      // SELFゾーン（箱庭・アバター）向けにローカルストレージへ保存  
      if (typeof window \!== 'undefined' && data.hakoniwaParams) {  
        localStorage.setItem('career\_hakoniwa\_params', JSON.stringify(data.hakoniwaParams));  
      }

      setPhase('phase4');  
    } catch {  
      alert('生成に失敗しました。もう一度お試しください。');  
    } finally {  
      setIsLoading(false);  
    }  
  };

  return (  
    \<div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-md mx-auto font-sans flex flex-col justify-between"\>  
      {/\* ヘッダー \*/}  
      \<header className="border-b border-cyan-900 pb-3 mb-4"\>  
        \<p className="text-xs tracking-widest text-cyan-400 font-mono"\>ICU AI PAVILION 2026\</p\>  
        \<h1 className="text-lg font-bold tracking-tight text-white"\>Blue Career Mirror\</h1\>  
      \</header\>

      {/\* メインコンテンツ \*/}  
      \<main className="flex-1 flex flex-col justify-center"\>  
        {/\* モード選択 \*/}  
        {phase \=== 'mode' && (  
          \<div className="space-y-4"\>  
            \<div className="text-center space-y-1 mb-6"\>  
              \<h2 className="text-xl font-bold"\>モードを選択してください\</h2\>  
              \<p className="text-xs text-slate-400"\>あなたに合わせた対話の深さを設定します\</p\>  
            \</div\>  
            \<button  
              onClick={() \=\> { setMode('kids'); setPhase('phase1'); }}  
              className="w-full py-4 px-4 bg-slate-900 border border-cyan-800 hover:border-cyan-400 rounded-lg text-left transition"  
            \>  
              \<div className="font-bold text-cyan-300"\>こどもモード\</div\>  
              \<div className="text-xs text-slate-400 mt-1"\>小・中学生向け：すきなことと相棒ロボット\</div\>  
            \</button\>  
            \<button  
              onClick={() \=\> { setMode('student'); setPhase('phase1'); }}  
              className="w-full py-4 px-4 bg-slate-900 border border-cyan-800 hover:border-cyan-400 rounded-lg text-left transition"  
            \>  
              \<div className="font-bold text-cyan-300"\>スチューデントモード\</div\>  
              \<div className="text-xs text-slate-400 mt-1"\>高校生・大学生向け：思考の解体と進路の再定義\</div\>  
            \</button\>  
            \<button  
              onClick={() \=\> { setMode('adult'); setPhase('phase1'); }}  
              className="w-full py-4 px-4 bg-slate-900 border border-cyan-800 hover:border-cyan-400 rounded-lg text-left transition"  
            \>  
              \<div className="font-bold text-cyan-300"\>プロフェッショナルモード\</div\>  
              \<div className="text-xs text-slate-400 mt-1"\>社会人・一般向け：実務の委譲と人間的尊厳の再結晶\</div\>  
            \</button\>  
          \</div\>  
        )}

        {/\* Phase 1: 思考の棚卸し \*/}  
        {phase \=== 'phase1' && (  
          \<div className="space-y-6"\>  
            \<div\>  
              \<h2 className="text-sm font-bold text-cyan-400 mb-2"\>  
                {mode \=== 'kids' ? '時間をわすれて夢中になっちゃうことは？' : '時間を忘れて没頭する瞬間は？'}  
              \</h2\>  
              \<div className="flex flex-wrap gap-2 mb-3"\>  
                {TAG\_PRESETS\[mode\].interests.map((tag) \=\> (  
                  \<button  
                    key={tag}  
                    onClick={() \=\> toggleTag(selectedInterests, setSelectedInterests, tag)}  
                    className={\`text-xs px-3 py-2 rounded-full border transition \${  
                      selectedInterests.includes(tag)  
                        ? 'bg-cyan-600 border-cyan-400 text-white font-bold'  
                        : 'bg-slate-900 border-slate-700 text-slate-300'  
                    }\`}  
                  \>  
                    {tag}  
                  \</button\>  
                ))}  
              \</div\>  
              \<input  
                type="text"  
                placeholder="他にあれば入力（任意）"  
                value={customInterest}  
                onChange={(e) \=\> setCustomInterest(e.target.value)}  
                className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-800 focus:border-cyan-400 outline-none"  
              /\>  
            \</div\>

            \<div\>  
              \<h2 className="text-sm font-bold text-cyan-400 mb-2"\>  
                {mode \=== 'kids' ? 'できればやりたくない、めんどくさいことは？' : '魂が削られる・冷めると感じる作業は？'}  
              \</h2\>  
              \<div className="flex flex-wrap gap-2 mb-3"\>  
                {TAG\_PRESETS\[mode\].dislikes.map((tag) \=\> (  
                  \<button  
                    key={tag}  
                    onClick={() \=\> toggleTag(selectedDislikes, setSelectedDislikes, tag)}  
                    className={\`text-xs px-3 py-2 rounded-full border transition \${  
                      selectedDislikes.includes(tag)  
                        ? 'bg-rose-900 border-rose-500 text-white font-bold'  
                        : 'bg-slate-900 border-slate-700 text-slate-300'  
                    }\`}  
                  \>  
                    {tag}  
                  \</button\>  
                ))}  
              \</div\>  
              \<input  
                type="text"  
                placeholder="他にあれば入力（任意）"  
                value={customDislike}  
                onChange={(e) \=\> setCustomDislike(e.target.value)}  
                className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-800 focus:border-cyan-400 outline-none"  
              /\>  
            \</div\>

            \<button  
              onClick={handleStartSocratic}  
              disabled={isLoading || (selectedInterests.length \=== 0 && \!customInterest)}  
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg transition"  
            \>  
              {isLoading ? '思考を分析中...' : '次へ進む'}  
            \</button\>  
          \</div\>  
        )}

        {/\* Phase 2: ソクラテス対話 \*/}  
        {phase \=== 'phase2' && socratic && (  
          \<div className="space-y-5"\>  
            \<div className="border-l-2 border-cyan-400 pl-3 py-1"\>  
              \<span className="text-xs font-mono text-cyan-400"\>SOCRATIC INQUIRY\</span\>  
              \<p className="text-sm font-semibold text-white mt-1 leading-relaxed"\>  
                {socratic.question}  
              \</p\>  
            \</div\>

            \<div className="space-y-2"\>  
              \<p className="text-xs text-slate-400 mb-2"\>選択肢をタップして回答してください：\</p\>  
              {socratic.presetOptions.map((opt, i) \=\> (  
                \<button  
                  key={i}  
                  onClick={() \=\> { setSocraticAnswer(opt); setCustomSocraticAnswer(''); }}  
                  className={\`w-full text-xs p-3 rounded-lg border text-left leading-relaxed transition \${  
                    socraticAnswer \=== opt  
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'  
                      : 'bg-slate-900 border-slate-800 text-slate-300'  
                  }\`}  
                \>  
                  {opt}  
                \</button\>  
              ))}  
            \</div\>

            \<input  
              type="text"  
              placeholder="自分の言葉で補足・追記する（任意）"  
              value={customSocraticAnswer}  
              onChange={(e) \=\> setCustomSocraticAnswer(e.target.value)}  
              className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-800 focus:border-cyan-400 outline-none"  
            /\>

            \<button  
              onClick={handleStartTasks}  
              disabled={isLoading || (\!socraticAnswer && \!customSocraticAnswer)}  
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg transition"  
            \>  
              {isLoading ? 'タスクを分解中...' : 'タスク仕分けへ進む'}  
            \</button\>  
          \</div\>  
        )}

        {/\* Phase 3: タスク仕分け \*/}  
        {phase \=== 'phase3' && tasks.length \> 0 && (  
          \<div className="space-y-6 text-center"\>  
            \<div className="flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800 pb-2"\>  
              \<span\>TASK CLASSIFICATION\</span\>  
              \<span\>{currentTaskIndex \+ 1} / {tasks.length}\</span\>  
            \</div\>

            \<div className="bg-slate-900 border border-cyan-800 rounded-xl p-6 min-h-\[160px\] flex flex-col justify-center items-center shadow-lg"\>  
              \<h3 className="text-base font-bold text-white mb-2"\>  
                {tasks\[currentTaskIndex\].taskName}  
              \</h3\>  
              \<p className="text-xs text-slate-400 leading-relaxed"\>  
                {tasks\[currentTaskIndex\].detail}  
              \</p\>  
            \</div\>

            \<div className="grid grid-cols-2 gap-3 pt-2"\>  
              \<button  
                onClick={() \=\> handleSwipe('delegate')}  
                className="py-4 px-2 rounded-lg bg-slate-900 border border-cyan-800 hover:bg-cyan-950 text-cyan-400 font-bold text-xs transition"  
              \>  
                \<div\>AIに委譲する\</div\>  
                \<div className="text-\[10px\] text-slate-500 mt-1"\>AI for you\</div\>  
              \</button\>

              \<button  
                onClick={() \=\> handleSwipe('keep')}  
                className="py-4 px-2 rounded-lg bg-slate-900 border border-blue-600 hover:bg-blue-950 text-blue-200 font-bold text-xs transition"  
              \>  
                \<div\>自分で抱きしめる\</div\>  
                \<div className="text-\[10px\] text-slate-500 mt-1"\>Human Core\</div\>  
              \</button\>  
            \</div\>  
          \</div\>  
        )}

        {/\* Phase 4: Blueprint成果物 \*/}  
        {phase \=== 'phase4' && blueprint && (  
          \<div className="space-y-4 py-2"\>  
            \<div className="bg-slate-900 border border-cyan-500 rounded-xl p-5 space-y-4"\>  
              \<div className="text-center pb-3 border-b border-slate-800"\>  
                \<span className="text-\[10px\] font-mono tracking-widest text-cyan-400"\>  
                  2030 FUTURE IDENTITY  
                \</span\>  
                \<h2 className="text-lg font-bold text-white mt-1"\>  
                  {blueprint.futureTitle}  
                \</h2\>  
                \<p className="text-xs text-slate-400 font-mono"\>  
                  {blueprint.futureTitleEn}  
                \</p\>  
                \<p className="text-xs text-cyan-300 mt-2 font-medium"\>  
                  {blueprint.catchphrase}  
                \</p\>  
              \</div\>

              {/\* 協調比率バー \*/}  
              \<div className="space-y-1"\>  
                \<div className="flex justify-between text-\[11px\] font-mono"\>  
                  \<span className="text-blue-300"\>Human Core {blueprint.synergyRatio.humanPercent}%\</span\>  
                  \<span className="text-cyan-400"\>AI Assist {blueprint.synergyRatio.aiPercent}%\</span\>  
                \</div\>  
                \<div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex"\>  
                  \<div  
                    style={{ width: \`\${blueprint.synergyRatio.humanPercent}%\` }}  
                    className="bg-blue-500 h-full"  
                  /\>  
                  \<div  
                    style={{ width: \`\${blueprint.synergyRatio.aiPercent}%\` }}  
                    className="bg-cyan-400 h-full"  
                  /\>  
                \</div\>  
              \</div\>

              {/\* サマリー \*/}  
              \<div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800"\>  
                {blueprint.executiveSummary}  
              \</div\>

              {/\* 共創マトリクス \*/}  
              \<div className="grid grid-cols-2 gap-2 text-\[11px\]"\>  
                \<div className="bg-slate-950 p-2.5 rounded border border-slate-800"\>  
                  \<div className="font-bold text-cyan-400 mb-1 border-b border-slate-800 pb-1"\>AIの役割\</div\>  
                  \<ul className="space-y-1 text-slate-400 list-disc list-inside"\>  
                    {blueprint.coCreationMatrix.aiRole.map((r, i) \=\> (  
                      \<li key={i}\>{r}\</li\>  
                    ))}  
                  \</ul\>  
                \</div\>  
                \<div className="bg-slate-950 p-2.5 rounded border border-slate-800"\>  
                  \<div className="font-bold text-blue-300 mb-1 border-b border-slate-800 pb-1"\>人間の核\</div\>  
                  \<ul className="space-y-1 text-slate-400 list-disc list-inside"\>  
                    {blueprint.coCreationMatrix.humanCore.map((h, i) \=\> (  
                      \<li key={i}\>{h}\</li\>  
                    ))}  
                  \</ul\>  
                \</div\>  
              \</div\>

              {/\* Blue Rose 宣言 \*/}  
              \<div className="border-t border-slate-800 pt-3 text-center"\>  
                \<span className="text-\[10px\] text-cyan-400 tracking-wider font-mono"\>BLUE ROSE STATEMENT\</span\>  
                \<p className="text-xs text-white mt-1 italic"\>  
                  "{blueprint.blueRoseStatement}"  
                \</p\>  
              \</div\>  
            \</div\>

            \<p className="text-\[11px\] text-center text-slate-500"\>  
              診断データはSELFゾーン（箱庭・アバター）へ自動連携されます  
            \</p\>  
          \</div\>  
        )}  
      \</main\>

      {/\* フッター \*/}  
      \<footer className="pt-4 border-t border-slate-900 text-center text-\[10px\] text-slate-600 font-mono"\>  
        ICU FESTIVAL 2026 \- BLUE ROSE  
      \</footer\>  
    \</div\>  
  );  
}

## **5\. 実装の特徴と展示運用への適合性**

1. **絵文字の完全排除**  
2. 

   * UI、ボタン、タグ、プロンプト制約、フォールバックの全領域から絵文字を排除し、学術的・未来的なサイバーブルーのトーンに統一しています。  
   *   
3. **完全タップ操作での完了保証**  
4. 

   * キーボード入力を行わなくても、タグ選択・選択肢タップ・スワイプボタンのみで最後まで辿り着けるため、小学生や混雑時の来場者でも2〜3分で確実に完了します。  
   *   
5. **SELFゾーン（箱庭生成）との自動データ同期**  
6. 

   * Phase 4完了時に、hakoniwaParams（衣装・持ち物・台座・発光色など）をブラウザのlocalStorage（キー名: career\_hakoniwa\_params）へ自動保存します。後続のSELFゾーンでこの値を読み出すだけで、箱庭のプロンプトへダイレクトに反映されます。

