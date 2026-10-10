import { NextRequest, NextResponse } from 'next/server';
import { WorkMode, TaskCard, WorkResult } from '@/types/pavilion';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, mode, userInterest, dialogueHistory, delegatedCount, keptCount } = body;

    // Action 1: Generate next question
    if (action === 'generate_question') {
      const turnIndex = dialogueHistory?.length || 0;
      let question = '';

      if (mode === 'kids') {
        if (turnIndex === 0) {
          question = `「${userInterest}」が好きなんだね！もしAIロボットが一緒に遊んでくれるとしたら、どんなお手伝いをしてほしい？`;
        } else {
          question = `なるほど！じゃあ、ロボットには絶対に任せたくない「自分だけでやりたい一番楽しいこと」は何かな？`;
        }
      } else if (mode === 'student') {
        if (turnIndex === 0) {
          question = `「${userInterest}」に関心があるのですね。その分野で探究しているとき、最も時間が溶けるように熱中する瞬間と、逆に退屈に感じる作業は何ですか？`;
        } else {
          question = `熱中する核が見えてきました。もしその退屈な作業をAIが1秒で片付けてくれたら、あなたの余った思考エネルギーは何に向かいますか？`;
        }
      } else {
        // pro mode
        if (turnIndex === 0) {
          question = `「${userInterest}」の実務において、あなたが「自分にしかできない」と確信している判断基準や暗黙知は、具体的にどのプロセスのどこに宿っていますか？`;
        } else {
          question = `興味深い洞察です。その暗黙知すらAIが80点レベルで模倣できたとき、あなたが最後まで手放さず「人間として責任を負い続ける領域」はどこでしょうか？`;
        }
      }

      return NextResponse.json({ question });
    }

    // Action 2: Generate 10 Task Cards for swiping
    if (action === 'generate_cards') {
      const cards: TaskCard[] = [
        {
          id: 'card-1',
          label: '情報収集と要約整理',
          description: '膨大な資料やニュースから要点を素早くピックアップする',
          category: 'execution',
        },
        {
          id: 'card-2',
          label: '直感と直感のひらめき',
          description: '論理の飛躍から新しいコンセプトや問いを生み出す',
          category: 'creation',
        },
        {
          id: 'card-3',
          label: '定型的な下書き・コード生成',
          description: '初期プロトタイプやテンプレートの作成',
          category: 'execution',
        },
        {
          id: 'card-4',
          label: '相手の感情の機微を読み取る対話',
          description: '言葉の裏にある迷いや表情のニュアンスに共感する',
          category: 'empathy',
        },
        {
          id: 'card-5',
          label: 'スケジューリングと進捗管理',
          description: '締め切りやリマインドの自動調整',
          category: 'routine',
        },
        {
          id: 'card-6',
          label: '最後の意思決定と責任テイク',
          description: 'どちらの道を選ぶか、覚悟を持って決断する',
          category: 'thinking',
        },
        {
          id: 'card-7',
          label: 'エラーチェックと校正',
          description: '細かな誤字脱字や構文エラーの洗い出し',
          category: 'routine',
        },
        {
          id: 'card-8',
          label: '美意識とクラフトマンシップの追求',
          description: '細部の手触りや「これしかない」という美しさを決める',
          category: 'creation',
        },
        {
          id: 'card-9',
          label: '多言語・専門用語の翻訳変換',
          description: '異なる文脈の人々に伝わる言葉に言い換える',
          category: 'execution',
        },
        {
          id: 'card-10',
          label: '人と人をつなぐ熱量の共有',
          description: '情熱を伝え、コミュニティを鼓舞する',
          category: 'empathy',
        },
      ];

      return NextResponse.json({ cards });
    }

    // Action 3: Calculate Final Diagnosis (2030 Title & Style)
    if (action === 'finalize_diagnosis') {
      const dCount = delegatedCount || 5;
      const kCount = keptCount || 5;
      const synergy = Math.round((dCount / (dCount + kCount || 1)) * 100);

      let futureTitle = '概念翻訳アーキテクト';
      let workStyle: 'logical' | 'intuitive' | 'balanced' = 'balanced';
      let summary = '';

      if (synergy > 65) {
        futureTitle = mode === 'kids' ? '未来テクノロジーマスター' : 'AI共創オーケストレーター';
        workStyle = 'logical';
        summary = 'AIに大胆に作業を委譲し、自身は全体設計と未来のビジョン策定に全力を注ぐ先進的な共創スタイルです。';
      } else if (synergy < 35) {
        futureTitle = mode === 'kids' ? 'ハートフルクリエイター' : '本質共感ディレクター';
        workStyle = 'intuitive';
        summary = 'AIの便利さに頼りすぎず、手触り感や人との温度ある対話を何よりも大切にする温かな職人肌スタイルです。';
      } else {
        futureTitle = mode === 'kids' ? 'アイデア探検フロンティア' : '概念翻訳アーキテクト';
        workStyle = 'balanced';
        summary = 'AIの知性と人間の感性を絶妙なバランスで組み合わせ、両者の架け橋となって新しい価値を生み出す調和スタイルです。';
      }

      return NextResponse.json({
        futureTitle,
        workStyle,
        synergyRatio: synergy,
        feedbackSummary: summary,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
