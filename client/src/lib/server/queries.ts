import { getDb } from './db';

const TEACHER_SELECT = `
  SELECT t.*,
         u.username, u.first_name, u.last_name,
         d.id AS dept_id, d.name AS dept_name, d.description AS dept_description,
         tr.id AS trade_id, tr.slug AS trade_slug, tr.code AS trade_code, tr.tagline AS trade_tagline,
         p.name AS trade_name
  FROM teachers t
  JOIN users u ON u.id = t.user_id
  LEFT JOIN departments d ON d.id = t.department_id
  LEFT JOIN trades tr ON tr.id = t.trade_id
  LEFT JOIN programs p ON p.id = tr.program_id
`;

const TRADE_SELECT = `
  SELECT tr.*, p.name AS program_name, p.level AS program_level,
         d.name AS department_name, d.id AS department_id
  FROM trades tr
  JOIN programs p ON p.id = tr.program_id
  JOIN departments d ON d.id = p.department_id
`;

export type TeacherRow = Record<string, any>;
export type TradeRow = Record<string, any>;

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'T'
  );
}

export function teacherJson(row: TeacherRow, origin = '') {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.username;
  const photo = row.photo ? String(row.photo) : null;
  return {
    id: row.id,
    user: `${fullName} (${row.username})`,
    user_id: row.user_id,
    full_name: fullName,
    initials: initialsOf(fullName),
    email: row.email || '',
    phone: row.phone || '',
    employee_id: row.employee_id,
    title: row.title,
    is_hod: row.is_hod === 1,
    slug: row.slug,
    qualification: row.qualification,
    hire_date: row.hire_date,
    bio: row.bio,
    levels: row.levels,
    classes: row.classes,
    years_experience: row.years_experience,
    photo,
    photo_url: photo ? (photo.startsWith('http') ? photo : `${origin}${photo}`) : null,
    is_public: row.is_public === 1,
    order: row.order_index,
    department: row.dept_id
      ? { id: row.dept_id, name: row.dept_name, description: row.dept_description ?? '' }
      : null,
    trade: row.trade_id
      ? {
          id: row.trade_id,
          slug: row.trade_slug,
          code: row.trade_code,
          name: row.trade_name,
          tagline: row.trade_tagline,
        }
      : null,
  };
}

export function teamForTrade(tradeId: number, origin = '') {
  const rows = getDb()
    .prepare(`${TEACHER_SELECT} WHERE t.trade_id = ? AND t.is_public = 1
              ORDER BY t.is_hod DESC, t.order_index ASC, t.id ASC`)
    .all(tradeId) as TeacherRow[];
  return rows.map((row) => teacherJson(row, origin));
}

export function tradeJson(row: TradeRow, origin = '') {
  const team = teamForTrade(row.id, origin);
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    name: row.program_name,
    tagline: row.tagline,
    summary: row.summary,
    description: row.description,
    icon: row.icon,
    image: row.image,
    entry_requirements: row.entry_requirements,
    career_paths: JSON.parse(row.career_paths || '[]'),
    curriculum: JSON.parse(row.curriculum || '[]'),
    is_active: row.is_active === 1,
    order: row.order_index,
    department: row.department_name,
    department_id: row.department_id,
    teachers: team,
    teacher_count: team.length,
  };
}

export function allTrades(origin = '', includeInactive = false) {
  const rows = getDb()
    .prepare(
      `${TRADE_SELECT} ${includeInactive ? '' : 'WHERE tr.is_active = 1'} ORDER BY tr.order_index ASC, tr.code ASC`
    )
    .all() as TradeRow[];
  return rows.map((row) => tradeJson(row, origin));
}

export function tradeBySlug(slug: string, origin = '') {
  const row = getDb().prepare(`${TRADE_SELECT} WHERE tr.slug = ?`).get(slug) as TradeRow | undefined;
  return row ? tradeJson(row, origin) : null;
}

export function teachers(origin = '', filters: { trade?: string; is_hod?: string; is_public?: string } = {}) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.trade) {
    clauses.push('t.trade_id = ?');
    params.push(Number(filters.trade));
  }
  if (filters.is_hod === 'true') clauses.push('t.is_hod = 1');
  if (filters.is_hod === 'false') clauses.push('t.is_hod = 0');
  if (filters.is_public === 'true') clauses.push('t.is_public = 1');
  if (filters.is_public === 'false') clauses.push('t.is_public = 0');
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = getDb()
    .prepare(`${TEACHER_SELECT} ${where} ORDER BY t.is_hod DESC, t.order_index ASC, t.id ASC`)
    .all(...params) as TeacherRow[];
  return rows.map((row) => teacherJson(row, origin));
}

export function teacherBySlug(slug: string, origin = '') {
  const row = getDb()
    .prepare(`${TEACHER_SELECT} WHERE t.slug = ?`)
    .get(slug) as TeacherRow | undefined;
  return row ? teacherJson(row, origin) : null;
}

export function departmentJson(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    head: row.head_id ?? null,
  };
}

export function programJson(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    description: row.description ?? '',
    department: row.dept_id
      ? { id: row.dept_id, name: row.dept_name, description: row.dept_description ?? '', head: null }
      : null,
    department_id: row.department_id,
  };
}

