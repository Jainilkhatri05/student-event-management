// app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  try {
    const students = await query('SELECT * FROM Students ORDER BY name ASC');
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

    const result = await execute(
      'INSERT INTO Students (name, email, department) VALUES (?, ?, ?)',
      [name, email, department || '']
    );

    const newStudent = await query(
      'SELECT * FROM Students WHERE student_id = ?',
      [result.insertId]
    );

    return NextResponse.json(newStudent[0], { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('Duplicate entry') || msg.includes('ER_DUP_ENTRY')) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    console.error('POST /api/students error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
