const db = require('../config/db');

// Checks if another student already has this email or roll number
function findDuplicate(email, rollNumber, excludeId = 0) {
  const emailMatch = db
    .prepare('SELECT id FROM students WHERE email = ? AND id != ?')
    .get(email, excludeId);
  if (emailMatch) {
    return 'A student with this email already exists';
  }

  const rollMatch = db
    .prepare('SELECT id FROM students WHERE roll_number = ? AND id != ?')
    .get(rollNumber, excludeId);
  if (rollMatch) {
    return 'A student with this roll number already exists';
  }

  return null;
}

// GET /api/students?search=ravi&course=BCA
function getAllStudents(req, res) {
  const { search, course } = req.query;

  let sql = 'SELECT * FROM students WHERE 1 = 1';
  const params = [];

  if (search) {
    sql += ' AND (full_name LIKE ? OR roll_number LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (course) {
    sql += ' AND course = ?';
    params.push(course);
  }

  sql += ' ORDER BY id DESC';

  const students = db.prepare(sql).all(...params);
  res.json(students);
}

// GET /api/students/stats
function getDashboardStats(req, res) {
  const total = db.prepare('SELECT COUNT(*) AS count FROM students').get().count;
  const active = db
    .prepare("SELECT COUNT(*) AS count FROM students WHERE status = 'Active'")
    .get().count;
  const recentStudents = db
    .prepare('SELECT * FROM students ORDER BY id DESC LIMIT 5')
    .all();

  res.json({
    totalStudents: total,
    activeStudents: active,
    recentStudents: recentStudents
  });
}

// GET /api/students/:id
function getStudentById(req, res) {
  const student = db
    .prepare('SELECT * FROM students WHERE id = ?')
    .get(req.params.id);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json(student);
}

// POST /api/students
function createStudent(req, res) {
  const student = req.body;

  const duplicateMessage = findDuplicate(student.email, student.roll_number);
  if (duplicateMessage) {
    return res.status(409).json({ error: duplicateMessage });
  }

  const result = db
    .prepare(
      `INSERT INTO students
        (full_name, email, phone, roll_number, course, year_semester,
         gender, address, enrollment_date, status)
       VALUES
        (@full_name, @email, @phone, @roll_number, @course, @year_semester,
         @gender, @address, @enrollment_date, @status)`
    )
    .run(student);

  const newStudent = db
    .prepare('SELECT * FROM students WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ message: 'Student added successfully', student: newStudent });
}

// PUT /api/students/:id
function updateStudent(req, res) {
  const id = req.params.id;

  const existing = db.prepare('SELECT id FROM students WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const student = req.body;

  const duplicateMessage = findDuplicate(student.email, student.roll_number, existing.id);
  if (duplicateMessage) {
    return res.status(409).json({ error: duplicateMessage });
  }

  db.prepare(
    `UPDATE students SET
       full_name = @full_name,
       email = @email,
       phone = @phone,
       roll_number = @roll_number,
       course = @course,
       year_semester = @year_semester,
       gender = @gender,
       address = @address,
       enrollment_date = @enrollment_date,
       status = @status
     WHERE id = @id`
  ).run({ ...student, id: existing.id });

  const updatedStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(existing.id);

  res.json({ message: 'Student updated successfully', student: updatedStudent });
}

// DELETE /api/students/:id
function deleteStudent(req, res) {
  const result = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json({ message: 'Student deleted successfully' });
}

module.exports = {
  getAllStudents,
  getDashboardStats,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};