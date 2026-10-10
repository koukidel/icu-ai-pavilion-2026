'use client';

import React, { useRef, useEffect, useState } from 'react';
import { PassportData } from '@/types/pavilion';
import QRCode from 'qrcode';
import { Download, Sparkles, Share2, Check } from 'lucide-react';

interface Props {
  passport: PassportData;
}

export const HakoniwaDioramaCanvas: React.FC<Props> = ({ passport }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const work = passport.work;
  const make = passport.make;
  const self = passport.self;
  const care = passport.care;

  useEffect(() => {
    // Generate QR code for sharing
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://icu-fes.com';
    QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 140,
      color: { dark: '#27566c', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {});
  }, []);

  // Draw 9:16 high-resolution composite card
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions (9:16 aspect ratio: 540 x 960)
    const w = 540;
    const h = 960;
    canvas.width = w;
    canvas.height = h;

    // 1. Background Gradient (Blue Rose Pavilion Theme)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0c1b24');
    bgGrad.addColorStop(0.55, '#142d3c');
    bgGrad.addColorStop(1, '#1b3b4f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Decorative Stars / Sparkles in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % w;
      const sy = (i * 61) % (h * 0.55);
      const sr = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. DIORAMA UPPER SECTION (0 to 520px)
    // Atmosphere glow
    const glowGrad = ctx.createRadialGradient(w / 2, 260, 40, w / 2, 260, 240);
    glowGrad.addColorStop(0, 'rgba(22, 142, 172, 0.45)');
    glowGrad.addColorStop(0.6, 'rgba(220, 79, 137, 0.2)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, 520);

    // Arch / Pavilion Dome Outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, 260, 210, Math.PI, 0);
    ctx.stroke();

    // ICU FES 2026 Blue Rose Neon Monument in Background
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f6dd59';
    ctx.fillText('✦ ICU FESTIVAL 2026 ✦', w / 2, 70);

    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('BLUE ROSE HAKONIWA', w / 2, 100);

    // Pedestal based on WORK synergy ratio (AI vs Human)
    const synergy = work?.synergyRatio ?? 50;
    const isCyberPedestal = synergy >= 50;

    // Draw Pedestal
    ctx.save();
    ctx.translate(w / 2, 380);
    if (isCyberPedestal) {
      // Cyber Glass Pedestal
      ctx.fillStyle = 'rgba(22, 142, 172, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 160, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Lush Nature / Dappled Sunlight Green Pedestal
      ctx.fillStyle = 'rgba(152, 201, 126, 0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 160, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();

    // Central Protagonist Avatar from SELF & WORK Outfit
    ctx.save();
    ctx.translate(w / 2, 270);
    // Glow behind avatar
    const avatarGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 80);
    avatarGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    avatarGlow.addColorStop(1, 'rgba(220, 79, 137, 0)');
    ctx.fillStyle = avatarGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();

    // Avatar Icon representation
    const avatarStyle = self?.avatarStyle || 'pixar_girl';
    let avatarEmoji = '🎨';
    if (avatarStyle === 'pixar_boy') avatarEmoji = '🔭';
    if (avatarStyle === 'cyber_explorer') avatarEmoji = '⚡';
    if (avatarStyle === 'nature_scholar') avatarEmoji = '🌿';
    if (avatarStyle === 'mystic_artisan') avatarEmoji = '🌹';

    ctx.font = '76px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avatarEmoji, 0, -10);

    // Outfit aura based on WorkStyle
    const workStyle = work?.workStyle || 'balanced';
    ctx.font = 'bold 12px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(
      workStyle === 'logical'
        ? '【しっかり分析タイプ】'
        : workStyle === 'intuitive'
        ? '【ひらめき・直感タイプ】'
        : '【バランス・調和タイプ】',
      0,
      54
    );
    ctx.restore();

    // Blue Rose Emblem at pedestal
    ctx.save();
    ctx.translate(w / 2 - 100, 360);
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌹', 0, 0);
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.fillStyle = '#f6dd59';
    ctx.fillText('BLUE ROSE', 0, 26);
    ctx.restore();

    // Floating Game Character from MAKE (Right of protagonist)
    ctx.save();
    ctx.translate(w / 2 + 105, 230);
    const makeColor = make?.characterColor || '#dc4f89';
    // Floating orb
    ctx.fillStyle = makeColor;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Character face/rose
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      make?.characterShape === 'cat'
        ? '🐱'
        : make?.characterShape === 'robot'
        ? '🤖'
        : make?.characterShape === 'bird'
        ? '🕊️'
        : make?.characterShape === 'star'
        ? '⭐'
        : '🌹',
      0,
      0
    );
    // Label
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.fillStyle = '#f6dd59';
    ctx.fillText(`${make?.characterName || 'スカイローズ'}`, 0, 36);
    ctx.restore();

    // 3. LOWER PASSPORT TEXT METADATA AREA (480px to 960px)
    // Card container
    ctx.fillStyle = '#fff9fb';
    ctx.beginPath();
    ctx.roundRect(24, 480, w - 48, 440, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(22, 142, 172, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header inside card
    ctx.fillStyle = '#168eac';
    ctx.font = 'bold 13px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ICU AI PAVILION 2026 PASSPORT', 44, 515);

    ctx.fillStyle = '#dc4f89';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ICU AI PAVILION', w - 44, 515);

    // Separator line
    ctx.strokeStyle = 'rgba(22, 142, 172, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(44, 528);
    ctx.lineTo(w - 44, 528);
    ctx.stroke();

    // Field 1: 【WORK】将来のしごと
    ctx.fillStyle = '#27566c';
    ctx.font = 'bold 11px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('【WORK】未来のしごと', 44, 560);

    ctx.fillStyle = '#08718d';
    ctx.font = 'bold 18px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.fillText(work?.futureTitle || 'アイデアをつなぐ企画パートナー', 44, 588);

    // Field 2: 【MAKE】つくったゲーム
    ctx.fillStyle = '#27566c';
    ctx.font = 'bold 11px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.fillText('【MAKE】つくったゲーム', 44, 638);

    ctx.fillStyle = '#dc4f89';
    ctx.font = 'bold 16px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.fillText(`『${make?.title || '青いバラの空中散歩'}』`, 44, 664);

    // Field 3: 【SELF】わたしのモットー
    ctx.fillStyle = '#27566c';
    ctx.font = 'bold 11px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.fillText('【SELF】わたしのモットー', 44, 718);

    ctx.fillStyle = '#27566c';
    ctx.font = 'italic bold 12px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    const stmt =
      self?.blueRoseStatement ||
      'AIを頼れる相棒にして、自分らしく前へ進んでいく。';
    if (stmt.length > 22) {
      ctx.fillText(`「${stmt.slice(0, 22)}`, 44, 742);
      ctx.fillText(`${stmt.slice(22)}」`, 54, 760);
    } else {
      ctx.fillText(`「${stmt}」`, 44, 742);
    }

    // Field 4: 【CARE】いっしょに過ごしたロボット
    ctx.fillStyle = '#27566c';
    ctx.font = 'bold 11px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.fillText('【CARE】いっしょに過ごしたロボット', 44, 796);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 13px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';
    ctx.fillText(
      care
        ? `LOVOT（らぼっと）『${care.lovot.name}』`
        : 'LOVOT写真コーナー（未体験）',
      44,
      820
    );

    // Hashtags & Footer inside card
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillStyle = '#517e94';
    ctx.fillText(
      '#ICUAIパビリオン  #AIに出会い直す  #ICUFES2026',
      44,
      895
    );

    // Timestamp & ID
    ctx.textAlign = 'right';
    ctx.fillText(
      new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      w - 44,
      895
    );
  }, [passport, qrDataUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `ICU_AI_Passport_2026_${Date.now()}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* 9:16 Canvas rendering */}
      <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl border-2 border-teal/40">
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ aspectRatio: '9 / 16' }}
        />
      </div>

      {/* Action Buttons */}
      <div className="max-w-sm mx-auto grid grid-cols-2 gap-2.5">
        <button
          onClick={handleDownload}
          className="py-3 px-4 rounded-xl bg-teal text-white font-bold text-xs hover:bg-teal-dark transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>画像を保存 (PNG)</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="py-3 px-4 rounded-xl bg-rose text-white font-bold text-xs hover:bg-rose-dark transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'URLをコピー完了！' : 'SNSでシェア'}</span>
        </button>
      </div>
    </div>
  );
};
