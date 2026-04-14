import 'dotenv/config';
import { query } from './app/lib/db.js';

async function main() {
  try {
    const events = await query(`
      SELECT
        e.*,
        s.name AS organizer_name,
        COUNT(r.registration_id) AS registration_count
      FROM Events e
      LEFT JOIN Students s ON e.organizer_id = s.student_id
      LEFT JOIN Registrations r ON e.event_id = r.event_id
      GROUP BY e.event_id
      ORDER BY e.event_date ASC
    `);
    console.log("SUCCESS:", events.length);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
  process.exit(0);
}
main();
