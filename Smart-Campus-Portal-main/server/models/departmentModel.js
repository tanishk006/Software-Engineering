const { query } = require('../config/db');

const getAllDepartments = async () => {
  return query(`
    SELECT 
      d.department_id,
      d.department_code,
      d.department_name,
      d.hod_name,
      d.contact_email,
      d.contact_phone,
      d.building_location,
      (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.department_id) AS faculty_count,
      (SELECT COUNT(*) FROM students s WHERE s.department_id = d.department_id) AS student_count
    FROM departments d
    ORDER BY d.department_name ASC
  `);
};

const getDepartmentById = async (id) => {
  const rows = await query('SELECT * FROM departments WHERE department_id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const createDepartment = async ({ code, name, hodName, contactEmail = null, contactPhone = null, buildingLocation }) => {
  const result = await query(
    `INSERT INTO departments (department_code, department_name, hod_name, contact_email, contact_phone, building_location)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [code, name, hodName, contactEmail, contactPhone, buildingLocation]
  );
  return result.insertId;
};

const updateDepartment = async (id, { code, name, hodName, contactEmail, contactPhone, buildingLocation }) => {
  const updates = [];
  const params = [];

  if (code !== undefined) { updates.push('department_code = ?'); params.push(code); }
  if (name !== undefined) { updates.push('department_name = ?'); params.push(name); }
  if (hodName !== undefined) { updates.push('hod_name = ?'); params.push(hodName); }
  if (contactEmail !== undefined) { updates.push('contact_email = ?'); params.push(contactEmail); }
  if (contactPhone !== undefined) { updates.push('contact_phone = ?'); params.push(contactPhone); }
  if (buildingLocation !== undefined) { updates.push('building_location = ?'); params.push(buildingLocation); }

  if (!updates.length) return false;

  params.push(id);
  await query(`UPDATE departments SET ${updates.join(', ')} WHERE department_id = ?`, params);
  return true;
};

const deleteDepartment = async (id) => {
  const result = await query('DELETE FROM departments WHERE department_id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
