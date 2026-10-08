const { query } = require('../config/db');

const getDashboardStats = async (user) => {
  const today = new Date().toISOString().split('T')[0];

  const [eventsCount] = await query('SELECT COUNT(*) as count FROM events WHERE event_date >= ?', [today]);
  const [complaintsCount] = await query('SELECT COUNT(*) as count FROM complaints WHERE status IN ("Open", "In Progress")');
  const [lostCount] = await query('SELECT COUNT(*) as count FROM lost_items WHERE status = "Reported"');
  const [foundCount] = await query('SELECT COUNT(*) as count FROM found_items WHERE status = "Available"');
  const [marketplaceCount] = await query('SELECT COUNT(*) as count FROM marketplace WHERE status = "Available"');
  const [facultyCount] = await query('SELECT COUNT(*) as count FROM faculty');

  const stats = {
    upcomingEvents: eventsCount?.count || 0,
    openComplaints: complaintsCount?.count || 0,
    activeLostItems: lostCount?.count || 0,
    activeFoundItems: foundCount?.count || 0,
    availableMarketListings: marketplaceCount?.count || 0,
    facultyMembers: facultyCount?.count || 0
  };

  // Role-specific stats
  if (user.role === 'Student') {
    const [myComplaints] = await query('SELECT COUNT(*) as count FROM complaints WHERE student_id = ?', [user.user_id]);
    const [myRegistrations] = await query('SELECT COUNT(*) as count FROM event_registrations WHERE user_id = ?', [user.user_id]);
    const [myListings] = await query('SELECT COUNT(*) as count FROM marketplace WHERE seller_id = ?', [user.user_id]);
    const [myLost] = await query('SELECT COUNT(*) as count FROM lost_items WHERE user_id = ?', [user.user_id]);

    stats.myComplaintsCount = myComplaints?.count || 0;
    stats.myEventRegistrations = myRegistrations?.count || 0;
    stats.myMarketListings = myListings?.count || 0;
    stats.myLostReports = myLost?.count || 0;
  } else if (user.role === 'Faculty') {
    const [myOrganizedEvents] = await query('SELECT COUNT(*) as count FROM events WHERE organizer_id = ?', [user.user_id]);
    stats.myOrganizedEvents = myOrganizedEvents?.count || 0;
  } else if (user.role === 'Staff') {
    const [assignedComplaints] = await query('SELECT COUNT(*) as count FROM complaints WHERE assigned_to = ? AND status IN ("Open", "In Progress")', [user.user_id]);
    stats.assignedComplaintsCount = assignedComplaints?.count || 0;
  } else if (user.role === 'Admin') {
    const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');
    const [totalStudents] = await query('SELECT COUNT(*) as count FROM students');
    stats.totalUsersCount = totalUsers?.count || 0;
    stats.totalStudentsCount = totalStudents?.count || 0;
  }

  // Recent upcoming events for dashboard widget
  const upcomingEvents = await query(
    `SELECT e.event_id, e.title, e.category, e.event_date, e.event_time, e.venue 
     FROM events e 
     WHERE e.event_date >= ? 
     ORDER BY e.event_date ASC, e.event_time ASC 
     LIMIT 4`,
    [today]
  );

  // Recent tickets / complaints for widget
  let recentComplaints = [];
  if (user.role === 'Student') {
    recentComplaints = await query(
      `SELECT c.complaint_id, c.title, c.complaint_type, c.status, c.created_at 
       FROM complaints c 
       WHERE c.student_id = ? 
       ORDER BY c.created_at DESC 
       LIMIT 4`,
      [user.user_id]
    );
  } else {
    recentComplaints = await query(
      `SELECT c.complaint_id, c.title, c.complaint_type, c.status, c.created_at, u.full_name AS student_name 
       FROM complaints c 
       JOIN users u ON c.student_id = u.user_id 
       ORDER BY c.created_at DESC 
       LIMIT 4`
    );
  }

  return {
    stats,
    upcomingEvents,
    recentComplaints
  };
};

module.exports = {
  getDashboardStats
};
