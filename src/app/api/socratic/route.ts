import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

export async function POST(req: NextRequest) {
  try {
    const { mode, interests, dislikes } = await req.json();

    const systemPrompt = `
あなたは優しく親身なインタビュアーです。
難しい言葉、哲学的で気取った表現、四字熟語、難解なカタカナ語は一切使わず、誰にでもスッと意味が伝わる平易で自然な日本語を使ってください。
絵文字は絶対に出力しないでください。

ユーザーの属性(${mode})と「好きなこと」「苦手なこと」をふまえて、
ユーザーの考えを優しく掘り下げる分かりやすい質問1問と、答えやすい選択肢3つをJSONで生成してください。

JSONスキーマ:
{
  "question": "string (平易で親しみやすい質問)",
  "presetOptions": ["string (選択肢1)", "string (選択肢2)", "string (選択肢3)"]
}
`;

    const userPrompt = `
好きなこと・得意なこと: ${(interests || []).join(', ')}
苦手なこと・避けたいこと: ${(dislikes || []).join(', ')}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n' + userPrompt }] },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    if (!result.question || !result.presetOptions) {
      throw new Error('Invalid format');
    }
    return NextResponse.json(result);
  } catch (error) {
    // 誰にでもわかる平易な日本語のフォールバック
    return NextResponse.json({
      question:
        'あなたが一番大切にしたいのは「早く答えを出すこと」ですか？それとも「自分でじっくり考える時間」ですか？',
      presetOptions: [
        '結果が大事。AIがうまくやってくれるなら任せたい',
        '自分でじっくり考える時間そのものが楽しいので、手放したくない',
        'AIのアイデアも参考にしながら、最後の判断は自分で決めたい',
      ],
    });
  }
}
