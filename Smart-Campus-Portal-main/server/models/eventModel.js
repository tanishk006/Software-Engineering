const { query } = require('../config/db');

const getEvents = async ({ timeframe, category, search, page = 1, limit = 10, currentUserId = null }) => {
  const offset = (Number(page) - 1) * Number(limit);
  const whereClauses = [];
  const params = [];

  const today = new Date().toISOString().split('T')[0];

  if (timeframe === 'upcoming') {
    whereClauses.push('e.event_date >= ?');
    params.push(today);
  } else if (timeframe === 'past') {
    whereClauses.push('e.event_date < ?');
    params.push(today);
  }

  if (category && category !== 'All') {
    whereClauses.push('e.category = ?');
    params.push(category);
  }

  if (search) {
    whereClauses.push('(e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) AS total FROM events e ${whereSql}`,
    params
  );
  const total = countResult[0]?.total || 0;

  // Query events with organizer info and RSVP state
  const sql = `
    SELECT 
      e.event_id,
      e.title,
      e.description,
      e.category,
      e.event_date,
      e.event_time,
      e.venue,
      e.organizer_id,
      e.registration_link,
      e.max_seats,
      e.image_url,
      e.created_at,
      u.full_name AS organizer_name,
      u.email AS organizer_email,
      (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id) AS registration_count,
      ${currentUserId ? '(SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.user_id = ?) > 0 AS is_registered' : '0 AS is_registered'}
    FROM events e
    JOIN users u ON e.organizer_id = u.user_id
    ${whereSql}
    ORDER BY e.event_date ASC, e.event_time ASC
    LIMIT ? OFFSET ?
  `;

  const queryParams = currentUserId
    ? [currentUserId, ...params, Number(limit), Number(offset)]
    : [...params, Number(limit), Number(offset)];

  const events = await query(sql, queryParams);

  return {
    events,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

const getEventById = async (eventId, currentUserId = null) => {
  const sql = `
    SELECT 
      e.event_id,
      e.title,
      e.description,
      e.category,
      e.event_date,
      e.event_time,
      e.venue,
      e.organizer_id,
      e.registration_link,
      e.max_seats,
      e.image_url,
      e.created_at,
      u.full_name AS organizer_name,
      u.email AS organizer_email,
      (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id) AS registration_count,
      ${currentUserId ? '(SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.user_id = ?) > 0 AS is_registered' : '0 AS is_registered'}
    FROM events e
    JOIN users u ON e.organizer_id = u.user_id
    WHERE e.event_id = ?
    LIMIT 1
  `;

  const params = currentUserId ? [currentUserId, eventId] : [eventId];
  const rows = await query(sql, params);
  return rows[0] || null;
};

const createEvent = async ({ title, description, category, eventDate, eventTime, venue, organizerId, registrationLink = null, maxSeats = null, imageUrl = null }) => {
  const result = await query(
    `INSERT INTO events (title, description, category, event_date, event_time, venue, organizer_id, registration_link, max_seats, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, category, eventDate, eventTime, venue, organizerId, registrationLink, maxSeats, imageUrl]
  );
  return result.insertId;
};

const updateEvent = async (eventId, { title, description, category, eventDate, eventTime, venue, registrationLink, maxSeats, imageUrl }) => {
  const updates = [];
  const params = [];

  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (eventDate !== undefined) { updates.push('event_date = ?'); params.push(eventDate); }
  if (eventTime !== undefined) { updates.push('event_time = ?'); params.push(eventTime); }
  if (venue !== undefined) { updates.push('venue = ?'); params.push(venue); }
  if (registrationLink !== undefined) { updates.push('registration_link = ?'); params.push(registrationLink); }
  if (maxSeats !== undefined) { updates.push('max_seats = ?'); params.push(maxSeats); }
  if (imageUrl !== undefined) { updates.push('image_url = ?'); params.push(imageUrl); }

  if (!updates.length) return false;

  params.push(eventId);
  await query(`UPDATE events SET ${updates.join(', ')} WHERE event_id = ?`, params);
  return true;
};

const deleteEvent = async (eventId) => {
  const result = await query('DELETE FROM events WHERE event_id = ?', [eventId]);
  return result.affectedRows > 0;
};

const registerForEvent = async (eventId, userId) => {
  const result = await query(
    'INSERT IGNORE INTO event_registrations (event_id, user_id) VALUES (?, ?)',
    [eventId, userId]
  );
  return result.affectedRows > 0;
};

const unregisterFromEvent = async (eventId, userId) => {
  const result = await query(
    'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?',
    [eventId, userId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
};
