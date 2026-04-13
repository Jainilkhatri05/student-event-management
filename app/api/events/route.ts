// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const events = db.prepare(`
      SELECT 
        e.*,
        s.name as organizer_name,
        COUNT(r.registration_id) as registration_count
      FROM Events e
      LEFT JOIN Students s ON e.organizer_id = s.student_id
      LEFT JOIN Registrations r ON e.event_id = r.event_id
      GROUP BY e.event_id
      ORDER BY e.event_date ASC
    `).all();
    return NextResponse.json(events);
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, event_date, location, organizer_id } = body;

    if (!title || !event_date || !location) {
      return NextResponse.json(
        { error: 'title, event_date, and location are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO Events (title, description, event_date, location, organizer_id) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      title,
      description || '',
      event_date,
      location,
      organizer_id || null
    );

    const newEvent = db.prepare(`
      SELECT e.*, s.name as organizer_name, 0 as registration_count
      FROM Events e
      LEFT JOIN Students s ON e.organizer_id = s.student_id
      WHERE e.event_id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
