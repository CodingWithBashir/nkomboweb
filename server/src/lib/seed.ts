import fs from 'node:fs';
import path from 'node:path';
import tradesSeed from '../data/trades.json';
import { getDb, UPLOAD_DIR } from './db';
import { hashPassword } from './auth';
import { IMAGE_HOST_ENDPOINT, IMAGE_HOST_KEY } from './imageHost';

type SeedTrade = {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  icon: string;
  image: string;
  entry_requirements: string;
  career_paths: string[];
  curriculum: unknown[];
  order: number;
  department: string;
  teachers: {
    full_name: string;
    employee_id: string;
    qualification: string;
    hire_date: string;
    title: string;
    is_hod: boolean;
    slug: string;
    bio: string;
    levels: string;
    classes: string;
    email: string;
    phone: string;
    years_experience: number;
    order: number;
  }[];
};

const TRADE_SEED = tradesSeed as unknown as SeedTrade[];

const DEPARTMENTS = [
  ['ICT', 'Software development, networking, multimedia and computer systems.'],
  ['Construction', 'Building construction and technical drawing.'],
  ['Automobile', 'Automobile mechanics and vehicle technology.'],
  ['Business & Services', 'Tourism, hospitality and food & beverage operations.'],
];

const SUBJECTS: [string, string, string, string][] = [
  ['Mathematics', 'MATH-01', 'ICT', 'Software Development'],
  ['Physics', 'PHY-01', 'ICT', 'Electronics & Telecommunications'],
  ['Computer Programming', 'ICT-01', 'ICT', 'Software Development'],
  ['Networking Essentials', 'ICT-02', 'ICT', 'Networking & Internet Technology'],
  ['Technical Drawing', 'CON-01', 'Construction', 'Building Construction'],
  ['Entrepreneurship', 'BUS-01', 'Business & Services', 'Tourism'],
];

const HOLIDAYS: [string, string, string, boolean][] = [
  ['Term 1 Holidays', '2024-12-20', '2025-01-05', false],
  ['Term 2 Holidays', '2025-04-12', '2025-05-04', false],
  ['Independence Day', '2025-07-01', '2025-07-01', true],
  ['Term 3 Holidays', '2025-11-21', '2026-01-04', false],
];

const RESOURCES: [string, string, number, number, string][] = [
  ['Mathematics Holiday Assignment', 'L3', 2024, 1, 'assignment'],
  ['Physics Revision Notes', 'L4', 2024, 2, 'revision'],
  ['Computer Programming Study Guide', 'L5', 2024, 1, 'guide'],
  ['Networking Past Paper 2024', 'L4', 2024, 3, 'past_paper'],
  ['Technical Drawing Assignment', 'L3', 2025, 1, 'assignment'],
  ['Entrepreneurship Revision Notes', 'L5', 2025, 2, 'revision'],
];

const NEWS: [string, string, string, string][] = [
  [
    'Admission for the 2025–2026 Academic Year is Open',
    'Applications for the new academic year are now open. Visit the admissions page for requirements and submit your application online.',
    'announcement',
    '2025-04-25',
  ],
  [
    'Career Guidance Session for Our Students',
    'Our students took part in a career guidance session covering TVET pathways, internships and entrepreneurship.',
    'news',
    '2025-04-15',
  ],
  [
    'Celebrating Excellence at Lycée de Nyanza',
    'We celebrated our top performing students and their teachers at the end of term award ceremony.',
    'achievement',
    '2025-04-10',
  ],
];

const FACILITIES: [string, string, number][] = [
  ['Computer Laboratory', 'Fifty workstations used by the ICT trades.', 50],
  ['Automobile Workshop', 'Vehicle bays, lifts and diagnostic equipment.', 24],
  ['Library', 'Study spaces and reference material for every trade.', 80],
  ['Sports Ground', 'Basketball and volleyball courts used for inter-class competitions.', 200],
];

const CLUBS: [string, string, string][] = [
  ['Coding Club', 'Students build small apps and prepare for competitions.', 'Wednesday'],
  ['Environment Club', 'Tree planting and campus clean-ups.', 'Saturday'],
  ['Debate & Public Speaking', 'English and Kinyarwanda debate practice.', 'Friday'],
];

const EVENTS: [string, string, string, string][] = [
  ['Sports Day', 'Annual inter-class sports competition.', '2025-05-24', 'sports'],
  ['Parents Meeting', 'Term 2 parents and teachers meeting.', '2025-06-15', 'social'],
  ['Award Ceremony', 'Annual academic awards ceremony.', '2025-07-01', 'academic'],
];

