const { query, withTransaction } = require('../config/db');

const findByEmail = async (email) => {
  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const rows = await query(
    'SELECT user_id, full_name, email, role, phone, avatar_url, is_active, created_at, updated_at FROM users WHERE user_id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const findFullProfileById = async (id) => {
  const userRows = await query(
    'SELECT user_id, full_name, email, role, phone, avatar_url, is_active, created_at, updated_at FROM users WHERE user_id = ? LIMIT 1',
    [id]
  );

  if (!userRows.length) return null;
  const user = userRows[0];

  if (user.role === 'Student') {
    const studentRows = await query(
      `SELECT s.student_id, s.roll_number, s.semester, s.batch_year, d.department_id, d.department_name, d.department_code
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.department_id
       WHERE s.user_id = ? LIMIT 1`,
      [id]
    );
    user.studentDetails = studentRows[0] || null;
  } else if (user.role === 'Faculty') {
    const facultyRows = await query(
      `SELECT f.faculty_id, f.designation, f.cabin_number, f.office_hours, f.qualification, d.department_id, d.department_name, d.department_code
       FROM faculty f
       LEFT JOIN departments d ON f.department_id = d.department_id
       WHERE f.user_id = ? LIMIT 1`,
      [id]
    );
    user.facultyDetails = facultyRows[0] || null;
  } else if (user.role === 'Staff') {
    const staffRows = await query(
      `SELECT st.staff_id, st.role_title, st.cabin_or_room, d.department_id, d.department_name, d.department_code
       FROM staff st
       LEFT JOIN departments d ON st.department_id = d.department_id
       WHERE st.user_id = ? LIMIT 1`,
      [id]
    );
    user.staffDetails = staffRows[0] || null;
  }

  return user;
};

const createUser = async ({ fullName, email, passwordHash = null, phone = null, role = 'Student', googleId = null, avatarUrl = null }) => {
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, google_id, avatar_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [fullName, email, passwordHash, phone, role, googleId, avatarUrl]
  );
  return result.insertId;
};

const createStudent = async ({ userId, rollNumber, departmentId = null, semester = 1, batchYear = null }) => {
  const result = await query(
    `INSERT INTO students (user_id, roll_number, department_id, semester, batch_year)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, rollNumber, departmentId, semester, batchYear]
  );
  return result.insertId;
};

const createFaculty = async ({ userId, departmentId, designation, cabinNumber, officeHours = null, qualification = null }) => {
  const result = await query(
    `INSERT INTO faculty (user_id, department_id, designation, cabin_number, office_hours, qualification)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, departmentId, designation, cabinNumber, officeHours, qualification]
  );
  return result.insertId;
};

const createStaff = async ({ userId, departmentId = null, roleTitle, cabinOrRoom = null }) => {
  const result = await query(
    `INSERT INTO staff (user_id, department_id, role_title, cabin_or_room)
     VALUES (?, ?, ?, ?)`,
    [userId, departmentId, roleTitle, cabinOrRoom]
  );
  return result.insertId;
};

const updateProfile = async (userId, { fullName, phone, avatarUrl }) => {
  const updates = [];
  const params = [];

  if (fullName !== undefined) {
    updates.push('full_name = ?');
    params.push(fullName);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    params.push(phone);
  }
  if (avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    params.push(avatarUrl);
  }

  if (!updates.length) return false;

  params.push(userId);
  await query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);
  return true;
};

module.exports = {
  findByEmail,
  findById,
  findFullProfileById,
  createUser,
  createStudent,
  createFaculty,
  createStaff,
  updateProfile
};
