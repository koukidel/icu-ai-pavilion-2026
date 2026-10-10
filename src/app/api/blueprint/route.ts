import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
ユーザーの属性(${mode})、仕分け結果(AI委譲率 ${aiPercent}%, Human率 ${humanPercent}%)、残したタスク、手放したタスクから、
2030年の共創型キャリアBlueprintと箱庭パラメータをJSONで生成してください。

JSONスキーマ:
{
  "futureTitle": "string (例: 概念翻訳アーキテクト)",
  "futureTitleEn": "string (例: Conceptual Translation Architect)",
  "catchphrase": "string (一言の要約)",
  "synergyRatio": { "humanPercent": ${humanPercent}, "aiPercent": ${aiPercent} },
  "executiveSummary": "string (80字程度)",
  "coCreationMatrix": {
    "aiRole": ["string", "string", "string"],
    "humanCore": ["string", "string", "string"]
  },
  "dayInLife2030": [
    { "time": "09:00", "action": "string" },
    { "time": "13:00", "action": "string" },
    { "time": "17:00", "action": "string" }
  ],
  "blueRoseStatement": "string (夢叶う宣言・50字程度)",
  "hakoniwaParams": {
    "avatarCostume": "string (tech_minimal_jacket / academic_tweed / artisan_apron / casual_knit)",
    "heldItem": "string (hologram_blueprint / illuminated_book / glowing_lantern / magic_pen)",
    "pedestalType": "string (cyber_glass_grid / hybrid_stone_metal / mossy_brick_wood)",
    "ambientLighting": "string (cyan_blue / amber_sunset / violet_rose)",
    "hologramTitleText": "string (英大文字15字以内)"
  }
}
`;

    const userText = `保持タスク: ${(keptTasks || []).join(', ')}\n委譲タスク: ${(delegatedTasks || []).join(', ')}`;

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
    // 堅牢なフォールバック
    return NextResponse.json({
      futureTitle: '概念翻訳アーキテクト',
      futureTitleEn: 'Conceptual Translation Architect',
      catchphrase: '論理の海をAIに潜らせ、生身の熱量で知の架け橋を架ける人',
      synergyRatio: { humanPercent: 30, aiPercent: 70 },
      executiveSummary:
        '作業の大部分をAIに委譲することで、異なる専門領域の間に横たわる哲学的な溝を埋める対話のハブへと進化します。',
      coCreationMatrix: {
        aiRole: [
          '大量の文献やデータの超高速要約',
          '多言語ドラフトと論理検証の自動化',
          '定型スケジュールと資料の整形',
        ],
        humanCore: [
          '解くべき課題の発見と違和感の提示',
          '美意識と倫理観に基づく最終判断',
          '現場の温度感に合わせた生身の対話',
        ],
      },
      dayInLife2030: [
        { time: '09:00', action: '自律AIがまとめた思想接点レポートを確認' },
        { time: '13:00', action: '仲間との車座による哲学対話' },
        { time: '17:00', action: '自らの言葉によるマニフェスト執筆' },
      ],
      blueRoseStatement:
        'かつて不可能だった知の越境を果たし、誰よりも人間的な温度を持った問いを世界に投げかける。',
      hakoniwaParams: {
        avatarCostume: 'tech_minimal_jacket',
        heldItem: 'hologram_blueprint',
        pedestalType: 'cyber_glass_grid',
        ambientLighting: 'cyan_blue',
        hologramTitleText: 'CONCEPT ARCHITECT',
      },
    });
  }
}
