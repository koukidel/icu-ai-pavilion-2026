'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClassroomStats, GameConfig, PassportData } from '@/types/pavilion';
import { CanvasGameViewer } from '@/components/make/CanvasGameViewer';
import QRCode from 'qrcode';
import {
  Tv2,
  Sparkles,
  Gamepad2,
  Trophy,
  Users,
  QrCode,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Heart,
  Cpu,
  Flame,
} from 'lucide-react';

export default function BlackboardProjectorPage() {
  const [stats, setStats] = useState<ClassroomStats | null>(null);
  const [activePlayGame, setActivePlayGame] = useState<GameConfig | null>(null);
  const [activePassportView, setActivePassportView] = useState<PassportData | null>(null);
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch classroom stats and listen to BroadcastChannel
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/classroom/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (!activePlayGame && data.recentGames?.length > 0) {
          setActivePlayGame(data.recentGames[0]);
        }
        if (!activePassportView && data.recentPassports?.length > 0) {
          setActivePassportView(data.recentPassports[0]);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3500);

    // Listen to local BroadcastChannel for instant local tab sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('icu_pavilion_classroom_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'GAME_CREATED') {
          setActivePlayGame(event.data.payload);
        } else if (event.data?.type === 'PASSPORT_CREATED') {
          setActivePassportView(event.data.payload);
        }
        fetchStats();
      };
    }

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  // Generate QR codes for each recent game
  useEffect(() => {
    if (!stats?.recentGames) return;
    const generateQrs = async () => {
      const newMap: Record<string, string> = {};
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      for (const g of stats.recentGames) {
        try {
          const url = `${baseUrl}/make?gameId=${g.id}`;
          const qr = await QRCode.toDataURL(url, {
            margin: 1,
            width: 100,
            color: { dark: '#0c1b24', light: '#f8fafc' },
          });
          newMap[g.id] = qr;
        } catch {
          // ignore
        }
      }
      setQrCodeMap(newMap);
    };
    generateQrs();
  }, [stats?.recentGames]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Delegation Ratio calculation
  const totalDelegated = stats?.totalDelegated || 30;
  const totalKept = stats?.totalKept || 40;
  const totalTasks = totalDelegated + totalKept || 1;
  const aiDelegationPercent = Math.round((totalDelegated / totalTasks) * 100);
  const humanPercent = 100 - aiDelegationPercent;

  return (
    <div className="min-h-screen bg-chalk-bg text-chalk-white font-sans selection:bg-chalk-rose/30 p-4 md:p-6 flex flex-col justify-between">
      {/* Blackboard Top Bar */}
      <header className="border-b border-chalk-border pb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg bg-chalk-surface hover:bg-chalk-teal/20 text-chalk-teal border border-chalk-border transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>スマホ画面に戻る</span>
          </Link>

          <div>
            <div className="text-xs font-bold text-chalk-teal tracking-widest font-sans flex items-center gap-1.5">
              <span>ICU FESTIVAL 2026</span>
              <span className="text-chalk-rose font-serif">BLUE ROSE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-chalk-rose animate-ping ml-1" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              教室黒板スクリーン <span className="text-chalk-yellow text-sm font-normal">［投影シアター］</span>
            </h1>
          </div>
        </div>

        {/* Live stats badges & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-chalk-white/60 font-mono">CLASSROOM TIME</div>
            <div className="text-sm font-mono font-bold text-chalk-yellow">{currentTime}</div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-chalk-surface border border-chalk-border text-xs flex items-center gap-2">
            <span className="text-chalk-teal font-bold">{stats?.totalGames || 0}</span>
            <span className="text-chalk-white/70">ゲーム制作</span>
            <span className="text-chalk-white/30">|</span>
            <span className="text-chalk-rose font-bold">{stats?.totalPassports || 0}</span>
            <span className="text-chalk-white/70">箱庭発行</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-chalk-surface hover:bg-chalk-teal/20 text-chalk-white border border-chalk-border transition-colors"
            title="全画面表示の切り替え"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Blackboard Projection Content */}
      <main className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Classroom Collective Synergy Meter & Hakoniwa Live Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Module 1: Classroom Collective Synergy Meter */}
          <section className="p-5 rounded-2xl bg-chalk-surface border border-chalk-border shadow-chalkglow space-y-4">
            <div className="flex items-center justify-between border-b border-chalk-border pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-chalk-yellow" />
                <h2 className="text-sm font-bold text-white tracking-wide">
                  教室のAI協調率メーター
                </h2>
              </div>
              <span className="text-[11px] font-mono text-chalk-teal">
                総仕分けタスク: {totalTasks}件
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-chalk-rose flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> 人間が抱きしめる: {humanPercent}%
                </span>
                <span className="text-chalk-teal flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> AIに委ねる: {aiDelegationPercent}%
                </span>
              </div>

              {/* Progress gauge */}
              <div className="w-full h-4 rounded-full bg-chalk-bg overflow-hidden border border-chalk-border flex">
                <div
                  className="h-full bg-chalk-rose transition-all duration-700"
                  style={{ width: `${humanPercent}%` }}
                />
                <div
                  className="h-full bg-chalk-teal transition-all duration-700"
                  style={{ width: `${aiDelegationPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-chalk-white/70 leading-relaxed pt-1">
                ※来場者がWORKゾーンでスワイプした結果がリアルタイムに積算されています。
              </p>
            </div>
          </section>

          {/* Module 2: Live Hakoniwa Carousel Showcase */}
          <section className="p-5 rounded-2xl bg-chalk-surface border border-chalk-border space-y-4">
            <div className="flex items-center justify-between border-b border-chalk-border pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-chalk-rose" />
                <h2 className="text-sm font-bold text-white">
                  最新の箱庭パスポート（来場者の共創）
                </h2>
              </div>
              <span className="text-[10px] text-chalk-yellow font-bold uppercase tracking-wider">
                LATEST PASSPORT
              </span>
            </div>

            {activePassportView ? (
              <div className="p-4 rounded-xl bg-chalk-bg border border-chalk-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-chalk-teal">
                    {activePassportView.work?.futureTitle || '概念翻訳アーキテクト'}
                  </span>
                  <span className="text-[10px] text-chalk-rose font-medium">
                    世界観: {activePassportView.self?.worldTheme || 'Blue Rose Mystic'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-chalk-surface border border-chalk-border/60 text-xs text-chalk-white/90 italic">
                  「{activePassportView.self?.blueRoseStatement || '不可能な青を、日々の小さな探究で描き出していく。'}」
                </div>

                <div className="flex items-center justify-between text-[11px] text-chalk-white/60 pt-1">
                  <span>自作ゲーム: 『{activePassportView.make?.title || '青いバラの空中散歩'}』</span>
                  <span>AI協調: {activePassportView.work?.synergyRatio ?? 50}%</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-chalk-white/60 text-center py-6">
                パスポート発行を待機中...
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Indies Game Arcade with QR Codes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <section className="p-5 rounded-2xl bg-chalk-surface border border-chalk-border space-y-5">
            <div className="flex items-center justify-between border-b border-chalk-border pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-chalk-teal" />
                <div>
                  <h2 className="text-base font-bold text-white">
                    インディーズ・ゲームアーケード
                  </h2>
                  <p className="text-[11px] text-chalk-white/70">
                    黒板のQRコードをスマホで読み取ると、その場で今すぐ遊べます！
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-chalk-teal/20 text-chalk-teal border border-chalk-teal/40 font-bold">
                リアルタイム配信中
              </span>
            </div>

            {/* Active Game Live Play Screen */}
            {activePlayGame && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-chalk-bg p-4 rounded-xl border border-chalk-border">
                {/* Canvas Game Viewer */}
                <div className="md:col-span-7 flex justify-center">
                  <CanvasGameViewer config={activePlayGame} />
                </div>

                {/* QR Code & Description */}
                <div className="md:col-span-5 space-y-3 text-center md:text-left">
                  <div>
                    <span className="text-[10px] text-chalk-teal uppercase font-bold tracking-wider">
                      NOW PLAYING ON BOARD
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {activePlayGame.title}
                    </h3>
                    <p className="text-xs text-chalk-white/70 mt-1 leading-snug">
                      {activePlayGame.specialRuleDescription}
                    </p>
                  </div>

                  {/* QR Code for phone scan */}
                  <div className="inline-block p-2 rounded-xl bg-white shadow-md">
                    {qrCodeMap[activePlayGame.id] ? (
                      <img
                        src={qrCodeMap[activePlayGame.id]}
                        alt="QR Code"
                        className="w-24 h-24 block"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-chalk-bg/20 flex items-center justify-center text-xs text-ink">
                        QR生成中
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-chalk-yellow font-bold flex items-center justify-center md:justify-start gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>スマホでスキャンして手元で遊ぶ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Game Grid Shelf */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-chalk-white/80">
                教室で作られたゲーム一覧（クリックで黒板にロード）:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {stats?.recentGames?.map((game) => {
                  const isSelected = activePlayGame?.id === game.id;
                  return (
                    <button
                      key={game.id}
                      onClick={() => setActivePlayGame(game)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-chalk-teal/20 border-chalk-teal ring-1 ring-chalk-teal shadow-chalkglow'
                          : 'bg-chalk-bg border-chalk-border hover:border-chalk-teal/50'
                      }`}
                    >
                      <div className="text-xs font-bold text-white truncate">
                        {game.title}
                      </div>
                      <div className="text-[10px] text-chalk-teal mt-0.5 uppercase">
                        {game.engineType.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-chalk-white/60 mt-1 truncate">
                        {game.specialRuleName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Blackboard Footer */}
      <footer className="border-t border-chalk-border pt-3 flex flex-wrap items-center justify-between text-xs text-chalk-white/60">
        <div>
          ICU FESTIVAL 2026 「AIに、出会い直す。」 パビリオン 黒板プロジェクター・モード
        </div>
        <div className="text-[11px] text-chalk-yellow">
          スマートフォンでゲームを作ると、この黒板にリアルタイムで届きます！
        </div>
      </footer>
    </div>
  );
}