const SAMPLE_PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 88>>stream
BT /F1 18 Tf 60 760 Td (Lycée de Nyanza - Holiday Resource) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R>>
%%EOF`;

function slugUsername(name: string) {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.|\.$/g, '') || 'teacher'
  );
}

let rollCounter = 2;

export function seedDatabase() {
  const db = getDb();
  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (existing.count > 0) return { seeded: false };

  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, first_name, last_name, role, is_staff, phone)
    VALUES (@username, @email, @password, @first_name, @last_name, @role, @is_staff, @phone)
  `);
  const insertDepartment = db.prepare(
    'INSERT INTO departments (name, description) VALUES (?, ?)'
  );
  const insertProgram = db.prepare(
    'INSERT INTO programs (name, department_id, level, description) VALUES (?, ?, ?, ?)'
  );

  const seed = db.transaction(() => {
    // ------------------------------------------------------------------ users
    const adminId = Number(
      insertUser.run({
        username: 'admin',
        email: 'admin@lyceedenyanza.rw',
        password: hashPassword('Admin@2026'),
        first_name: 'Admin',
        last_name: 'User',
        role: 'headmaster',
        is_staff: 1,
        phone: '+250 788 123 456',
      }).lastInsertRowid
    );
    insertUser.run({
      username: 'dos',
      email: 'dos@lyceedenyanza.rw',
      password: hashPassword('Dos@2026'),
      first_name: 'Jane',
      last_name: 'Mukamana',
      role: 'dos',
      is_staff: 1,
      phone: '',
    });
    const teacherUserId = Number(
      insertUser.run({
        username: 'teacher',
        email: 'teacher@lyceedenyanza.rw',
        password: hashPassword('Teacher@2026'),
        first_name: 'Peter',
        last_name: 'Habimana',
        role: 'teacher',
        is_staff: 1,
        phone: '',
      }).lastInsertRowid
    );
    const studentUserId = Number(
      insertUser.run({
        username: 'student',
        email: 'student@lyceedenyanza.rw',
        password: hashPassword('Student@2026'),
        first_name: 'Aline',
        last_name: 'Uwase',
        role: 'student',
        is_staff: 0,
        phone: '',
      }).lastInsertRowid
    );

    // ------------------------------------------------------------ departments
    const departmentIds: Record<string, number> = {};
    for (const [name, description] of DEPARTMENTS) {
      departmentIds[name] = Number(insertDepartment.run(name, description).lastInsertRowid);
    }

    // --------------------------------------------------------------- programs
    const programIds: Record<string, number> = {};
    for (const trade of TRADE_SEED) {
      programIds[trade.name] = Number(
        insertProgram.run(
          trade.name,
          departmentIds[trade.department] ?? departmentIds.ICT,
          'secondary',
          `${trade.name} is offered at L3, L4 and L5 level.`
        ).lastInsertRowid
      );
    }

    // ----------------------------------------------------------------- trades
    const insertTrade = db.prepare(`
      INSERT INTO trades (program_id, slug, code, tagline, summary, description, icon, image,
                          entry_requirements, career_paths, curriculum, is_active, order_index)
      VALUES (@program_id, @slug, @code, @tagline, @summary, @description, @icon, @image,
              @entry_requirements, @career_paths, @curriculum, 1, @order_index)
    `);
    const tradeIds: Record<string, number> = {};
    TRADE_SEED.forEach((trade, index) => {
      tradeIds[trade.slug] = Number(
        insertTrade.run({
          program_id: programIds[trade.name],
          slug: trade.slug,
          code: trade.code,
          tagline: trade.tagline,
          summary: trade.summary,
          description: trade.description,
          icon: trade.icon,
          image: trade.image,
          entry_requirements: trade.entry_requirements,
          career_paths: JSON.stringify(trade.career_paths),
          curriculum: JSON.stringify(trade.curriculum),
          order_index: trade.order ?? index,
        }).lastInsertRowid
      );
    });

    // --------------------------------------------------------------- teachers
    const insertTeacher = db.prepare(`
      INSERT INTO teachers (user_id, employee_id, department_id, qualification, hire_date, trade_id,
                            slug, title, is_hod, photo, bio, levels, classes, email, phone,
                            years_experience, is_public, order_index)
      VALUES (@user_id, @employee_id, @department_id, @qualification, @hire_date, @trade_id,
              @slug, @title, @is_hod, NULL, @bio, @levels, @classes, @email, @phone,
              @years_experience, 1, @order_index)
    `);

    for (const trade of TRADE_SEED) {
      const departmentName = trade.department;
      for (const teacher of trade.teachers) {
        const isDemoTeacher = teacher.slug === 'habimana-eric';
        const userId = isDemoTeacher
          ? teacherUserId
          : Number(
              insertUser.run({
                username: slugUsername(teacher.full_name),
                email: teacher.email || `${slugUsername(teacher.full_name)}@lyceedenyanza.rw`,
                password: hashPassword('Nyanza@2026'),
                first_name: teacher.full_name.split(' ')[0],
                last_name: teacher.full_name.split(' ').slice(1).join(' '),
                role: 'teacher',
                is_staff: 1,
                phone: teacher.phone ?? '',
              }).lastInsertRowid
            );

        insertTeacher.run({
          user_id: userId,
          employee_id: teacher.employee_id,
          department_id: departmentIds[departmentName] ?? departmentIds.ICT,
          qualification: teacher.qualification,
          hire_date: teacher.hire_date,
          trade_id: tradeIds[trade.slug],
          slug: teacher.slug,
          title: teacher.title,
          is_hod: teacher.is_hod ? 1 : 0,
          bio: teacher.bio,
          levels: teacher.levels,
          classes: teacher.classes,
          email: teacher.email,
          phone: teacher.phone ?? '',
          years_experience: teacher.years_experience,
          order_index: teacher.is_hod ? 0 : (teacher.years_experience ?? 0),
        });
      }
    }

    // --------------------------------------------------------------- subjects
    const insertSubject = db.prepare(
      'INSERT INTO subjects (name, code, department_id, program_id, credits, description) VALUES (?, ?, ?, ?, 3, ?)'
    );
    const subjectIds: Record<string, number> = {};
    for (const [name, code, department, program] of SUBJECTS) {
      subjectIds[code] = Number(
        insertSubject.run(
          name,
          code,
          departmentIds[department],
          programIds[program],
          `${name} for the ${program} trade.`
        ).lastInsertRowid
      );
    }

    // ---------------------------------------------------------------- student
    const insertStudent = db.prepare(`
      INSERT INTO students (user_id, student_id, program_id, enrollment_date, date_of_birth, gender,
                            parent_name, parent_phone, address, level, promotion_year, photo,
                            is_public, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 1, 1)
    `);

    const studentId = Number(
      insertStudent.run(
        studentUserId,
        'LDN-2024-001',
        programIds['Software Development'],
        '2024-09-02',
        '2007-03-14',
        'F',
        'Mukamana Solange',
        '+250 788 555 111',
        'Nyanza District, Rwanda',
        'L5',
        2026
      ).lastInsertRowid
    );

    // A realistic roll across the trades so the student directory has content.
    const ROLL: [string, string, string, string, string][] = [
      ['Kwizera', 'Aline', 'Software Development', 'L3', 'F'],
      ['Ishimwe', 'Kevin', 'Software Development', 'L4', 'M'],
      ['Mutesi', 'Sandrine', 'Networking & Internet Technology', 'L3', 'F'],
      ['Nkurunziza', 'Patrick', 'Networking & Internet Technology', 'L5', 'M'],
      ['Umutoni', 'Chantal', 'Multimedia Production', 'L4', 'F'],
      ['Mugisha', 'Eric', 'Multimedia Production', 'L3', 'M'],
      ['Nyirahabimana', 'Josiane', 'Automobile Technology', 'L4', 'F'],
      ['Habimana', 'Jean Paul', 'Automobile Technology', 'L5', 'M'],
      ['Ingabire', 'Claudine', 'Electrical Technology', 'L3', 'F'],
      ['Bizimana', 'Samuel', 'Building Construction', 'L4', 'M'],
      ['Uwase', 'Peace', 'Tourism', 'L5', 'F'],
      ['Gasana', 'Bertrand', 'Food & Beverage Operations', 'L3', 'M'],
      ['Keza', 'Diane', 'Computer System & Architecture', 'L4', 'F'],
      ['Nshuti', 'Olivier', 'Electronics & Telecommunications', 'L5', 'M'],
    ];

    for (const [lastName, firstName, program, level, gender] of ROLL) {
      const username = slugUsername(`${firstName} ${lastName}`);
      const created = insertUser.run({
        username,
        email: `${username}@student.lyceedenyanza.rw`,
        password: hashPassword('Student@2026'),
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        is_staff: 0,
        phone: '',
      });
      insertStudent.run(
        Number(created.lastInsertRowid),
        `LDN-${new Date().getFullYear()}-${String(rollCounter++).padStart(3, '0')}`,
        programIds[program],
        '2024-09-02',
        '2008-05-20',
        gender,
        `Mr ${lastName}`,
        '+250 788 000 000',
        'Nyanza District, Rwanda',
        level,
        2026
      );
    }

    const insertGrade = db.prepare(
      `INSERT INTO grades (student_id, subject_id, teacher_id, score, max_score, term, academic_year)
       VALUES (?, ?, NULL, ?, 100, ?, ?)`
    );
    [
      ['MATH-01', 78, 'Term 1'],
      ['ICT-01', 86, 'Term 1'],
      ['MATH-01', 81, 'Term 2'],
      ['ICT-01', 90, 'Term 2'],
      ['PHY-01', 74, 'Term 2'],
      ['ICT-02', 79, 'Term 3'],
    ].forEach(([code, score, term]) =>
      insertGrade.run(studentId, subjectIds[code as string], score, term, '2025-2026')
    );

    const insertAttendance = db.prepare(
      `INSERT INTO attendance (student_id, subject_id, date, status, notes, recorded_by)
       VALUES (?, ?, ?, ?, '', ?)`
    );
    [
      ['2026-10-27', 'present'],
      ['2026-10-28', 'present'],
      ['2026-10-29', 'absent'],
      ['2026-10-30', 'present'],
      ['2026-11-02', 'late'],
      ['2026-11-03', 'present'],
      ['2026-11-04', 'present'],
      ['2026-11-05', 'excused'],
    ].forEach(([date, status]) =>
      insertAttendance.run(studentId, null, date, status, teacherUserId)
    );

    // ---------------------------------------------------------------- holidays
    const insertHoliday = db.prepare(
      'INSERT INTO holidays (name, start_date, end_date, description, is_national) VALUES (?, ?, ?, ?, ?)'
    );
    for (const [name, start, end, national] of HOLIDAYS) {
      insertHoliday.run(name, start, end, `${name} at Lycée de Nyanza.`, national ? 1 : 0);
    }

    // --------------------------------------------------------------- resources
    const insertResource = db.prepare(`
      INSERT INTO holiday_resources (title, description, class_level, year, term, resource_type,
                                     file, file_size, uploaded_by, upload_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    fs.mkdirSync(path.join(UPLOAD_DIR, 'holiday-resources'), { recursive: true });
    for (const [title, level, year, term, type] of RESOURCES) {
      const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      const relative = `/uploads/holiday-resources/${filename}`;
      const absolute = path.join(UPLOAD_DIR, 'holiday-resources', filename);
      if (!fs.existsSync(absolute)) {
        fs.writeFileSync(absolute, SAMPLE_PDF, 'utf8');
      }
      insertResource.run(
        title,
        `${title} for ${level} students.`,
        level,
        year,
        term,
        type,
        relative,
        '148 KB',
        teacherUserId
      );
    }

    // -------------------------------------------------------------------- news
    const insertNews = db.prepare(`
      INSERT INTO news_articles (title, slug, content, excerpt, author_id, category, is_published, published_date)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `);
    for (const [title, content, category, published] of NEWS) {
      insertNews.run(
        title,
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        content,
        content.slice(0, 180),
        adminId,
        category,
        `${published} 09:00:00`
      );
    }

    // --------------------------------------------------------------- campus life
    const insertFacility = db.prepare(
      'INSERT INTO facilities (name, description, image, capacity) VALUES (?, ?, ?, ?)'
    );
    for (const [name, description, capacity] of FACILITIES) {
      insertFacility.run(name, description, '/images/campus-lab.jpg', capacity);
    }
    const insertClub = db.prepare(
      'INSERT INTO clubs (name, description, meeting_day, advisor_id) VALUES (?, ?, ?, ?)'
    );
    for (const [name, description, day] of CLUBS) {
      insertClub.run(name, description, day, teacherUserId);
    }
    const insertEvent = db.prepare(
      'INSERT INTO campus_events (title, description, event_date, category) VALUES (?, ?, ?, ?)'
    );
    for (const [title, description, date, category] of EVENTS) {
      insertEvent.run(title, description, date, category);
    }

    // ---------------------------------------------------------------- settings
    db.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?), (?, ?)
       ON CONFLICT(key) DO NOTHING`
    ).run('imgdb_endpoint', IMAGE_HOST_ENDPOINT, 'imgdb_api_key', IMAGE_HOST_KEY);

    // ----------------------------------------------------------------- contact
    db.prepare(
      'INSERT INTO contact_info (address, phone, email, office_hours) VALUES (?, ?, ?, ?)'
    ).run(
      'Nyanza District, Southern Province - Rwanda',
      '+250 788 123 456',
      'info@lyceedenyanza.rw',
      'Monday - Friday: 8:00 AM - 5:00 PM'
    );

    db.prepare(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
    ).run(
      'Jean Bosco',
      'parent@example.com',
      '+250 788 000 222',
      'Boarding places',
      'Good afternoon, do you still have boarding places for L3 students?'
    );

    db.prepare(
      `INSERT INTO admission_applications (first_name, last_name, email, phone, program, previous_school,
                                           parent_name, parent_phone, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(
      'Eric',
      'Nkurunziza',
      'eric@example.com',
      '+250 788 111 333',
      'Networking & Internet Technology',
      'GS Nyanza',
      'Mukamana Alice',
      '+250 788 111 334',
      'Nyanza District'
    );
  });

  seed();
  return { seeded: true };
}
