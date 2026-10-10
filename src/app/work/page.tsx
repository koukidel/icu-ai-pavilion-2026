'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePavilionSession } from '@/context/SessionContext';
import {
  UserMode,
  SocraticQuestion,
  TaskCard,
  BlueprintResult,
} from '@/types/career-mirror';
import { WorkResult } from '@/types/pavilion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PromptLauncher } from '@/components/common/PromptLauncher';

export default function CareerMirrorPage() {
  const router = useRouter();
  const { setWork } = usePavilionSession();

  const [phase, setPhase] = useState<'mode' | 'phase1' | 'phase2' | 'phase3' | 'phase4'>('mode');
  const [mode, setMode] = useState<UserMode>('student');
  const [isLoading, setIsLoading] = useState(false);

  // Phase 1 State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [customDislike, setCustomDislike] = useState('');

  // Phase 2 State
  const [socratic, setSocratic] = useState<SocraticQuestion | null>(null);
  const [socraticAnswer, setSocraticAnswer] = useState('');
  const [customSocraticAnswer, setCustomSocraticAnswer] = useState('');

  // Phase 3 State
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [delegatedTasks, setDelegatedTasks] = useState<string[]>([]);
  const [keptTasks, setKeptTasks] = useState<string[]>([]);

  // Phase 4 State
  const [blueprint, setBlueprint] = useState<BlueprintResult | null>(null);

  // プリセットタグ（構想_AIパビリオン.md 準拠）
  const TAG_PRESETS = {
    kids: {
      interests: [
        'お絵かき・工作',
        'ゲーム・パズル',
        '生き物・自然観察',
        'スポーツ・身体を動かす',
        '読書・物語をつくる',
        '友達とおしゃべり',
      ],
      dislikes: [
        '漢字の書き取り',
        '計算ドリル',
        '部屋の片付け',
        '重い荷物運び',
        '人前での形式的な発表',
      ],
    },
    student: {
      interests: [
        '先行研究の比較と批評',
        'データ分析・数理モデル',
        '議論と合意形成',
        '創作・表現の追求',
        '現場のフィールドワーク',
      ],
      dislikes: [
        '文献の書式調整・誤字チェック',
        '定型の進捗連絡',
        '形式的な根回し調整',
        '単純なデータ入力作業',
      ],
    },
    adult: {
      interests: [
        '新規事業・ビジョンの構想',
        '複雑な利害関係の合意形成',
        'データからの本質的洞察',
        'チームの育成・対話',
      ],
      dislikes: [
        '社内政治・根回し',
        '定型レポート・進捗管理',
        '形式的な会議資料作り',
        '細かなファクトチェック',
      ],
    },
  };

  const toggleTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    if (list.includes(tag)) {
      setList(list.filter((t) => t !== tag));
    } else {
      setList([...list, tag]);
    }
  };

  // Phase 1 -> Phase 2 (Gemini Socratic Question)
  const handleStartSocratic = async () => {
    setIsLoading(true);
    const interests = [...selectedInterests, customInterest].filter(Boolean);
    const dislikes = [...selectedDislikes, customDislike].filter(Boolean);

    try {
      const res = await fetch('/api/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, interests, dislikes }),
      });
      const data = await res.json();
      setSocratic(data);
      setPhase('phase2');
    } catch {
      // fallback
      setSocratic({
        question:
          'あなたが一番手放したくないのは、結果を得ることですか？それとも試行錯誤の過程そのものですか？',
        presetOptions: [
          '結果がすべて。AIが完璧に出すなら過程は手放せる',
          '試行錯誤する過程にこそ価値があるため手放さない',
          'AIの案を参考にしつつ、最終的な選択の審美眼は自分が持つ',
        ],
      });
      setPhase('phase2');
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 2 -> Phase 3 (Gemini 10 Tasks)
  const handleStartTasks = async () => {
    setIsLoading(true);
    const answer = customSocraticAnswer || socraticAnswer;
    const interests = [...selectedInterests, customInterest].filter(Boolean);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, interests, answer }),
      });
      const data = await res.json();
      setTasks(data.taskCards || []);
      setCurrentTaskIndex(0);
      setDelegatedTasks([]);
      setKeptTasks([]);
      setPhase('phase3');
    } catch {
      alert('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 3 タスク仕分け
  const handleSwipe = (direction: 'delegate' | 'keep') => {
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask) return;

    let nextDelegated = [...delegatedTasks];
    let nextKept = [...keptTasks];

    if (direction === 'delegate') {
      nextDelegated.push(currentTask.taskName);
      setDelegatedTasks(nextDelegated);
    } else {
      nextKept.push(currentTask.taskName);
      setKeptTasks(nextKept);
    }

    if (currentTaskIndex + 1 < tasks.length) {
      setCurrentTaskIndex((prev) => prev + 1);
    } else {
      handleGenerateBlueprint(nextDelegated.length, nextKept.length, nextDelegated, nextKept);
    }
  };

  // Phase 4 Blueprint取得
  const handleGenerateBlueprint = async (
    finalAiCount: number,
    finalHumanCount: number,
    finalDelegated: string[],
    finalKept: string[]
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          aiCount: finalAiCount,
          humanCount: finalHumanCount,
          delegatedTasks: finalDelegated,
          keptTasks: finalKept,
        }),
      });
      const data: BlueprintResult = await res.json();
      setBlueprint(data);

      // 箱庭パラメータをローカルストレージに保存
      if (typeof window !== 'undefined' && data.hakoniwaParams) {
        localStorage.setItem('career_hakoniwa_params', JSON.stringify(data.hakoniwaParams));
      }

      // SessionContext にも同期
      const workResult: WorkResult = {
        mode: mode === 'adult' ? 'pro' : mode,
        userInterest: selectedInterests.join(', ') || customInterest || '思考と実践の統合',
        futureTitle: data.futureTitle,
        workStyle: data.synergyRatio.aiPercent > 60 ? 'logical' : data.synergyRatio.humanPercent > 60 ? 'intuitive' : 'balanced',
        synergyRatio: data.synergyRatio.aiPercent,
        delegatedCards: finalDelegated.map((t, idx) => ({ id: `d-${idx}`, label: t, description: '', category: 'execution' })),
        keptCards: finalKept.map((t, idx) => ({ id: `k-${idx}`, label: t, description: '', category: 'thinking' })),
        feedbackSummary: data.executiveSummary,
      };
      setWork(workResult);

      setPhase('phase4');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch {
      alert('生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-4 space-y-4 pb-20 select-none text-ink font-sans">
      {/* Sub Header */}
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-teal-dark">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span>BLUE CAREER MIRROR</span>
        </div>
        <span className="font-mono text-[10px] text-ink/50 uppercase">
          {phase === 'mode' && 'MODE SELECTION'}
          {phase === 'phase1' && 'PHASE 01 : DECONSTRUCTION'}
          {phase === 'phase2' && 'PHASE 02 : SOCRATIC INQUIRY'}
          {phase === 'phase3' && `PHASE 03 : CLASSIFY (${currentTaskIndex + 1}/${tasks.length || 10})`}
          {phase === 'phase4' && 'PHASE 04 : BLUEPRINT 2030'}
        </span>
      </div>

      {/* MODE SELECTION */}
      {phase === 'mode' && (
        <div className="space-y-4 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center space-y-1 mb-2">
            <h1 className="text-xl font-extrabold text-ink tracking-tight">
              対話モードを選択
            </h1>
            <p className="text-xs text-ink/70">
              あなたに合わせた対話の深さと語彙を設定します
            </p>
          </div>

          {[
            {
              id: 'kids' as UserMode,
              title: 'こども探検モード',
              target: '小・中学生向け',
              desc: 'すきなことと相棒ロボットのやさしい対話',
              color: 'border-teal/30 hover:border-teal',
            },
            {
              id: 'student' as UserMode,
              title: 'スチューデントモード',
              target: '高校生・大学生向け',
              desc: '専攻と進路のモヤモヤを解体し、コアを再定義',
              color: 'border-teal hover:border-teal-dark ring-1 ring-teal/20',
            },
            {
              id: 'adult' as UserMode,
              title: 'プロフェッショナルモード',
              target: '社会人・一般向け',
              desc: '実務の委譲と人間的尊厳のソクラテス型再結晶',
              color: 'border-rose/30 hover:border-rose',
            },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setPhase('phase1');
              }}
              className={`p-4 rounded-3xl bg-white border ${m.color} text-left transition-all shadow-xs hover:shadow-festive active:scale-[0.99]`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-ink">{m.title}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-ink/70">
                  {m.target}
                </span>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* PHASE 1: 思考の棚卸し */}
      {phase === 'phase1' && (
        <div className="space-y-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Interests */}
            <div className="p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-2.5">
              <h2 className="text-xs font-bold text-teal-dark flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                {mode === 'kids'
                  ? '時間を忘れて夢中になっちゃうことは？'
                  : '時間を忘れて没頭する瞬間・関心は？'}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {TAG_PRESETS[mode].interests.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(selectedInterests, setSelectedInterests, tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedInterests.includes(tag)
                        ? 'bg-teal text-white border-teal font-bold shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 border-black/[0.06] text-ink/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="他にあれば入力（任意）"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl bg-neutral-50 border border-black/[0.06] focus:border-teal outline-none"
              />
            </div>

            {/* Dislikes */}
            <div className="p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-2.5">
              <h2 className="text-xs font-bold text-rose flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                {mode === 'kids'
                  ? 'できればやりたくない、めんどくさいことは？'
                  : '魂が冷める・消耗すると感じる作業は？'}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {TAG_PRESETS[mode].dislikes.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(selectedDislikes, setSelectedDislikes, tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedDislikes.includes(tag)
                        ? 'bg-rose text-white border-rose font-bold shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 border-black/[0.06] text-ink/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="他にあれば入力（任意）"
                value={customDislike}
                onChange={(e) => setCustomDislike(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl bg-neutral-50 border border-black/[0.06] focus:border-rose outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleStartSocratic}
            disabled={isLoading || (selectedInterests.length === 0 && !customInterest)}
            className="w-full py-3.5 bg-teal hover:bg-teal-dark disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>{isLoading ? '思考を分析中...' : 'ソクラテス対話へ進む'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 2: ソクラテス対話 */}
      {phase === 'phase2' && socratic && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Question card */}
            <div className="p-5 rounded-3xl bg-white border-l-4 border-l-teal border border-black/[0.06] shadow-sm space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-teal-dark font-bold uppercase">
                SOCRATIC INQUIRY
              </span>
              <p className="text-sm font-bold text-ink leading-relaxed">
                {socratic.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <p className="text-[11px] text-ink/60 px-1 font-medium">
                選択肢をタップして回答してください：
              </p>
              {socratic.presetOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSocraticAnswer(opt);
                    setCustomSocraticAnswer('');
                  }}
                  className={`w-full text-xs p-3.5 rounded-2xl border text-left leading-relaxed transition-all ${
                    socraticAnswer === opt
                      ? 'bg-teal text-white border-teal font-bold shadow-xs'
                      : 'bg-white border-black/[0.06] text-ink hover:bg-neutral-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="自分の言葉で補足・追記する（任意）"
              value={customSocraticAnswer}
              onChange={(e) => setCustomSocraticAnswer(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl bg-white border border-black/[0.08] focus:border-teal outline-none"
            />
          </div>

          <button
            onClick={handleStartTasks}
            disabled={isLoading || (!socraticAnswer && !customSocraticAnswer)}
            className="w-full py-3.5 bg-teal hover:bg-teal-dark disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>{isLoading ? 'タスクを分解中...' : 'タスク仕分けへ進む'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 3: タスク仕分け */}
      {phase === 'phase3' && tasks.length > 0 && (
        <div className="space-y-4 flex-1 flex flex-col justify-between text-center">
          <div className="flex justify-between items-center text-xs font-mono text-ink/60 px-1">
            <span>TASK DECONSTRUCTION</span>
            <span className="font-bold text-teal-dark">
              {currentTaskIndex + 1} / {tasks.length}
            </span>
          </div>

          {/* Interactive Card */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-festive min-h-[190px] flex flex-col justify-center items-center relative overflow-hidden transition-all">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-ink/50 uppercase mb-2">
              CATEGORY: {tasks[currentTaskIndex].category.toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-ink mb-2">
              {tasks[currentTaskIndex].taskName}
            </h3>
            <p className="text-xs text-ink/75 leading-relaxed max-w-xs">
              {tasks[currentTaskIndex].detail}
            </p>
          </div>

          {/* Classification Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleSwipe('delegate')}
              className="p-4 rounded-2xl bg-teal-light/60 border border-teal/40 hover:bg-teal-light text-teal-dark font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-xs"
            >
              <div className="text-sm">AIに委譲する</div>
              <div className="text-[10px] font-mono text-teal-dark/70">AI FOR YOU</div>
            </button>

            <button
              onClick={() => handleSwipe('keep')}
              className="p-4 rounded-2xl bg-rose-light/60 border border-rose/40 hover:bg-rose-light text-rose-dark font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-xs"
            >
              <div className="text-sm">自分で抱きしめる</div>
              <div className="text-[10px] font-mono text-rose-dark/70">HUMAN CORE</div>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: 2030 FUTURE IDENTITY (BLUEPRINT) */}
      {phase === 'phase4' && blueprint && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-festive space-y-4">
            {/* Title Header */}
            <div className="text-center pb-3 border-b border-black/[0.06]">
              <span className="text-[10px] font-mono tracking-widest text-teal font-bold uppercase">
                2030 FUTURE IDENTITY
              </span>
              <h2 className="text-xl font-extrabold text-ink mt-1">
                {blueprint.futureTitle}
              </h2>
              <p className="text-xs text-ink/50 font-mono mt-0.5">
                {blueprint.futureTitleEn}
              </p>
              <p className="text-xs text-teal-dark mt-2 font-bold leading-snug">
                {blueprint.catchphrase}
              </p>
            </div>

            {/* Synergy Ratio */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-black/[0.04]">
              <div className="flex justify-between text-[11px] font-mono font-bold">
                <span className="text-rose">Human Core {blueprint.synergyRatio.humanPercent}%</span>
                <span className="text-teal-dark">AI Assist {blueprint.synergyRatio.aiPercent}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${blueprint.synergyRatio.humanPercent}%` }}
                  className="bg-rose h-full transition-all duration-700"
                />
                <div
                  style={{ width: `${blueprint.synergyRatio.aiPercent}%` }}
                  className="bg-teal h-full transition-all duration-700"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="text-xs text-ink/80 leading-relaxed bg-paper-light p-3.5 rounded-2xl border border-teal/15">
              {blueprint.executiveSummary}
            </div>

            {/* Co-Creation Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 rounded-2xl bg-teal-light/40 border border-teal/20">
                <div className="font-bold text-teal-dark mb-1 pb-1 border-b border-teal/20">
                  AIの役割
                </div>
                <ul className="space-y-1 text-ink/75 list-disc list-inside">
                  {blueprint.coCreationMatrix.aiRole.map((r, i) => (
                    <li key={i} className="truncate">{r}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-rose-light/40 border border-rose/20">
                <div className="font-bold text-rose-dark mb-1 pb-1 border-b border-rose/20">
                  人間の核
                </div>
                <ul className="space-y-1 text-ink/75 list-disc list-inside">
                  {blueprint.coCreationMatrix.humanCore.map((h, i) => (
                    <li key={i} className="truncate">{h}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Day in Life 2030 */}
            {blueprint.dayInLife2030 && blueprint.dayInLife2030.length > 0 && (
              <div className="p-3 rounded-2xl bg-neutral-50 border border-black/[0.04] space-y-1.5">
                <div className="text-[10px] font-bold text-ink/60 uppercase font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal" /> 2030年のある1日
                </div>
                <div className="space-y-1 text-xs text-ink/80">
                  {blueprint.dayInLife2030.map((d, i) => (
                    <div key={i} className="flex gap-2 text-[11px]">
                      <span className="font-mono text-teal-dark font-bold shrink-0">{d.time}</span>
                      <span className="text-ink/80">{d.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blue Rose Statement */}
            <div className="border-t border-black/[0.06] pt-3 text-center">
              <span className="text-[10px] text-teal-dark tracking-wider font-mono font-bold uppercase">
                BLUE ROSE STATEMENT
              </span>
              <p className="text-xs text-ink font-bold mt-1 italic leading-relaxed">
                "{blueprint.blueRoseStatement}"
              </p>
            </div>
          </div>

          {/* Deep-dive Prompt Launcher for LLMs */}
          <PromptLauncher
            title="さらに深掘りする（AIキャリアコーチング）"
            subtitle="このプロンプトを外部AIに送ると、5年間のスキル習得ツリーと模擬面接が始まります。"
            targetType="career"
            prompt={`あなたは世界最高峰のキャリアアーキテクト（2030年型キャリア戦略の第一人者）です。
以下の私の診断データに基づいて、深層キャリアコーチングを実施してください。

【私のプロフィール & 診断結果】
- 属性: ${mode}
- 2030年の共創肩書: ${blueprint.futureTitle} (${blueprint.futureTitleEn})
- キャッチコピー: ${blueprint.catchphrase}
- 人間コア vs AI協調比率: 人間 ${blueprint.synergyRatio.humanPercent}% / AI ${blueprint.synergyRatio.aiPercent}%
- AIに委ねる役割: ${blueprint.coCreationMatrix.aiRole.join(', ')}
- 人間として担う核: ${blueprint.coCreationMatrix.humanCore.join(', ')}
- 私のマニフェスト: "${blueprint.blueRoseStatement}"

【あなたへの依頼事項】
以下の3つのセクションに分けて、極めて具体的かつ刺激的なキャリア戦略を出力してください。
1. 【5年間のスキルツリー習得計画】
   この肩書を2030年に現実化するために、今年から1年ごとに身につけるべき技術・知見・人間的経験のロードマップ。
2. 【2030年の仮想クライアント案件シミュレーション】
   2030年にあなた（私）に舞い込む、最も象徴的なプロジェクトの架空依頼書と、AIと協調しながらそれをどう解決するかの実況描写。
3. 【模擬インタビュー（ロールプレイ質問）】
   私がこの未来の肩書を背負う覚悟を問う、鋭く本質的な質問を1つ投げかけてください（私が回答したら対話を続けてください）。`}
            anatomy={{
              role: '2030年のエグゼクティブ・キャリアアーキテクト（専門家ペルソナ）',
              objective: '診断結果を基軸とした5年間スキルツリー・具体的案件・対話型面接の生成',
              constraints: '抽象論を排除し、現実の産業・学術動向に即したリアリスティックな計画',
              outputFormat: '3部構成（スキルツリー、架空案件シナリオ、対話型質問）',
            }}
            userPreferences={{
              mode,
              futureTitle: blueprint.futureTitle,
              synergyRatio: blueprint.synergyRatio,
            }}
          />

          {/* Navigation buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setPhase('mode');
                setSelectedInterests([]);
                setSelectedDislikes([]);
              }}
              className="flex-1 py-3 rounded-2xl bg-white border border-black/[0.08] text-ink text-xs font-bold hover:bg-neutral-50 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal" />
              <span>もう一度診断</span>
            </button>

            <button
              onClick={() => router.push('/passport')}
              className="flex-1 py-3 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1 shadow-sm"
            >
              <span>箱庭パスポートへ進む</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
