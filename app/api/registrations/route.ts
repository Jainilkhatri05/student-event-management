// app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('event_id');
    const studentId = searchParams.get('student_id');

    const db = getDb();
    let query = `
      SELECT 
        r.*,
        s.name as student_name,
        s.email as student_email,
        s.department as student_department,
        e.title as event_title
      FROM Registrations r
      JOIN Students s ON r.student_id = s.student_id
      JOIN Events e ON r.event_id = e.event_id
    `;
    const params: number[] = [];

    if (eventId) {
      query += ' WHERE r.event_id = ?';
      params.push(Number(eventId));
    } else if (studentId) {
      query += ' WHERE r.student_id = ?';
      params.push(Number(studentId));
    }
    query += ' ORDER BY r.registered_at DESC';

    const registrations = db.prepare(query).all(...params);
    return NextResponse.json(registrations);
  } catch (error) {
    console.error('GET /api/registrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, event_id } = body;

    if (!student_id || !event_id) {
      return NextResponse.json(
        { error: 'student_id and event_id are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Validate student and event exist
    const student = db.prepare('SELECT student_id FROM Students WHERE student_id = ?').get(Number(student_id));
    const event = db.prepare('SELECT event_id FROM Events WHERE event_id = ?').get(Number(event_id));

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const stmt = db.prepare(
      'INSERT INTO Registrations (student_id, event_id) VALUES (?, ?)'
    );
    const result = stmt.run(Number(student_id), Number(event_id));

    const registration = db.prepare(`
      SELECT r.*, s.name as student_name, e.title as event_title
      FROM Registrations r
      JOIN Students s ON r.student_id = s.student_id
      JOIN Events e ON r.event_id = e.event_id
      WHERE r.registration_id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json(registration, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Student already registered for this event' }, { status: 409 });
    }
    console.error('POST /api/registrations error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
