const { query, withTransaction } = require('../config/db');

const getComplaints = async ({ studentId, assignedTo, status, complaintType, search, page = 1, limit = 10 }) => {
  const offset = (Number(page) - 1) * Number(limit);
  const whereClauses = [];
  const params = [];

  if (studentId) {
    whereClauses.push('c.student_id = ?');
    params.push(studentId);
  }

  if (assignedTo) {
    whereClauses.push('c.assigned_to = ?');
    params.push(assignedTo);
  }

  if (status && status !== 'All') {
    whereClauses.push('c.status = ?');
    params.push(status);
  }

  if (complaintType && complaintType !== 'All') {
    whereClauses.push('c.complaint_type = ?');
    params.push(complaintType);
  }

  if (search) {
    whereClauses.push('(c.title LIKE ? OR c.description LIKE ? OR c.location LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM complaints c ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  const sql = `
    SELECT 
      c.complaint_id,
      c.student_id,
      c.complaint_type,
      c.title,
      c.description,
      c.location,
      c.attachment_url,
      c.status,
      c.assigned_to,
      c.admin_remarks,
      c.created_at,
      c.updated_at,
      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,
      staff.full_name AS assigned_to_name
    FROM complaints c
    JOIN users u ON c.student_id = u.user_id
    LEFT JOIN users staff ON c.assigned_to = staff.user_id
    ${whereSql}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const complaints = await query(sql, [...params, Number(limit), Number(offset)]);

  return {
    complaints,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

const getComplaintById = async (id) => {
  const sql = `
    SELECT 
      c.complaint_id,
      c.student_id,
      c.complaint_type,
      c.title,
      c.description,
      c.location,
      c.attachment_url,
      c.status,
      c.assigned_to,
      c.admin_remarks,
      c.created_at,
      c.updated_at,
      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,
      staff.full_name AS assigned_to_name
    FROM complaints c
    JOIN users u ON c.student_id = u.user_id
    LEFT JOIN users staff ON c.assigned_to = staff.user_id
    WHERE c.complaint_id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

const getComplaintHistory = async (complaintId) => {
  const sql = `
    SELECT 
      h.history_id,
      h.complaint_id,
      h.changed_by,
      h.old_status,
      h.new_status,
      h.remarks,
      h.created_at,
      u.full_name AS changed_by_name,
      u.role AS changed_by_role
    FROM complaint_history h
    JOIN users u ON h.changed_by = u.user_id
    WHERE h.complaint_id = ?
    ORDER BY h.created_at ASC
  `;
  return query(sql, [complaintId]);
};

const createComplaint = async ({ studentId, complaintType, title, description, location, attachmentUrl = null }) => {
  const result = await query(
    `INSERT INTO complaints (student_id, complaint_type, title, description, location, attachment_url, status)
     VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
    [studentId, complaintType, title, description, location, attachmentUrl]
  );
  return result.insertId;
};

const assignComplaint = async (complaintId, assignedToUserId, changedByUserId, remarks = 'Assigned for investigation.') => {
  return withTransaction(async (conn) => {
    const [rows] = await conn.execute('SELECT status FROM complaints WHERE complaint_id = ? FOR UPDATE', [complaintId]);
    if (!rows.length) return false;
    const oldStatus = rows[0].status;

    const newStatus = oldStatus === 'Open' ? 'In Progress' : oldStatus;

    await conn.execute(
      'UPDATE complaints SET assigned_to = ?, status = ?, admin_remarks = ? WHERE complaint_id = ?',
      [assignedToUserId, newStatus, remarks, complaintId]
    );

    await conn.execute(
      'INSERT INTO complaint_history (complaint_id, changed_by, old_status, new_status, remarks) VALUES (?, ?, ?, ?, ?)',
      [complaintId, changedByUserId, oldStatus, newStatus, remarks]
    );

    return true;
  });
};

const updateStatusWithHistory = async (complaintId, newStatus, changedByUserId, remarks) => {
  return withTransaction(async (conn) => {
    const [rows] = await conn.execute('SELECT status FROM complaints WHERE complaint_id = ? FOR UPDATE', [complaintId]);
    if (!rows.length) return false;
    const oldStatus = rows[0].status;

    await conn.execute(
      'UPDATE complaints SET status = ?, admin_remarks = ? WHERE complaint_id = ?',
      [newStatus, remarks, complaintId]
    );

    await conn.execute(
      'INSERT INTO complaint_history (complaint_id, changed_by, old_status, new_status, remarks) VALUES (?, ?, ?, ?, ?)',
      [complaintId, changedByUserId, oldStatus, newStatus, remarks]
    );

    return true;
  });
};

const deleteComplaint = async (id) => {
  const result = await query('DELETE FROM complaints WHERE complaint_id = ?', [id]);
  return result.affectedRows > 0;
};

const getStaffMembers = async () => {
  const sql = `
    SELECT u.user_id, u.full_name, u.email, u.role, s.role_title
    FROM users u
    LEFT JOIN staff s ON u.user_id = s.user_id
    WHERE u.role IN ('Staff', 'Admin') AND u.is_active = 1
    ORDER BY u.full_name ASC
  `;
  return query(sql);
};

module.exports = {
  getComplaints,
  getComplaintById,
  getComplaintHistory,
  createComplaint,
  assignComplaint,
  updateStatusWithHistory,
  deleteComplaint,
  getStaffMembers
};
