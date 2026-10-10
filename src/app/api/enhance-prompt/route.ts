import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
    const { rawPrompt, targetType, userPreferences } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json({
        enhancedPrompt: `${rawPrompt}\n\n[ルール]\n- 具体的で分かりやすい例を入れてください\n- 誰でも理解できる平易な言葉で出力してください`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
あなたは親切で分かりやすいプロンプト（AIへの指示文）の作成アドバイザーです。
ユーザーの基本プロンプトを、ChatGPTやGeminiなどのAIが最も意図通りに動くように、具体的で分かりやすい指示文にブラッシュアップしてください。

【ルール】
1. 難解な専門用語、哲学的な言い回し、気取った言葉遣いは一切禁止です。
2. 絵文字は一切含めないでください。
3. そのままAIのチャット欄に貼り付けて送信できる、完成した指示文のみを出力してください。挨拶や前置きは不要です。
`;

    const userMessage = `
【元プロンプト】:
${rawPrompt}

【補足設定】:
${JSON.stringify(userPreferences || {})}

上記を元に、具体的でわかりやすい指示文を1つ出力してください。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const enhancedPrompt = response.text?.trim() || rawPrompt;
    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    return NextResponse.json({
      enhancedPrompt: body?.rawPrompt || '',
    });
  }
}
