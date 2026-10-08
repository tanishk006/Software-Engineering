const { query } = require('../config/db');

// Lost Items
const getLostItems = async ({ category, status, search, page = 1, limit = 10 }) => {
  const offset = (Number(page) - 1) * Number(limit);
  const whereClauses = [];
  const params = [];

  if (category && category !== 'All') {
    whereClauses.push('l.category = ?');
    params.push(category);
  }

  if (status && status !== 'All') {
    whereClauses.push('l.status = ?');
    params.push(status);
  }

  if (search) {
    whereClauses.push('(l.item_name LIKE ? OR l.description LIKE ? OR l.lost_location LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM lost_items l ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  const sql = `
    SELECT 
      l.lost_item_id,
      l.user_id,
      l.item_name,
      l.category,
      l.description,
      l.date_lost,
      l.lost_location,
      l.image_url,
      l.contact_phone,
      l.status,
      l.created_at,
      u.full_name AS reporter_name,
      u.email AS reporter_email
    FROM lost_items l
    JOIN users u ON l.user_id = u.user_id
    ${whereSql}
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const items = await query(sql, [...params, Number(limit), Number(offset)]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

const getLostItemById = async (id) => {
  const sql = `
    SELECT 
      l.lost_item_id,
      l.user_id,
      l.item_name,
      l.category,
      l.description,
      l.date_lost,
      l.lost_location,
      l.image_url,
      l.contact_phone,
      l.status,
      l.created_at,
      u.full_name AS reporter_name,
      u.email AS reporter_email
    FROM lost_items l
    JOIN users u ON l.user_id = u.user_id
    WHERE l.lost_item_id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

const createLostItem = async ({ userId, itemName, category, description, dateLost, lostLocation, imageUrl = null, contactPhone = null }) => {
  const result = await query(
    `INSERT INTO lost_items (user_id, item_name, category, description, date_lost, lost_location, image_url, contact_phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Reported')`,
    [userId, itemName, category, description, dateLost, lostLocation, imageUrl, contactPhone]
  );
  return result.insertId;
};

const updateLostStatus = async (id, status) => {
  const result = await query(
    'UPDATE lost_items SET status = ? WHERE lost_item_id = ?',
    [status, id]
  );
  return result.affectedRows > 0;
};

const deleteLostItem = async (id) => {
  const result = await query('DELETE FROM lost_items WHERE lost_item_id = ?', [id]);
  return result.affectedRows > 0;
};

// Found Items
const getFoundItems = async ({ category, status, search, page = 1, limit = 10 }) => {
  const offset = (Number(page) - 1) * Number(limit);
  const whereClauses = [];
  const params = [];

  if (category && category !== 'All') {
    whereClauses.push('f.category = ?');
    params.push(category);
  }

  if (status && status !== 'All') {
    whereClauses.push('f.status = ?');
    params.push(status);
  }

  if (search) {
    whereClauses.push('(f.item_name LIKE ? OR f.description LIKE ? OR f.found_location LIKE ? OR f.storage_location LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM found_items f ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  const sql = `
    SELECT 
      f.found_item_id,
      f.user_id,
      f.item_name,
      f.category,
      f.description,
      f.date_found,
      f.found_location,
      f.storage_location,
      f.image_url,
      f.status,
      f.claimed_by_name,
      f.created_at,
      u.full_name AS finder_name,
      u.email AS finder_email
    FROM found_items f
    JOIN users u ON f.user_id = u.user_id
    ${whereSql}
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const items = await query(sql, [...params, Number(limit), Number(offset)]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

const getFoundItemById = async (id) => {
  const sql = `
    SELECT 
      f.found_item_id,
      f.user_id,
      f.item_name,
      f.category,
      f.description,
      f.date_found,
      f.found_location,
      f.storage_location,
      f.image_url,
      f.status,
      f.claimed_by_name,
      f.created_at,
      u.full_name AS finder_name,
      u.email AS finder_email
    FROM found_items f
    JOIN users u ON f.user_id = u.user_id
    WHERE f.found_item_id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

const createFoundItem = async ({ userId, itemName, category, description, dateFound, foundLocation, storageLocation, imageUrl = null }) => {
  const result = await query(
    `INSERT INTO found_items (user_id, item_name, category, description, date_found, found_location, storage_location, image_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
    [userId, itemName, category, description, dateFound, foundLocation, storageLocation, imageUrl]
  );
  return result.insertId;
};

const updateFoundStatus = async (id, status, claimedByName = null) => {
  const result = await query(
    'UPDATE found_items SET status = ?, claimed_by_name = ? WHERE found_item_id = ?',
    [status, claimedByName, id]
  );
  return result.affectedRows > 0;
};

const deleteFoundItem = async (id) => {
  const result = await query('DELETE FROM found_items WHERE found_item_id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getLostItems,
  getLostItemById,
  createLostItem,
  updateLostStatus,
  deleteLostItem,
  getFoundItems,
  getFoundItemById,
  createFoundItem,
  updateFoundStatus,
  deleteFoundItem
};
