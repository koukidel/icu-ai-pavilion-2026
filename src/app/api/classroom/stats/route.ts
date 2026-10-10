import { NextResponse } from 'next/server';
import { getClassroomStats } from '@/lib/classroomStore';

export async function GET() {
  const stats = getClassroomStats();
  return NextResponse.json(stats);
}
