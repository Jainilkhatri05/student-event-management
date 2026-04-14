// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  try {
    const events = await query(`
      SELECT
        e.*,
        s.name AS organizer_name,
        COUNT(r.registration_id) AS registration_count
      FROM Events e
      LEFT JOIN Students s ON e.organizer_id = s.student_id
      LEFT JOIN Registrations r ON e.event_id = r.event_id
      GROUP BY e.event_id, s.name
      ORDER BY e.event_date ASC
    `);
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

    const result = await execute(
      'INSERT INTO Events (title, description, event_date, location, organizer_id) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', event_date, location, organizer_id || null]
    );

    const newEvent = await query(`
      SELECT e.*, s.name AS organizer_name, 0 AS registration_count
      FROM Events e
      LEFT JOIN Students s ON e.organizer_id = s.student_id
      WHERE e.event_id = ?
    `, [result.insertId]);

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
