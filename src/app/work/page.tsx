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
  CheckCircle2,
} from 'lucide-react';
import { PromptLauncher } from '@/components/common/PromptLauncher';
import { GeminiStudentBanner } from '@/components/common/GeminiStudentBanner';

export default function CareerMirrorPage() {
  const router = useRouter();
  const { setWork } = usePavilionSession();

  const [phase, setPhase] = useState<'mode' | 'phase1' | 'phase2' | 'phase3' | 'phase4'>('mode');
  const [mode, setMode] = useState<UserMode>('student');

  // Phase 1: Interests & Dislikes
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [customDislike, setCustomDislike] = useState('');

  // Phase 2: Inquiry Question
  const [socratic, setSocratic] = useState<SocraticQuestion | null>(null);
  const [socraticAnswer, setSocraticAnswer] = useState<string>('');
  const [customSocraticAnswer, setCustomSocraticAnswer] = useState('');

  // Phase 3: Task Sorting
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [keptTasks, setKeptTasks] = useState<TaskCard[]>([]);
  const [delegatedTasks, setDelegatedTasks] = useState<TaskCard[]>([]);

  // Phase 4: Final Result
  const [blueprint, setBlueprint] = useState<BlueprintResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Friendly preset tags
  const TAG_PRESETS = {
    kids: {
      interests: [
        'ゲーム・プログラミング',
        '絵を描く・工作',
        '生き物・自然を観察する',
        'スポーツ・身体を動かす',
        '本を読む・物語をつくる',
        '友達とおしゃべりする',
      ],
      dislikes: [
        '漢字の書き取り',
        '計算ドリル',
        '部屋の片付け',
        '重い荷物を持つこと',
        '人前での発表',
      ],
    },
    student: {
      interests: [
        'アイデアを形にすること',
        'データや数字の分析・プログラミング',
        '仲間とのディスカッション',
        'デザイン・文章の創作',
        '現場へ行って調べること',
      ],
      dislikes: [
        '誤字脱字の確認や書式の修正',
        '日々の定型的な連絡・日程調整',
        '形式的な挨拶やルール',
        '単純なデータ入力作業',
      ],
    },
    adult: {
      interests: [
        '新しい企画やアイデアの立ち上げ',
        'チームのメンバーとの対話・育成',
        'データや情報からの課題発見',
        '人と人をつなぐコミュニケーション',
      ],
      dislikes: [
        '定型の報告書や進捗管理',
        '形式的な会議の資料づくり',
        '細かな確認作業や日程調整',
        '社内の形式的なルール',
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

  // Phase 1 -> Phase 2 (Question Generation)
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
          'あなたが一番大切にしたいのは「早く答えを出すこと」ですか？それとも「自分でじっくり考える時間」ですか？',
        presetOptions: [
          '結果が大事。AIがうまくやってくれるなら任せたい',
          '自分でじっくり考える時間そのものが楽しいので、手放したくない',
          'AIのアイデアも参考にしながら、最後の判断は自分で決めたい',
        ],
      });
      setPhase('phase2');
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 2 -> Phase 3 (Task Cards Generation)
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
      setKeptTasks([]);
      setDelegatedTasks([]);
      setPhase('phase3');
    } catch {
      // fallback
      setTasks([
        { id: 1, taskName: '必要な資料を集める', detail: 'ネットや本から要点をまとめる', category: 'operation' },
        { id: 2, taskName: '新しい問題を見つける', detail: 'まだ誰も気づいていない疑問を言葉にする', category: 'creativity' },
        { id: 3, taskName: 'アイデアに無理がないか確認', detail: '考えたプランの穴や矛盾をチェックする', category: 'logic' },
        { id: 4, taskName: '仲間とじっくり話し合う', detail: '相手の気持ちを聞いて相談する', category: 'human' },
        { id: 5, taskName: '報告書やスライドを整える', detail: '決まった形式に沿って資料をまとめる', category: 'operation' },
        { id: 6, taskName: '直感で好きな案を選ぶ', detail: '自分のセンスや好みを信じて決める', category: 'creativity' },
        { id: 7, taskName: '外国語の文章を翻訳する', detail: '英語などの文章をすばやく日本語にする', category: 'operation' },
        { id: 8, taskName: '意見が分かれた時にまとめる', detail: 'みんなが納得できるように間に入る', category: 'human' },
        { id: 9, taskName: 'データを整理してグラフ化', detail: '数字を集計して見やすくまとめる', category: 'logic' },
        { id: 10, taskName: '最後に責任を持って決める', detail: 'リスクを引き受けて決断する', category: 'human' },
      ]);
      setCurrentTaskIndex(0);
      setPhase('phase3');
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 3 Swipe/Tap Action
  const handleSwipe = (action: 'keep' | 'delegate') => {
    const currentCard = tasks[currentTaskIndex];
    if (!currentCard) return;

    if (action === 'keep') {
      setKeptTasks((prev) => [...prev, currentCard]);
    } else {
      setDelegatedTasks((prev) => [...prev, currentCard]);
    }

    if (currentTaskIndex + 1 < tasks.length) {
      setCurrentTaskIndex((prev) => prev + 1);
    } else {
      // All sorted -> Trigger Blueprint
      finalizeBlueprint(
        action === 'keep' ? [...keptTasks, currentCard] : keptTasks,
        action === 'delegate' ? [...delegatedTasks, currentCard] : delegatedTasks
      );
    }
  };

  // Phase 3 -> Phase 4 (Blueprint Generation)
  const finalizeBlueprint = async (kept: TaskCard[], delegated: TaskCard[]) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          humanCount: kept.length,
          aiCount: delegated.length,
          keptTasks: kept.map((t) => t.taskName),
          delegatedTasks: delegated.map((t) => t.taskName),
        }),
      });
      const data: BlueprintResult = await res.json();
      setBlueprint(data);

      // Save to SessionContext
      const sessionResult: WorkResult = {
        mode: mode === 'adult' ? 'pro' : mode,
        userInterest: selectedInterests.join(', ') || customInterest,
        futureTitle: data.futureTitle,
        workStyle: data.synergyRatio.humanPercent > 50 ? 'intuitive' : 'logical',
        synergyRatio: data.synergyRatio.aiPercent,
        delegatedCards: delegated.map((d) => ({
          id: String(d.id),
          label: d.taskName,
          description: d.detail,
          category: 'execution',
        })),
        keptCards: kept.map((k) => ({
          id: String(k.id),
          label: k.taskName,
          description: k.detail,
          category: 'thinking',
        })),
        feedbackSummary: data.executiveSummary,
      };
      setWork(sessionResult);

      if (typeof window !== 'undefined' && data.hakoniwaParams) {
        localStorage.setItem(
          'career_hakoniwa_params',
          JSON.stringify(data.hakoniwaParams)
        );
      }

      setPhase('phase4');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // fallback
      const fallbackBp: BlueprintResult = {
        futureTitle: 'アイデアをつなぐ企画パートナー',
        futureTitleEn: 'Creative Project Partner',
        catchphrase: '調べものや作業はAIにまかせ、人と人をつなぐ対話に力を注ぐ人',
        synergyRatio: { humanPercent: 30, aiPercent: 70 },
        executiveSummary:
          '面倒な下調べや定型作業をAIにお願いすることで、本当に大切な相談や、新しいアイデアを生み出すことに集中できます。',
        coCreationMatrix: {
          aiRole: [
            '資料やデータのすばやい要約',
            '文章や外国語のドラフト作成',
            'スケジュールの整理や定型作業',
          ],
          humanCore: [
            'みんなが本当に困っていることを見つける',
            '相手の気持ちに寄り添って話を聞く',
            '最後の決定と責任を持つ',
          ],
        },
        dayInLife2030: [
          { time: '09:00', action: 'AIがまとめたニュースや情報メモをチェック' },
          { time: '13:00', action: 'チームの仲間とお茶を飲みながらアイデア会議' },
          { time: '17:00', action: '次のプロジェクトに向けた企画書をまとめる' },
        ],
        blueRoseStatement:
          'AIを頼れる相棒にして、自分にしかできない温かい挑戦を続けていく。',
        hakoniwaParams: {
          avatarCostume: 'tech_minimal_jacket',
          heldItem: 'hologram_blueprint',
          pedestalType: 'cyber_glass_grid',
          ambientLighting: 'cyan_blue',
          hologramTitleText: 'CREATIVE PARTNER',
        },
      };
      setBlueprint(fallbackBp);
      setPhase('phase4');
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
          <span>将来の仕事さがし（WORK）</span>
        </div>
        <span className="font-mono text-[10px] text-ink/50">
          {phase === 'mode' && 'コース選択'}
          {phase === 'phase1' && 'ステップ 1 : 興味と苦手なこと'}
          {phase === 'phase2' && 'ステップ 2 : 質問に答える'}
          {phase === 'phase3' && `ステップ 3 : 役割分担 (${currentTaskIndex + 1}/${tasks.length || 10})`}
          {phase === 'phase4' && 'ステップ 4 : あなたの未来の仕事'}
        </span>
      </div>

      {/* MODE SELECTION */}
      {phase === 'mode' && (
        <div className="space-y-4 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center space-y-1 mb-2">
            <h1 className="text-xl font-extrabold text-ink tracking-tight">
              あてはまる年代を選んでください
            </h1>
            <p className="text-xs text-ink/70">
              年代に合わせたわかりやすい言葉で質問を表示します
            </p>
          </div>

          {[
            {
              id: 'kids' as UserMode,
              title: '小学生・中学生',
              target: 'キッズ向け',
              desc: 'すきなことや得意なことから、未来の自分を想像してみよう',
              color: 'border-teal/30 hover:border-teal',
            },
            {
              id: 'student' as UserMode,
              title: '高校生・大学生',
              target: '学生向け',
              desc: '興味のある学問や将来の進路から、AI時代の働き方を考えます',
              color: 'border-teal hover:border-teal-dark ring-1 ring-teal/20',
            },
            {
              id: 'adult' as UserMode,
              title: '一般・社会人',
              target: '社会人向け',
              desc: '普段の仕事や役割を見直し、これからのキャリアを考えます',
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
                  : '時間を忘れて没頭すること・好きなことは？'}
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
                  : '苦手なこと・できれば避けたい作業は？'}
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
            <span>{isLoading ? '質問を作成中...' : '次の質問へ進む'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 2: 質問に答える */}
      {phase === 'phase2' && socratic && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Question card */}
            <div className="p-5 rounded-3xl bg-white border-l-4 border-l-teal border border-black/[0.06] shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-teal-dark uppercase">
                あなたへの質問
              </span>
              <p className="text-sm font-bold text-ink leading-relaxed">
                {socratic.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <p className="text-[11px] text-ink/60 px-1 font-medium">
                あてはまる選択肢をタップしてください：
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
              placeholder="自分の言葉で補足する（任意）"
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
            <span>{isLoading ? '準備中...' : '役割分担へ進む'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 3: タスク仕分け */}
      {phase === 'phase3' && tasks.length > 0 && (
        <div className="space-y-4 flex-1 flex flex-col justify-between text-center">
          <div className="flex justify-between items-center text-xs text-ink/60 px-1">
            <span>役割分担（AIに任せる？自分でやる？）</span>
            <span className="font-bold text-teal-dark">
              {currentTaskIndex + 1} / {tasks.length}
            </span>
          </div>

          {/* Interactive Card */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-festive min-h-[190px] flex flex-col justify-center items-center relative overflow-hidden transition-all">
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
              <div className="text-sm">AIにお願いする</div>
              <div className="text-[10px] text-teal-dark/70">まかせる</div>
            </button>

            <button
              onClick={() => handleSwipe('keep')}
              className="p-4 rounded-2xl bg-rose-light/60 border border-rose/40 hover:bg-rose-light text-rose-dark font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-xs"
            >
              <div className="text-sm">自分でやりたい</div>
              <div className="text-[10px] text-rose-dark/70">大切にしたい</div>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: 2030 FUTURE IDENTITY */}
      {phase === 'phase4' && blueprint && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-festive space-y-4">
            {/* Title Header */}
            <div className="text-center pb-3 border-b border-black/[0.06]">
              <span className="text-[10px] font-bold text-teal uppercase">
                2030年の未来のしごと
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
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-rose">自分でやりたい {blueprint.synergyRatio.humanPercent}%</span>
                <span className="text-teal-dark">AIにお願いしたい {blueprint.synergyRatio.aiPercent}%</span>
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
                  AIにお願いする部分
                </div>
                <ul className="space-y-1 text-ink/75 list-disc list-inside">
                  {blueprint.coCreationMatrix.aiRole.map((r, i) => (
                    <li key={i} className="truncate">{r}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-rose-light/40 border border-rose/20">
                <div className="font-bold text-rose-dark mb-1 pb-1 border-b border-rose/20">
                  自分で大切にする部分
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
                <div className="text-[10px] font-bold text-ink/60 uppercase flex items-center gap-1">
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
              <span className="text-[10px] text-teal-dark tracking-wider font-bold uppercase">
                あなたのモットー
              </span>
              <p className="text-xs text-ink font-bold mt-1 italic leading-relaxed">
                "{blueprint.blueRoseStatement}"
              </p>
            </div>
          </div>

          {/* Deep-dive Prompt Launcher for LLMs */}
          <PromptLauncher
            title="AIにもっと相談してみる（キャリアアドバイス）"
            subtitle="この文章をChatGPTやGeminiに送ると、これから身につけたいスキルやアドバイスを詳しく教えてくれます。"
            targetType="career"
            prompt={`あなたは親身な進路・キャリアアドバイザーです。
以下の私の診断結果をもとに、難しい専門用語は使わず、誰にでも分かりやすい平易な日本語でアドバイスしてください。

【私の診断結果】
- 属性: ${mode}
- 将来の仕事のイメージ: ${blueprint.futureTitle} (${blueprint.futureTitleEn})
- 特徴: ${blueprint.catchphrase}
- 役割分担: 自分でやりたいこと ${blueprint.synergyRatio.humanPercent}% / AIにお願いしたいこと ${blueprint.synergyRatio.aiPercent}%
- AIにお願いしたいこと: ${blueprint.coCreationMatrix.aiRole.join(', ')}
- 自分で大切にしたいこと: ${blueprint.coCreationMatrix.humanCore.join(', ')}
- 私のモットー: "${blueprint.blueRoseStatement}"

【相談したいこと】
以下の3点について、具体的で前向きなアドバイスを教えてください。
1. 【これから身につけておくと良いスキルや経験】
   この将来像に近づくために、学生時代やこれからの生活で挑戦してみると良いこと。
2. 【未来の仕事シミュレーション】
   2030年にAIと一緒にどんな風に楽しく仕事をしているか、具体的な一コマのストーリー。
3. 【アドバイザーからの質問（1問）】
   私の考えをさらに深めるために、優しい質問を1つ投げかけてください（私が回答したら対話を続けてください）。`}
            anatomy={{
              role: '親身な進路・キャリアアドバイザー',
              objective: '診断結果をもとにしたスキルや仕事シミュレーションの提案',
              constraints: 'わかりやすい平易な日本語、前向きで具体的なアドバイス',
              outputFormat: '3つのセクション（スキル、仕事ストーリー、質問）',
            }}
            userPreferences={{
              mode,
              futureTitle: blueprint.futureTitle,
              synergyRatio: blueprint.synergyRatio,
            }}
          />

          {/* Student specific campaign link */}
          {mode === 'student' && <GeminiStudentBanner compact={true} />}

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
              <span>もう一度診断する</span>
            </button>

            <button
              onClick={() => router.push('/passport')}
              className="flex-1 py-3 rounded-2xl bg-teal text-white text-xs font-bold hover:bg-teal-dark flex items-center justify-center gap-1 shadow-sm"
            >
              <span>体験パスポートを見る</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