export function subjectJson(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    credits: row.credits,
    description: row.description ?? '',
    department: row.dept_id
      ? { id: row.dept_id, name: row.dept_name, description: row.dept_description ?? '', head: null }
      : null,
    program: row.program_id
      ? { id: row.program_id, name: row.program_name, level: row.program_level, description: '' ,
          department: row.dept_id ? { id: row.dept_id, name: row.dept_name, description: '', head: null } : null }
      : null,
    department_id: row.department_id,
    program_id: row.program_id,
  };
}

export function studentJson(row: Record<string, any>) {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.username;
  return {
    id: row.id,
    student_id: row.student_id,
    full_name: fullName,
    enrollment_date: row.enrollment_date,
    date_of_birth: row.date_of_birth,
    gender: row.gender,
    parent_name: row.parent_name,
    parent_phone: row.parent_phone,
    address: row.address,
    is_active: row.is_active === 1,
    program: {
      id: row.program_id,
      name: row.program_name,
      level: row.program_level,
      description: '',
      department: null,
    },
    program_id: row.program_id,
    user: `${fullName} (${row.username})`,
  };
}

export const STUDENT_SELECT = `
  SELECT s.*, u.username, u.first_name, u.last_name,
         p.name AS program_name, p.level AS program_level
  FROM students s
  JOIN users u ON u.id = s.user_id
  JOIN programs p ON p.id = s.program_id
`;

export function studentById(id: number) {
  const row = getDb().prepare(`${STUDENT_SELECT} WHERE s.id = ?`).get(id) as
    | Record<string, any>
    | undefined;
  return row ? studentJson(row) : null;
}

export function subjectById(id: number) {
  const row = getDb()
    .prepare(
      `SELECT s.*, d.name AS dept_name, d.description AS dept_description,
              p.name AS program_name, p.level AS program_level
       FROM subjects s
       JOIN departments d ON d.id = s.department_id
       JOIN programs p ON p.id = s.program_id
       WHERE s.id = ?`
    )
    .get(id) as Record<string, any> | undefined;
  if (!row) return null;
  return subjectJson({
    ...row,
    dept_id: row.department_id,
    program_id: row.program_id,
    dept_name: row.dept_name,
  });
}

export function gradeJson(row: Record<string, any>) {
  return {
    id: row.id,
    score: String(row.score),
    max_score: String(row.max_score),
    term: row.term,
    academic_year: row.academic_year,
    date_recorded: row.date_recorded,
    student: row.student_id
      ? {
          id: row.student_id,
          student_id: row.student_code,
          full_name: [row.student_first, row.student_last].filter(Boolean).join(' '),
          program: { id: null, name: row.student_program, level: 'secondary', description: '', department: null },
        }
      : null,
    subject: {
      id: row.subject_id,
      name: row.subject_name,
      code: row.subject_code,
      credits: 1,
      description: '',
      department: null,
      program: null,
    },
  };
}

export const GRADE_SELECT = `
  SELECT g.*,
         st.student_id AS student_code, st.id AS student_id,
         su.first_name AS student_first, su.last_name AS student_last,
         pr.name AS student_program,
         sub.name AS subject_name, sub.code AS subject_code
  FROM grades g
  JOIN students st ON st.id = g.student_id
  JOIN users su ON su.id = st.user_id
  JOIN programs pr ON pr.id = st.program_id
  JOIN subjects sub ON sub.id = g.subject_id
`;

export function attendanceJson(row: Record<string, any>) {
  return {
    id: row.id,
    date: row.date,
    status: row.status,
    notes: row.notes ?? '',
    student: row.student_id
      ? {
          id: row.student_id,
          student_id: row.student_code,
          full_name: [row.student_first, row.student_last].filter(Boolean).join(' '),
          program: { id: null, name: row.student_program, level: 'secondary', description: '', department: null },
        }
      : null,
    subject: row.subject_name
      ? {
          id: row.subject_id,
          name: row.subject_name,
          code: row.subject_code,
          credits: 1,
          description: '',
          department: null,
          program: null,
        }
      : null,
  };
}

export const ATTENDANCE_SELECT = `
  SELECT a.*,
         st.student_id AS student_code,
         su.first_name AS student_first, su.last_name AS student_last,
         pr.name AS student_program,
         sub.name AS subject_name, sub.code AS subject_code
  FROM attendance a
  JOIN students st ON st.id = a.student_id
  JOIN users su ON su.id = st.user_id
  JOIN programs pr ON pr.id = st.program_id
  LEFT JOIN subjects sub ON sub.id = a.subject_id
`;

const TERM_LABELS: Record<number, string> = { 1: 'Term 1', 2: 'Term 2', 3: 'Term 3' };

export function resourceJson(row: Record<string, any>, origin = '') {
  const file = row.file ? String(row.file) : null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    class_level: row.class_level,
    class_level_detail: { name: row.class_level, level_name: row.class_level },
    year: row.year,
    academic_year: `${row.year}-${row.year + 1}`,
    term: row.term,
    term_display: TERM_LABELS[row.term] ?? `Term ${row.term}`,
    resource_type: row.resource_type,
    file,
    file_url: file ? (file.startsWith('http') ? file : `${origin}${file}`) : null,
    file_size: row.file_size || '',
    upload_date: row.upload_date,
    uploaded_by_name: row.uploaded_by_name ?? '',
  };
}

export function newsJson(row: Record<string, any>) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    image: row.image,
    is_published: row.is_published === 1,
    published_date: row.published_date,
    author: row.author_name ?? '',
  };
}

export function holidayJson(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    start_date: row.start_date,
    end_date: row.end_date,
    description: row.description ?? '',
    is_national: row.is_national === 1,
  };
}
