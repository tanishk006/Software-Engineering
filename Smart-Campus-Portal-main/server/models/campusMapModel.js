const { query } = require('../config/db');

const getCampusLocations = async (category) => {
  let sql = 'SELECT * FROM campus_locations';
  const params = [];

  if (category && category !== 'All') {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY name ASC';
  return query(sql, params);
};

const getLocationById = async (id) => {
  const rows = await query('SELECT * FROM campus_locations WHERE location_id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const createCampusLocation = async ({ name, category = 'Academic', latitude, longitude, description = null, buildingCode = null, openingHours = null }) => {
  const result = await query(
    `INSERT INTO campus_locations (name, category, latitude, longitude, description, building_code, opening_hours)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, latitude, longitude, description, buildingCode, openingHours]
  );
  return result.insertId;
};

const updateCampusLocation = async (id, { name, category, latitude, longitude, description, buildingCode, openingHours }) => {
  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (latitude !== undefined) { updates.push('latitude = ?'); params.push(latitude); }
  if (longitude !== undefined) { updates.push('longitude = ?'); params.push(longitude); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (buildingCode !== undefined) { updates.push('building_code = ?'); params.push(buildingCode); }
  if (openingHours !== undefined) { updates.push('opening_hours = ?'); params.push(openingHours); }

  if (!updates.length) return false;

  params.push(id);
  await query(`UPDATE campus_locations SET ${updates.join(', ')} WHERE location_id = ?`, params);
  return true;
};

const deleteCampusLocation = async (id) => {
  const result = await query('DELETE FROM campus_locations WHERE location_id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getCampusLocations,
  getLocationById,
  createCampusLocation,
  updateCampusLocation,
  deleteCampusLocation
};
