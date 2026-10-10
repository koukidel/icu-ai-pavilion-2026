import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

export async function POST(req: NextRequest) {
  try {
    const { mode, interests, answer } = await req.json();

    const systemPrompt = `
絵文字は出力禁止です。
難解な専門用語、気取った抽象表現、固い四字熟語は避け、小学生から大人まで誰でもイメージできる平易で具体的な日常の作業タスク10枚を生成してください。

JSONスキーマ:
{
  "taskCards": [
    {
      "id": 1,
      "taskName": "string (わかりやすいタスク名・15文字以内)",
      "detail": "string (具体的な作業内容・25文字以内)",
      "category": "logic" | "creativity" | "human" | "operation"
    }
  ]
}
`;

    const userText = `属性: ${mode}\n関心: ${(interests || []).join(', ')}\nユーザーの考え: ${answer}`;

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
    // 平易で分かりやすいフォールバック用カード群
    const fallbackCards = [
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
    ];
    return NextResponse.json({ taskCards: fallbackCards });
  }
}
