// lib/db.ts
// Uses Node.js built-in sqlite (node:sqlite) - available in Node 22+
// No native compilation required.

import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'events.db');

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  _db = new DatabaseSync(DB_PATH);

  // Enable WAL mode for better concurrent read support
  _db.exec('PRAGMA journal_mode = WAL;');
  _db.exec('PRAGMA foreign_keys = ON;');

  // Create tables if they don't exist
  _db.exec(`
    CREATE TABLE IF NOT EXISTS Students (
      student_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      email        TEXT UNIQUE NOT NULL,
      department   TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Events (
      event_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT NOT NULL,
      description  TEXT,
      event_date   TEXT NOT NULL,
      location     TEXT NOT NULL,
      organizer_id INTEGER REFERENCES Students(student_id),
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Registrations (
      registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id      INTEGER NOT NULL REFERENCES Students(student_id),
      event_id        INTEGER NOT NULL REFERENCES Events(event_id),
      registered_at   TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, event_id)
    );
  `);

  seedIfEmpty(_db);

  return _db;
}

function seedIfEmpty(db: DatabaseSync) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM Events').get() as { cnt: number };
  if (count.cnt > 0) return;

  // Seed students first
  const insertStudent = db.prepare(
    'INSERT OR IGNORE INTO Students (name, email, department) VALUES (?, ?, ?)'
  );
  insertStudent.run('Arjun Mehta', 'arjun.mehta@college.edu', 'Computer Science');
  insertStudent.run('Priya Sharma', 'priya.sharma@college.edu', 'Electronics');
  insertStudent.run('Rohan Verma', 'rohan.verma@college.edu', 'Mechanical');
  insertStudent.run('Ananya Iyer', 'ananya.iyer@college.edu', 'Information Technology');
  insertStudent.run('Karan Singh', 'karan.singh@college.edu', 'Civil Engineering');

  // Seed events with realistic college events
  const insertEvent = db.prepare(
    'INSERT INTO Events (title, description, event_date, location, organizer_id) VALUES (?, ?, ?, ?, ?)'
  );

  insertEvent.run(
    'National Coding Hackathon 2026',
    'A 24-hour hackathon challenging students to build innovative solutions for real-world problems. Prizes worth ₹1,50,000 await the top teams. Themes include FinTech, HealthTech, and Smart Cities.',
    '2026-05-10T09:00:00',
    'Main Auditorium, Block A',
    1
  );
  insertEvent.run(
    'IoT Workshop: Build Smart Home Devices',
    'Hands-on workshop covering ESP32 microcontrollers, MQTT protocol, and cloud integration. Students will build a functional smart home prototype by end of the session.',
    '2026-04-28T10:00:00',
    'Electronics Lab, Block C',
    2
  );
  insertEvent.run(
    'AI/ML Summit: Future of Deep Learning',
    'Industry experts from Google DeepMind and NVIDIA will discuss the latest advancements in large language models, computer vision, and reinforcement learning. Panel discussions and live demos included.',
    '2026-05-22T09:30:00',
    'Seminar Hall, Block B',
    1
  );
  insertEvent.run(
    'Inter-College Basketball Tournament',
    'Annual inter-college basketball championship with 16 participating colleges. Pool-stage matches followed by knockout rounds. Register your 5-member team before April 20th.',
    '2026-04-25T08:00:00',
    'Sports Complex, Ground 2',
    3
  );
  insertEvent.run(
    'Entrepreneurship Boot Camp',
    'A 3-day intensive boot camp guided by successful startup founders. Learn lean startup methodology, pitch your idea to a panel of VCs, and win incubation support worth ₹5 Lakh.',
    '2026-06-05T09:00:00',
    'Innovation Hub, Block D',
    4
  );
  insertEvent.run(
    'Cultural Fest — Rhythm & Colors 2026',
    'Annual cultural extravaganza featuring dance competitions, music performances, art exhibitions, and food stalls. Open for all students and their families. Entry free for registered students.',
    '2026-05-15T11:00:00',
    'Campus Open Ground',
    5
  );
}
