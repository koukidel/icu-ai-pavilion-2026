import { NextRequest, NextResponse } from 'next/server';
import { WorldTheme, SelfResult } from '@/types/pavilion';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concernText, selectedMood, avatarChoice } = body;

    const concern = concernText || 'これからの進路と自分らしさの表現';

    // Map to 1 of 4 themes
    let worldTheme: WorldTheme = 'Blue Rose Mystic';
    if (concern.includes('自然') || concern.includes('環境') || concern.includes('癒やし') || selectedMood === 'calm') {
      worldTheme = 'Nature Warmth';
    } else if (concern.includes('テクノロジー') || concern.includes('サイバー') || concern.includes('論理') || selectedMood === 'tech') {
      worldTheme = 'Neo Cyber';
    } else if (concern.includes('かわいい') || concern.includes('夢') || concern.includes('アート') || selectedMood === 'cute') {
      worldTheme = 'Dreamy Cute';
    } else {
      worldTheme = 'Blue Rose Mystic';
    }

    // Statements
    const statements: Record<WorldTheme, string> = {
      'Blue Rose Mystic': '不可能な青を、私自身の純粋な探究でこのキャンパスに咲かせる。',
      'Neo Cyber': '知性とアルゴリズムを味方に、まだ誰も見たことのない地平を切り拓く。',
      'Nature Warmth': '移り変わる時代の中で、人との温かなぬくもりと対話を一番の軸にする。',
      'Dreamy Cute': '小さなひらめきと遊び心を愛し、世界にやさしい驚きを届けていく。',
    };

    const result: SelfResult = {
      avatarId: `avatar-${Date.now()}`,
      avatarStyle: avatarChoice || 'pixar_girl',
      worldTheme,
      userMood: selectedMood || '探究心',
      concernText: concern,
      blueRoseStatement: statements[worldTheme],
    };

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
