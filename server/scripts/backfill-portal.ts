/**
 * Adds the demo rows of the school-operations features to a database that was
 * seeded before those features existed — timetable, fee structure, invoices,
 * payments, guardians, certificates, this term's marks and two weeks of
 * attendance. Idempotent: run it as often as you like.
 *
 *   cd server && npx tsx scripts/backfill-portal.ts
 */
import { hashPassword } from '../src/lib/auth';
import { getDb } from '../src/lib/db';

const db = getDb();

const maybeOne = <T>(sql: string, params: unknown[] = []) =>
  db.prepare(sql).get(...params) as T | undefined;

const YEAR = '2026/2027';
const setSetting = db.prepare(
  `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
   ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
);
setSetting.run('academic_year', YEAR);
setSetting.run('current_term', 'Term 1');
setSetting.run('fee_currency', 'RWF');

const subjects = db.prepare('SELECT id, code FROM subjects').all() as { id: number; code: string }[];
const subjectId = (code: string) => subjects.find((subject) => subject.code === code)?.id ?? null;

const sod = db
  .prepare(
    `SELECT s.id, s.level FROM students s
       JOIN programs p ON p.id = s.program_id
      WHERE p.name = 'Software Development'`
  )
  .all() as { id: number; level: string }[];

const teachers = db
  .prepare(`SELECT t.id FROM teachers t JOIN trades tr ON tr.id = t.trade_id WHERE tr.code = 'SOD' LIMIT 2`)
  .all() as { id: number }[];

const sodTrade = maybeOne<{ id: number }>(`SELECT id FROM trades WHERE code = 'SOD'`);

// ---------------------------------------------------------------- this term
const insertGrade = db.prepare(
  `INSERT INTO grades (student_id, subject_id, teacher_id, score, max_score, term, academic_year)
   VALUES (?, ?, ?, ?, 100, 'Term 1', ?)`
);
sod.forEach((student, index) => {
  const rows: [string, number, number | undefined][] = [
    ['MATH-01', 58 + ((index * 7) % 34), teachers[0]?.id],
    ['ICT-01', 64 + ((index * 5) % 30), teachers[1]?.id],
  ];
  rows.forEach(([code, score, teacherId]) => {
    const subject = subjectId(code);
    if (!subject) return;
    const existing = maybeOne(
      'SELECT id FROM grades WHERE student_id = ? AND subject_id = ? AND term = ? AND academic_year = ?',
      [student.id, subject, 'Term 1', YEAR]
    );
    if (existing) return;
    insertGrade.run(student.id, subject, teacherId ?? null, score, YEAR);
  });
});

// --------------------------------------------------------------- attendance
const insertAttendance = db.prepare(
  `INSERT INTO attendance (student_id, subject_id, date, status, notes, recorded_by)
   VALUES (?, NULL, ?, ?, '', NULL)`
);
const days: string[] = [];
const cursor = new Date();
while (days.length < 10) {
  const day = cursor.getDay();
  if (day !== 0 && day !== 6) days.push(cursor.toISOString().slice(0, 10));
  cursor.setDate(cursor.getDate() - 1);
}
sod.forEach((student, studentIndex) => {
  days.forEach((day, dayIndex) => {
    if (maybeOne('SELECT id FROM attendance WHERE student_id = ? AND date = ?', [student.id, day])) return;
    const pattern = (studentIndex + dayIndex) % 11;
    const status = pattern === 3 ? 'absent' : pattern === 7 ? 'late' : pattern === 9 ? 'excused' : 'present';
    insertAttendance.run(student.id, day, status);
  });
});

// ------------------------------------------------------------------ parents
const parentEmail = 'parent@lyceedenyanza.rw';
let parent = maybeOne<{ id: number }>('SELECT id FROM users WHERE lower(email) = ?', [parentEmail]);
if (!parent) {
  const created = db
    .prepare(
      `INSERT INTO users (username, email, password, first_name, last_name, role, is_staff, approval, is_active)
       VALUES ('parent', ?, ?, 'Solange', 'Mukamana', 'parent', 0, 'approved', 1)`
    )
    .run(parentEmail, hashPassword('Parent@2026'));
  parent = { id: Number(created.lastInsertRowid) };
  console.log('created the demo parent account (password copied from an existing account)');
}
const link = db.prepare(
  'INSERT OR IGNORE INTO guardians (user_id, student_id, relation, is_primary) VALUES (?, ?, ?, 1)'
);
db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword('Parent@2026'), parent.id);
sod.slice(0, 2).forEach((student) => link.run(parent!.id, student.id, 'Mother'));

// --------------------------------------------------------------------- fees
const insertStructure = db.prepare(
  `INSERT INTO fee_structures (year, term, trade_id, level, name, amount, currency, due_date, is_active)
   VALUES (?, 'Term 1', ?, ?, 'Tuition — Term 1', ?, 'RWF', ?, 1)`
);
const structureFor = (level: string, amount: number) => {
  if (!sodTrade) return null;
  const existing = maybeOne<{ id: number }>(
    'SELECT id FROM fee_structures WHERE year = ? AND level = ? AND trade_id = ? AND term = ?',
    [YEAR, level, sodTrade.id, 'Term 1']
  );
  if (existing) return existing.id;
  return Number(
    insertStructure.run(YEAR, sodTrade.id, level, amount, `${YEAR.slice(0, 4)}-10-15`).lastInsertRowid
  );
};
const l3Structure = structureFor('L3', 120000);

const insertInvoice = db.prepare(
  `INSERT INTO invoices (student_id, structure_id, year, term, title, amount, due_date, status)
   VALUES (?, ?, ?, 'Term 1', 'Tuition — Term 1', 120000, ?, 'unpaid')`
);
const insertPayment = db.prepare(
  `INSERT INTO payments (invoice_id, student_id, amount, method, reference, note, recorded_by)
   VALUES (?, ?, ?, ?, ?, '', 'admin')`
);
sod
  .filter((student) => student.level === 'L3')
  .forEach((student, index) => {
    const existing = maybeOne<{ id: number }>(
      'SELECT id FROM invoices WHERE student_id = ? AND year = ? AND term = ?',
      [student.id, YEAR, 'Term 1']
    );
    const invoiceId =
      existing?.id ??
      Number(
        insertInvoice.run(student.id, l3Structure, YEAR, `${YEAR.slice(0, 4)}-10-15`).lastInsertRowid
      );
    if (index % 3 === 2) return;
    const alreadyPaid = maybeOne<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE invoice_id = ?',
      [invoiceId]
    )?.total;
    if (alreadyPaid) return;
    const paid = index % 2 === 0 ? 120000 : 60000;
    insertPayment.run(invoiceId, student.id, paid, index % 2 === 0 ? 'momo' : 'cash', `RCPT-${1000 + index}`);
    db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(
      paid >= 120000 ? 'paid' : 'partial',
      invoiceId
    );
  });

// ---------------------------------------------------------------- timetable
if (sodTrade) {
  const slots: [number, string, string, string, number][] = [
    [1, '08:00', '09:40', 'MATH-01', 0],
    [1, '10:00', '11:40', 'ICT-01', 1],
    [2, '08:00', '09:40', 'ICT-01', 1],
    [2, '10:00', '11:40', 'MATH-01', 0],
    [3, '08:00', '09:40', 'MATH-01', 0],
    [3, '10:00', '11:40', 'ICT-01', 1],
    [4, '08:00', '09:40', 'ICT-01', 1],
    [4, '10:00', '11:40', 'MATH-01', 0],
    [5, '08:00', '09:40', 'MATH-01', 0],
  ];
  const existing = maybeOne<{ total: number }>(
    'SELECT COUNT(*) AS total FROM timetable_slots WHERE trade_id = ? AND level = ?',
    [sodTrade.id, 'L3']
  )?.total;
  if (!existing) {
    const insert = db.prepare(
      `INSERT INTO timetable_slots (trade_id, level, day, start_time, end_time, subject_id, teacher_id, room)
       VALUES (?, 'L3', ?, ?, ?, ?, ?, ?)`
    );
    slots.forEach(([day, start, end, code, teacherIndex]) => {
      insert.run(
        sodTrade!.id,
        day,
        start,
        end,
        subjectId(code),
        teachers[teacherIndex]?.id ?? null,
        code === 'ICT-01' ? 'Computer lab' : 'Room 12'
      );
    });
  }
}

// ------------------------------------------------------------- certificates
const insertCertificate = db.prepare(
  `INSERT INTO certificates (student_id, code, title, trade_id, level, year, serial, issued_by, note)
   VALUES (?, ?, ?, ?, 'L5', ?, ?, 'admin', '')`
);
sod
  .filter((student) => student.level === 'L5')
  .slice(0, 2)
  .forEach((student, index) => {
    const code = `LDN-${YEAR.slice(0, 4)}-${index === 0 ? 'A1B2C3' : 'D4E5F6'}`;
    if (maybeOne('SELECT id FROM certificates WHERE code = ?', [code])) return;
    insertCertificate.run(
      student.id,
      code,
      'Level 5 Certificate in Software Development',
      sodTrade?.id ?? null,
      YEAR,
      `SER-${2000 + index}`
    );
  });

console.log('portal demo data is in place');
