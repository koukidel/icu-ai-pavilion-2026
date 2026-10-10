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
      // Fallback enhancement if API key not available
      return NextResponse.json({
        enhancedPrompt: `${rawPrompt}\n\n[PROMPT ENHANCEMENT CONSTRAINTS]\n- Ensure photorealistic / high-fidelity output\n- Maintain clear, actionable step-by-step logic\n- Provide concrete examples and explanations`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
あなたは世界最高峰のプロンプトエンジニア（Prompt Architect）です。
ユーザーが指定した基本プロンプトを、ChatGPT、Gemini、Claudeなどの最新LLMが最も高いパフォーマンスとクリエイティビティを発揮できるように強化・研ぎ澄ましてください。

【厳格な要件】
1. 目的（TargetType: ${targetType || 'general'}）に特化した専門的な役割（Role）、明確な制約（Constraints）、魅力的な出力形式（Format）を付与すること。
2. 絵文字は一切含めないこと。
3. 日本語または英語（画像プロンプトの場合は英語主体）で、そのままLLMにコピペして最高の結果が得られる完成したプロンプト全文のみを出力すること。余計な前置きや「承知しました」などの挨拶は絶対に含めないこと。
`;

    const userMessage = `
【元プロンプト】:
${rawPrompt}

【ユーザー嗜好・補足】:
${JSON.stringify(userPreferences || {})}

上記を元に、最高品質のプロンプトを1つ出力してください。
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
    // Graceful fallback
    return NextResponse.json({
      enhancedPrompt: body?.rawPrompt || '',
    });
  }
}
