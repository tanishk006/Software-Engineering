const { query } = require('../config/db');

const getMarketplaceItems = async ({ category, status = 'Available', search, minPrice, maxPrice, page = 1, limit = 9 }) => {
  const offset = (Number(page) - 1) * Number(limit);
  const whereClauses = [];
  const params = [];

  if (category && category !== 'All') {
    whereClauses.push('m.category = ?');
    params.push(category);
  }

  if (status && status !== 'All') {
    whereClauses.push('m.status = ?');
    params.push(status);
  }

  if (minPrice !== undefined && minPrice !== '') {
    whereClauses.push('m.price >= ?');
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== '') {
    whereClauses.push('m.price <= ?');
    params.push(Number(maxPrice));
  }

  if (search) {
    whereClauses.push('(m.product_name LIKE ? OR m.description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM marketplace m ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  const sql = `
    SELECT 
      m.product_id,
      m.seller_id,
      m.product_name,
      m.category,
      m.price,
      m.description,
      m.condition_type,
      m.image_url,
      m.contact_phone,
      m.status,
      m.created_at,
      u.full_name AS seller_name,
      u.email AS seller_email,
      u.role AS seller_role
    FROM marketplace m
    JOIN users u ON m.seller_id = u.user_id
    ${whereSql}
    ORDER BY m.created_at DESC
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

const getMarketplaceItemById = async (id) => {
  const sql = `
    SELECT 
      m.product_id,
      m.seller_id,
      m.product_name,
      m.category,
      m.price,
      m.description,
      m.condition_type,
      m.image_url,
      m.contact_phone,
      m.status,
      m.created_at,
      u.full_name AS seller_name,
      u.email AS seller_email,
      u.phone AS seller_user_phone
    FROM marketplace m
    JOIN users u ON m.seller_id = u.user_id
    WHERE m.product_id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

const createMarketplaceItem = async ({ sellerId, productName, category, price, description, conditionType = 'Good', imageUrl = null, contactPhone = null }) => {
  const result = await query(
    `INSERT INTO marketplace (seller_id, product_name, category, price, description, condition_type, image_url, contact_phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
    [sellerId, productName, category, price, description, conditionType, imageUrl, contactPhone]
  );
  return result.insertId;
};

const updateMarketplaceItem = async (id, { productName, category, price, description, conditionType, imageUrl, contactPhone }) => {
  const updates = [];
  const params = [];

  if (productName !== undefined) { updates.push('product_name = ?'); params.push(productName); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (price !== undefined) { updates.push('price = ?'); params.push(price); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (conditionType !== undefined) { updates.push('condition_type = ?'); params.push(conditionType); }
  if (imageUrl !== undefined) { updates.push('image_url = ?'); params.push(imageUrl); }
  if (contactPhone !== undefined) { updates.push('contact_phone = ?'); params.push(contactPhone); }

  if (!updates.length) return false;

  params.push(id);
  await query(`UPDATE marketplace SET ${updates.join(', ')} WHERE product_id = ?`, params);
  return true;
};

const updateMarketplaceStatus = async (id, status) => {
  const result = await query(
    'UPDATE marketplace SET status = ? WHERE product_id = ?',
    [status, id]
  );
  return result.affectedRows > 0;
};

const deleteMarketplaceItem = async (id) => {
  const result = await query('DELETE FROM marketplace WHERE product_id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getMarketplaceItems,
  getMarketplaceItemById,
  createMarketplaceItem,
  updateMarketplaceItem,
  updateMarketplaceStatus,
  deleteMarketplaceItem
};
