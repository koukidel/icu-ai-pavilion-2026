import { NextRequest, NextResponse } from 'next/server';
import { EngineType, GameConfig } from '@/types/pavilion';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prompt, engineType, level, drawingDataUrl } = body;

    // Safety guardrail: Sanitize inappropriate words into comical/wholesome replacements
    const sanitizeText = (input: string): string => {
      let cleaned = input;
      const banned = [
        { regex: /殺す|死ね|暴力|血|爆破|凶器/g, rep: 'マシュマロアタック' },
        { regex: /クソ|ゴミ|バカ|アホ/g, rep: 'おちゃめ' },
        { regex: /エロ|卑猥/g, rep: 'ピュアハート' },
      ];
      for (const item of banned) {
        cleaned = cleaned.replace(item.regex, item.rep);
      }
      return cleaned;
    };

    if (action === 'generate_game') {
      const safePrompt = sanitizeText(prompt || '青いバラを集める冒険');

      let chosenEngine: EngineType = engineType || 'flying';
      if (!engineType) {
        if (safePrompt.includes('走') || safePrompt.includes('ジャンプ') || safePrompt.includes('ダッシュ')) {
          chosenEngine = 'endless_run';
        } else if (safePrompt.includes('キャッチ') || safePrompt.includes('落ち') || safePrompt.includes('拾う')) {
          chosenEngine = 'fall_catch';
        } else if (safePrompt.includes('的') || safePrompt.includes('叩く') || safePrompt.includes('早押し')) {
          chosenEngine = 'target_smash';
        } else if (safePrompt.includes('積') || safePrompt.includes('タワー') || safePrompt.includes('バランス')) {
          chosenEngine = 'balance_tower';
        } else {
          chosenEngine = 'flying';
        }
      }

      // Generate parameters and title
      const title = safePrompt.length > 14 ? safePrompt.slice(0, 14) : safePrompt;
      const shapes: Array<'rose' | 'cat' | 'robot' | 'star' | 'bird'> = ['rose', 'cat', 'robot', 'star', 'bird'];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

      const generatedConfig: GameConfig = {
        id: `game-${Date.now()}`,
        title: title || '青いバラのミニゲーム',
        engineType: chosenEngine,
        characterName: safePrompt.includes('猫') ? 'ミケ' : 'ブルーローズ・アバター',
        characterShape: randomShape,
        characterColor: '#dc4f89',
        themeName: 'Blue Rose Mystic',
        backgroundColor: '#0c1b24',
        speed: 5,
        gravity: chosenEngine === 'balance_tower' ? 0.45 : 0.3,
        spawnRate: 75,
        specialRuleName: 'ブルーローズ・スパーク',
        specialRuleDescription: 'アイテムを獲得すると一時的にスコアが2倍になるフェスティバル特別ルール！',
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, game: generatedConfig });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
