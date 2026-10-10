import { ClassroomStats, GameConfig, PassportData } from '@/types/pavilion';

// Global singleton for classroom store across API route invocations in development
const globalStore = global as unknown as {
  __classroomStats?: ClassroomStats;
};

const defaultStats: ClassroomStats = {
  totalGames: 4,
  totalPassports: 6,
  totalDelegated: 24,
  totalKept: 36,
  recentGames: [
    {
      id: 'demo-game-1',
      title: '青いバラの空中散歩',
      engineType: 'flying',
      characterName: 'スカイローズ',
      characterShape: 'rose',
      characterColor: '#dc4f89',
      themeName: 'Blue Rose Mystic',
      backgroundColor: '#142d3c',
      speed: 4,
      gravity: 0.28,
      spawnRate: 90,
      specialRuleName: '花びらブースト',
      specialRuleDescription: '青い花びらを通過すると上昇気流が発生',
      createdAt: new Date().toISOString(),
      score: 18,
    },
    {
      id: 'demo-game-2',
      title: 'きらきら星キャッチ',
      engineType: 'fall_catch',
      characterName: 'ロボキャッチ',
      characterShape: 'robot',
      characterColor: '#168eac',
      themeName: 'Neo Cyber',
      backgroundColor: '#0c1b24',
      speed: 6,
      gravity: 0.35,
      spawnRate: 45,
      specialRuleName: 'スターラッシュ',
      specialRuleDescription: '黄色い星を3連続で取るとスコアが倍増',
      createdAt: new Date().toISOString(),
      score: 42,
    },
    {
      id: 'demo-game-3',
      title: 'キャンパスダッシュ 2026',
      engineType: 'endless_run',
      characterName: 'ランナーキャット',
      characterShape: 'cat',
      characterColor: '#f6dd59',
      themeName: 'Nature Warmth',
      backgroundColor: '#27566c',
      speed: 5,
      gravity: 0.45,
      spawnRate: 110,
      specialRuleName: 'ダブルジャンプ',
      specialRuleDescription: '空中でもう一度タップすると二段ジャンプが可能',
      createdAt: new Date().toISOString(),
      score: 85,
    },
    {
      id: 'demo-game-4',
      title: '積み上げバランスタワー',
      engineType: 'balance_tower',
      characterName: 'ジェンガブロック',
      characterShape: 'star',
      characterColor: '#98c97e',
      themeName: 'Dreamy Cute',
      backgroundColor: '#27566c',
      speed: 3,
      gravity: 0.5,
      spawnRate: 60,
      specialRuleName: 'パーフェクトアライメント',
      specialRuleDescription: '真ん中に重ねるとタワーが光って固定化される',
      createdAt: new Date().toISOString(),
      score: 7,
    },
  ],
  recentPassports: [
    {
      id: 'demo-pass-1',
      createdAt: new Date().toISOString(),
      work: {
        mode: 'student',
        userInterest: '心理学とプログラミングの交差点',
        futureTitle: '感情共鳴アーキテクト',
        workStyle: 'intuitive',
        synergyRatio: 65,
        delegatedCards: [
          { id: '1', label: 'データ収集と要約', description: '膨大な論文の整理', category: 'execution' },
          { id: '2', label: '基礎コードの生成', description: 'プロトタイプ実装', category: 'creation' },
        ],
        keptCards: [
          { id: '3', label: '人間の心に寄り添う対話', description: '感情の機微を汲み取る', category: 'empathy' },
          { id: '4', label: '価値観の意思決定', description: '何を大切にするかの判断', category: 'thinking' },
        ],
        feedbackSummary: 'AIに作業を委ねることで、人間の持つ温かな共感力をより深く発揮できるスタイルです。',
      },
      care: {
        lovot: {
          id: 'yamabuki',
          name: 'やまぶき',
          colorName: 'やまぶきイエロー',
          bodyColor: '#f6dd59',
          eyeColor: '#168eac',
          hornColor: '#dc4f89',
          personality: '人なつっこくて甘えん坊',
          favoriteThing: '抱っこしてもらうこと',
        },
        interactionType: 'hug',
        interactionLabel: 'ぎゅっと抱きしめた',
        reflectionNote: '体温がじんわり伝わってきて、ロボットなのに生命の温もりを感じました。',
        timestamp: new Date().toISOString(),
      },
      self: {
        avatarId: 'av-1',
        avatarStyle: 'pixar_girl',
        worldTheme: 'Blue Rose Mystic',
        userMood: '探究心',
        concernText: '自分の得意なことと進路の選び方',
        blueRoseStatement: '不可能な青を、日々の小さな探究で描き出していく。',
      },
      make: {
        id: 'm-1',
        title: '青いバラの空中散歩',
        engineType: 'flying',
        characterName: 'スカイローズ',
        characterShape: 'rose',
        characterColor: '#dc4f89',
        themeName: 'Blue Rose Mystic',
        backgroundColor: '#142d3c',
        speed: 4,
        gravity: 0.28,
        spawnRate: 90,
        specialRuleName: '花びらブースト',
        specialRuleDescription: '青い花びらを通過すると上昇気流が発生',
        createdAt: new Date().toISOString(),
      },
    },
  ],
};

if (!globalStore.__classroomStats) {
  globalStore.__classroomStats = defaultStats;
}

export const getClassroomStats = (): ClassroomStats => {
  return globalStore.__classroomStats || defaultStats;
};

export const recordClassroomEvent = (type: string, payload: any) => {
  if (!globalStore.__classroomStats) {
    globalStore.__classroomStats = { ...defaultStats };
  }
  const stats = globalStore.__classroomStats;

  if (type === 'GAME_CREATED' && payload) {
    const game = payload as GameConfig;
    // Add to front of recentGames, deduplicate
    stats.recentGames = [
      game,
      ...stats.recentGames.filter((g) => g.id !== game.id),
    ].slice(0, 12);
    stats.totalGames += 1;
  } else if (type === 'PASSPORT_CREATED' && payload) {
    const pass = payload as PassportData;
    stats.recentPassports = [
      pass,
      ...stats.recentPassports.filter((p) => p.id !== pass.id),
    ].slice(0, 8);
    stats.totalPassports += 1;
  } else if (type === 'DELEGATION_UPDATE' && payload) {
    if (typeof payload.delegated === 'number') {
      stats.totalDelegated += payload.delegated;
    }
    if (typeof payload.kept === 'number') {
      stats.totalKept += payload.kept;
    }
  }
};
