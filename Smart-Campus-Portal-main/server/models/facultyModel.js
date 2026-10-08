const { query } = require('../config/db');

const getFacultyList = async ({ departmentId, search, page = 1, limit = 12 }) => {
  const offset = (Number(page) - 1) * Number(limit);
  const whereClauses = [];
  const params = [];

  if (departmentId && departmentId !== 'All') {
    whereClauses.push('f.department_id = ?');
    params.push(departmentId);
  }

  if (search) {
    whereClauses.push('(u.full_name LIKE ? OR f.designation LIKE ? OR f.cabin_number LIKE ? OR d.department_name LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) AS total 
     FROM faculty f
     JOIN users u ON f.user_id = u.user_id
     JOIN departments d ON f.department_id = d.department_id
     ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  const sql = `
    SELECT 
      f.faculty_id,
      f.user_id,
      f.designation,
      f.cabin_number,
      f.office_hours,
      f.qualification,
      f.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      d.department_id,
      d.department_name,
      d.department_code,
      d.building_location
    FROM faculty f
    JOIN users u ON f.user_id = u.user_id
    JOIN departments d ON f.department_id = d.department_id
    ${whereSql}
    ORDER BY d.department_name ASC, u.full_name ASC
    LIMIT ? OFFSET ?
  `;

  const faculty = await query(sql, [...params, Number(limit), Number(offset)]);

  return {
    faculty,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

const getFacultyById = async (id) => {
  const sql = `
    SELECT 
      f.faculty_id,
      f.user_id,
      f.designation,
      f.cabin_number,
      f.office_hours,
      f.qualification,
      f.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      d.department_id,
      d.department_name,
      d.department_code,
      d.building_location
    FROM faculty f
    JOIN users u ON f.user_id = u.user_id
    JOIN departments d ON f.department_id = d.department_id
    WHERE f.faculty_id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

const updateFacultyEntry = async (facultyId, { departmentId, designation, cabinNumber, officeHours, qualification }) => {
  const updates = [];
  const params = [];

  if (departmentId !== undefined) { updates.push('department_id = ?'); params.push(departmentId); }
  if (designation !== undefined) { updates.push('designation = ?'); params.push(designation); }
  if (cabinNumber !== undefined) { updates.push('cabin_number = ?'); params.push(cabinNumber); }
  if (officeHours !== undefined) { updates.push('office_hours = ?'); params.push(officeHours); }
  if (qualification !== undefined) { updates.push('qualification = ?'); params.push(qualification); }

  if (!updates.length) return false;

  params.push(facultyId);
  await query(`UPDATE faculty SET ${updates.join(', ')} WHERE faculty_id = ?`, params);
  return true;
};

const deleteFacultyEntry = async (facultyId) => {
  const rows = await query('SELECT user_id FROM faculty WHERE faculty_id = ?', [facultyId]);
  if (!rows.length) return false;

  // Deleting the faculty row
  await query('DELETE FROM faculty WHERE faculty_id = ?', [facultyId]);
  return true;
};

module.exports = {
  getFacultyList,
  getFacultyById,
  updateFacultyEntry,
  deleteFacultyEntry
};
