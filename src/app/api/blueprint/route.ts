import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, aiCount, humanCount, keptTasks, delegatedTasks } = body;

    const total = (aiCount || 0) + (humanCount || 0) || 1;
    const humanPercent = Math.round(((humanCount || 0) / total) * 100);
    const aiPercent = 100 - humanPercent;

    const systemPrompt = `
絵文字は一切出力しないでください。
「知の越境」「概念翻訳」「思索のハブ」「生身の熱量」「車座」「マニフェスト」といった難解・哲学的・気取った表現は一切禁止です。
誰にでもスッと頭に入り、ワクワクするような、平易で自然な日常日本語を使ってください。

ユーザーの属性(${mode})、仕分け結果(AIにお願いする割合 ${aiPercent}%, 自分でやる割合 ${humanPercent}%)、自分で残したタスク、AIに任せたタスクから、
2030年の未来の仕事スタイルをJSONで生成してください。

JSONスキーマ:
{
  "futureTitle": "string (わかりやすく魅力的な仕事の肩書き・例: アイデアをつなぐ企画パートナー)",
  "futureTitleEn": "string (例: Creative Project Partner)",
  "catchphrase": "string (誰にでも伝わる親しみやすい一言説明)",
  "synergyRatio": { "humanPercent": ${humanPercent}, "aiPercent": ${aiPercent} },
  "executiveSummary": "string (平易で読みやすいまとめ・80字程度)",
  "coCreationMatrix": {
    "aiRole": ["string", "string", "string"],
    "humanCore": ["string", "string", "string"]
  },
  "dayInLife2030": [
    { "time": "09:00", "action": "string (平易な表現)" },
    { "time": "13:00", "action": "string (平易な表現)" },
    { "time": "17:00", "action": "string (平易な表現)" }
  ],
  "blueRoseStatement": "string (前向きなモットー・50字程度)",
  "hakoniwaParams": {
    "avatarCostume": "string (tech_minimal_jacket / academic_tweed / artisan_apron / casual_knit)",
    "heldItem": "string (hologram_blueprint / illuminated_book / glowing_lantern / magic_pen)",
    "pedestalType": "string (cyber_glass_grid / hybrid_stone_metal / mossy_brick_wood)",
    "ambientLighting": "string (cyan_blue / amber_sunset / violet_rose)",
    "hologramTitleText": "string (英大文字15字以内)"
  }
}
`;

    const userText = `自分でやるタスク: ${(keptTasks || []).join(', ')}\nAIに任せるタスク: ${(delegatedTasks || []).join(', ')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n${userText}` }],
        },
      ],
      config: { responseMimeType: 'application/json' },
    });

    const result = JSON.parse(response.text || '{}');
    if (!result.futureTitle || !result.coCreationMatrix) {
      throw new Error('Invalid blueprint format');
    }
    return NextResponse.json(result);
  } catch (error) {
    // 平易で温かみのあるフォールバック
    return NextResponse.json({
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
    });
  }
}
