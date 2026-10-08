const { query } = require('../config/db');

const getEmergencyContacts = async (category) => {
  let sql = 'SELECT * FROM emergency_contacts';
  const params = [];

  if (category && category !== 'All') {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY category ASC, department_name ASC';
  return query(sql, params);
};

const getContactById = async (id) => {
  const rows = await query('SELECT * FROM emergency_contacts WHERE contact_id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const createEmergencyContact = async ({ departmentName, contactPerson, phoneNumber, email = null, category = 'Security', is24x7 = 1 }) => {
  const result = await query(
    `INSERT INTO emergency_contacts (department_name, contact_person, phone_number, email, category, is_24x7)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [departmentName, contactPerson, phoneNumber, email, category, is24x7 ? 1 : 0]
  );
  return result.insertId;
};

const updateEmergencyContact = async (id, { departmentName, contactPerson, phoneNumber, email, category, is24x7 }) => {
  const updates = [];
  const params = [];

  if (departmentName !== undefined) { updates.push('department_name = ?'); params.push(departmentName); }
  if (contactPerson !== undefined) { updates.push('contact_person = ?'); params.push(contactPerson); }
  if (phoneNumber !== undefined) { updates.push('phone_number = ?'); params.push(phoneNumber); }
  if (email !== undefined) { updates.push('email = ?'); params.push(email); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (is24x7 !== undefined) { updates.push('is_24x7 = ?'); params.push(is24x7 ? 1 : 0); }

  if (!updates.length) return false;

  params.push(id);
  await query(`UPDATE emergency_contacts SET ${updates.join(', ')} WHERE contact_id = ?`, params);
  return true;
};

const deleteEmergencyContact = async (id) => {
  const result = await query('DELETE FROM emergency_contacts WHERE contact_id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getEmergencyContacts,
  getContactById,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
};
