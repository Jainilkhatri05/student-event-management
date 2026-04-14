// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await queryOne(`
      SELECT e.*, s.name AS organizer_name,
        COUNT(r.registration_id) AS registration_count
      FROM Events e
      LEFT JOIN Students s ON e.organizer_id = s.student_id
      LEFT JOIN Registrations r ON e.event_id = r.event_id
      WHERE e.event_id = ?
      GROUP BY e.event_id
    `, [Number(id)]);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error('GET /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete registrations first (FK constraint)
    await execute('DELETE FROM Registrations WHERE event_id = ?', [Number(id)]);
    const result = await execute('DELETE FROM Events WHERE event_id = ?', [Number(id)]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
