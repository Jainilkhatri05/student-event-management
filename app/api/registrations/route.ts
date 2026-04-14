// app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId   = searchParams.get('event_id');
    const studentId = searchParams.get('student_id');

    let sql = `
      SELECT
        r.*,
        s.name       AS student_name,
        s.email      AS student_email,
        s.department AS student_department,
        e.title      AS event_title
      FROM Registrations r
      JOIN Students s ON r.student_id = s.student_id
      JOIN Events   e ON r.event_id   = e.event_id
    `;
    const params: number[] = [];

    if (eventId) {
      sql += ' WHERE r.event_id = ?';
      params.push(Number(eventId));
    } else if (studentId) {
      sql += ' WHERE r.student_id = ?';
      params.push(Number(studentId));
    }
    sql += ' ORDER BY r.registered_at DESC';

    const registrations = await query(sql, params);
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

    // Validate student and event exist
    const student = await queryOne('SELECT student_id FROM Students WHERE student_id = ?', [Number(student_id)]);
    const event   = await queryOne('SELECT event_id FROM Events WHERE event_id = ?',       [Number(event_id)]);

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    if (!event)   return NextResponse.json({ error: 'Event not found' },   { status: 404 });

    const result = await execute(
      'INSERT INTO Registrations (student_id, event_id) VALUES (?, ?)',
      [Number(student_id), Number(event_id)]
    );

    const registration = await queryOne(`
      SELECT r.*, s.name AS student_name, e.title AS event_title
      FROM Registrations r
      JOIN Students s ON r.student_id = s.student_id
      JOIN Events   e ON r.event_id   = e.event_id
      WHERE r.registration_id = ?
    `, [result.insertId]);

    return NextResponse.json(registration, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('Duplicate entry') || msg.includes('ER_DUP_ENTRY')) {
      return NextResponse.json({ error: 'Student already registered for this event' }, { status: 409 });
    }
    console.error('POST /api/registrations error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
