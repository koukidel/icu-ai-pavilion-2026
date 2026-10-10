import { NextRequest, NextResponse } from 'next/server';
import { recordClassroomEvent, getClassroomStats } from '@/lib/classroomStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;
    if (type) {
      recordClassroomEvent(type, payload);
    }
    return NextResponse.json({ success: true, stats: getClassroomStats() });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
