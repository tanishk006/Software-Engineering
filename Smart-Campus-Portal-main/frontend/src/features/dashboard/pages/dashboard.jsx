import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  AlertTriangle,
  Package,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatsCard from '../components/StatsCard';
import RecentTicket from '../components/RecentTicket';
import { getDashboardData } from '../services/dashboardService';
import { useAuth } from '../../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardData();
        setData(res.data);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = data?.stats || {};
  const upcomingEvents = data?.upcomingEvents || [];
  const recentComplaints = data?.recentComplaints || [];
  const userRole = user?.role || 'Student';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Welcome, {user?.full_name || 'Member'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
              {userRole}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Smart Campus Portal central management system. Live metrics as of today.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Upcoming Events"
            value={loading ? '...' : stats.upcomingEvents ?? 0}
            subtitle="Campus schedule"
            icon={Calendar}
            badge="Live"
          />

          <StatsCard
            title="Open Complaints"
            value={loading ? '...' : stats.openComplaints ?? 0}
            subtitle={userRole === 'Student' ? `You filed: ${stats.myComplaintsCount ?? 0}` : 'Active issues'}
            icon={AlertTriangle}
          />

          {userRole === 'Student' && (
            <>
              <StatsCard
                title="My Event RSVPs"
                value={loading ? '...' : stats.myEventRegistrations ?? 0}
                subtitle="Confirmed registrations"
                icon={CheckCircle2}
              />
              <StatsCard
                title="My Listings"
                value={loading ? '...' : stats.myMarketListings ?? 0}
                subtitle={`Total campus: ${stats.availableMarketListings ?? 0}`}
                icon={Package}
              />
            </>
          )}

          {userRole === 'Faculty' && (
            <>
              <StatsCard
                title="My Events"
                value={loading ? '...' : stats.myOrganizedEvents ?? 0}
                subtitle="Organized by you"
                icon={Clock}
              />
              <StatsCard
                title="Faculty Directory"
                value={loading ? '...' : stats.facultyMembers ?? 0}
                subtitle="Academic staff on record"
                icon={Users}
              />
            </>
          )}

          {userRole === 'Staff' && (
            <>
              <StatsCard
                title="Assigned to Me"
                value={loading ? '...' : stats.assignedComplaintsCount ?? 0}
                subtitle="Pending task resolution"
                icon={Clock}
              />
              <StatsCard
                title="Lost & Found"
                value={loading ? '...' : (stats.activeLostItems ?? 0) + (stats.activeFoundItems ?? 0)}
                subtitle="Active campus reports"
                icon={Search}
              />
            </>
          )}

          {userRole === 'Admin' && (
            <>
              <StatsCard
                title="Total Users"
                value={loading ? '...' : stats.totalUsersCount ?? 0}
                subtitle={`${stats.totalStudents ?? 0} students`}
                icon={Users}
              />
              <StatsCard
                title="Marketplace"
                value={loading ? '...' : stats.availableMarketListings ?? 0}
                subtitle="Active student items"
                icon={Package}
              />
            </>
          )}
        </div>

        {/* 2-Column Section: Upcoming Events and Recent Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events Column */}
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Upcoming Events</h2>
                <p className="text-[11px] text-gray-400">Scheduled campus activities</p>
              </div>
              <Link
                to="/events"
                className="text-xs text-yellow-300 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-gray-800 p-2 flex-1">
              {upcomingEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No upcoming events scheduled at this time.
                </div>
              ) : (
                upcomingEvents.map((evt) => (
                  <div key={evt.event_id} className="p-3 hover:bg-carbon-black-100/50 rounded-xl transition flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-200 truncate">{evt.title}</p>
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                        <span>{evt.event_date} at {evt.event_time?.slice(0, 5)}</span>
                        <span>•</span>
                        <span className="truncate">{evt.venue}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-yellow-300 text-[11px] font-medium border border-gray-700 flex-shrink-0">
                      {evt.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Complaints Column */}
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">
                  {userRole === 'Student' ? 'My Recent Complaints' : 'Recent Campus Complaints'}
                </h2>
                <p className="text-[11px] text-gray-400">Maintenance & service requests</p>
              </div>
              <Link
                to="/complaints"
                className="text-xs text-yellow-300 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="flex-1">
              <RecentTicket tickets={recentComplaints} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}