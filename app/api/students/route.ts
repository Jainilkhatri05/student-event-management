// app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const students = db.prepare('SELECT * FROM Students ORDER BY name ASC').all();
    return NextResponse.json(students);
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, department } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'name and email are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO Students (name, email, department) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name, email, department || '');
    const newStudent = db.prepare('SELECT * FROM Students WHERE student_id = ?').get(result.lastInsertRowid);

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    console.error('POST /api/students error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
