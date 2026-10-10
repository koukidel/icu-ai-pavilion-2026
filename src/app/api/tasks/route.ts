import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

export async function POST(req: NextRequest) {
  try {
    const { mode, interests, answer } = await req.json();

    const systemPrompt = `
絵文字は出力禁止です。ユーザーの対話内容から、未来の具体的な作業タスク10枚を生成してください。
JSONスキーマ:
{
  "taskCards": [
    {
      "id": 1,
      "taskName": "string (15文字以内)",
      "detail": "string (30文字以内)",
      "category": "logic" | "creativity" | "human" | "operation"
    }
  ]
}
`;

    const userText = `属性: ${mode}\n関心: ${(interests || []).join(', ')}\n回答: ${answer}`;

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
    if (!result.taskCards || result.taskCards.length === 0) {
      throw new Error('Invalid taskCards');
    }
    return NextResponse.json(result);
  } catch (error) {
    // フォールバック用カード群
    const fallbackCards = [
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
    ];
    return NextResponse.json({ taskCards: fallbackCards });
  }
}
