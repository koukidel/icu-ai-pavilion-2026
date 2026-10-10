'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  WorkResult,
  GameConfig,
  SelfResult,
  CareResult,
  PassportData,
} from '@/types/pavilion';

interface SessionContextType {
  work: WorkResult | null;
  setWork: (data: WorkResult) => void;
  make: GameConfig | null;
  setMake: (data: GameConfig) => void;
  self: SelfResult | null;
  setSelf: (data: SelfResult) => void;
  care: CareResult | null;
  setCare: (data: CareResult) => void;
  passport: PassportData | null;
  setPassport: (data: PassportData) => void;
  completedZonesCount: number;
  isZoneCompleted: (zone: 'work' | 'make' | 'self' | 'care') => boolean;
  resetSession: () => void;
  publishGameToClassroom: (game: GameConfig) => void;
  publishPassportToClassroom: (pass: PassportData) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = 'icu_ai_pavilion_session_2026';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [work, setWorkState] = useState<WorkResult | null>(null);
  const [make, setMakeState] = useState<GameConfig | null>(null);
  const [self, setSelfState] = useState<SelfResult | null>(null);
  const [care, setCareState] = useState<CareResult | null>(null);
  const [passport, setPassportState] = useState<PassportData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.work) setWorkState(parsed.work);
        if (parsed.make) setMakeState(parsed.make);
        if (parsed.self) setSelfState(parsed.self);
        if (parsed.care) setCareState(parsed.care);
        if (parsed.passport) setPassportState(parsed.passport);
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = { work, make, self, care, passport };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [work, make, self, care, passport, isLoaded]);

  const setWork = (data: WorkResult) => {
    setWorkState(data);
    // Broadcast delegation stats
    broadcastClassroomEvent('DELEGATION_UPDATE', {
      delegated: data.delegatedCards.length,
      kept: data.keptCards.length,
    });
  };

  const setMake = (data: GameConfig) => {
    setMakeState(data);
    publishGameToClassroom(data);
  };

  const setSelf = (data: SelfResult) => {
    setSelfState(data);
  };

  const setCare = (data: CareResult) => {
    setCareState(data);
  };

  const setPassport = (data: PassportData) => {
    setPassportState(data);
    publishPassportToClassroom(data);
  };

  const isZoneCompleted = (zone: 'work' | 'make' | 'self' | 'care'): boolean => {
    switch (zone) {
      case 'work':
        return !!work;
      case 'make':
        return !!make;
      case 'self':
        return !!self;
      case 'care':
        return !!care;
      default:
        return false;
    }
  };

  const completedZonesCount = ['work', 'make', 'self', 'care'].filter((z) =>
    isZoneCompleted(z as any)
  ).length;

  const resetSession = () => {
    setWorkState(null);
    setMakeState(null);
    setSelfState(null);
    setCareState(null);
    setPassportState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Broadcast to classroom blackboard
  const broadcastClassroomEvent = (type: string, payload: any) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('icu_pavilion_classroom_channel');
        bc.postMessage({ type, payload, timestamp: Date.now() });
        bc.close();
      }
      // Also post to server route
      fetch('/api/classroom/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const publishGameToClassroom = (game: GameConfig) => {
    broadcastClassroomEvent('GAME_CREATED', game);
  };

  const publishPassportToClassroom = (pass: PassportData) => {
    broadcastClassroomEvent('PASSPORT_CREATED', pass);
  };

  return (
    <SessionContext.Provider
      value={{
        work,
        setWork,
        make,
        setMake,
        self,
        setSelf,
        care,
        setCare,
        passport,
        setPassport,
        completedZonesCount,
        isZoneCompleted,
        resetSession,
        publishGameToClassroom,
        publishPassportToClassroom,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const usePavilionSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('usePavilionSession must be used within a SessionProvider');
  }
  return context;
};
