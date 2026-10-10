import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

export async function POST(req: NextRequest) {
  try {
    const { mode, interests, dislikes } = await req.json();

    const systemPrompt = `
あなたは思考解体エンジンです。絵文字は絶対に出力しないでください。
ユーザーの属性(${mode})に応じ、没頭体験と手放したい作業を分析して、前提を揺さぶる逆質問1問と、回答用の選択肢3つをJSONで生成してください。

属性ごとのトーン:
- kids: ひらがな多め、わかりやすい言葉
- student: 知的でフラットな問いかけ
- adult: 実務の本質と職業的尊厳を突く鋭い問い

JSONスキーマ:
{
  "question": "string",
  "presetOptions": ["string", "string", "string"]
}
`;

    const userPrompt = `
没頭体験: ${(interests || []).join(', ')}
消耗作業: ${(dislikes || []).join(', ')}
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
    // 堅牢なフォールバック
    return NextResponse.json({
      question:
        'あなたが一番手放したくないのは、結果を得ることですか？それとも試行錯誤の過程そのものですか？',
      presetOptions: [
        '結果がすべて。AIが完璧に出すなら過程は手放せる',
        '試行錯誤する過程にこそ価値があるため手放さない',
        'AIの案を参考にしつつ、最終的な選択の審美眼は自分が持つ',
      ],
    });
  }
}
