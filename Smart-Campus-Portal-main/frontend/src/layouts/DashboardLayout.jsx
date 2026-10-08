import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Gauge,
  Tickets,
  UserRoundSearch,
  BookUser,
  Store,
  ShieldAlert,
  Bell,
  Map,
  Cog,
  Info,
  Menu,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';
import Sidebar, { SidebarItem } from '../Components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const navigationByRole = {
  Student: [
    { text: 'Dashboard', icon: <Gauge size={19} />, to: '/dashboard' },
    { text: 'Events', icon: <Tickets size={19} />, to: '/events' },
    { text: 'Lost & Found', icon: <UserRoundSearch size={19} />, to: '/lost-found' },
    { text: 'Faculty Directory', icon: <BookUser size={19} />, to: '/faculty-directory' },
    { text: 'Marketplace', icon: <Store size={19} />, to: '/marketplace' },
    { text: 'Complaints', icon: <ShieldAlert size={19} />, to: '/complaints' },
    { text: 'Emergency Contacts', icon: <Bell size={19} />, to: '/emergency-contacts' },
    { text: 'Campus Map', icon: <Map size={19} />, to: '/campus-map' }
  ],
  Faculty: [
    { text: 'Dashboard', icon: <Gauge size={19} />, to: '/dashboard' },
    { text: 'Events', icon: <Tickets size={19} />, to: '/events' },
    { text: 'Lost & Found', icon: <UserRoundSearch size={19} />, to: '/lost-found' },
    { text: 'Faculty Directory', icon: <BookUser size={19} />, to: '/faculty-directory' },
    { text: 'Marketplace', icon: <Store size={19} />, to: '/marketplace' },
    { text: 'Complaints', icon: <ShieldAlert size={19} />, to: '/complaints' },
    { text: 'Emergency Contacts', icon: <Bell size={19} />, to: '/emergency-contacts' },
    { text: 'Campus Map', icon: <Map size={19} />, to: '/campus-map' }
  ],
  Staff: [
    { text: 'Dashboard', icon: <Gauge size={19} />, to: '/dashboard' },
    { text: 'Events', icon: <Tickets size={19} />, to: '/events' },
    { text: 'Lost & Found', icon: <UserRoundSearch size={19} />, to: '/lost-found' },
    { text: 'Faculty Directory', icon: <BookUser size={19} />, to: '/faculty-directory' },
    { text: 'Marketplace', icon: <Store size={19} />, to: '/marketplace' },
    { text: 'Complaints', icon: <ShieldAlert size={19} />, to: '/complaints' },
    { text: 'Emergency Contacts', icon: <Bell size={19} />, to: '/emergency-contacts' },
    { text: 'Campus Map', icon: <Map size={19} />, to: '/campus-map' }
  ],
  Admin: [
    { text: 'Dashboard', icon: <Gauge size={19} />, to: '/dashboard' },
    { text: 'Events', icon: <Tickets size={19} />, to: '/events' },
    { text: 'Lost & Found', icon: <UserRoundSearch size={19} />, to: '/lost-found' },
    { text: 'Faculty Directory', icon: <BookUser size={19} />, to: '/faculty-directory' },
    { text: 'Marketplace', icon: <Store size={19} />, to: '/marketplace' },
    { text: 'Complaints', icon: <ShieldAlert size={19} />, to: '/complaints' },
    { text: 'Emergency Contacts', icon: <Bell size={19} />, to: '/emergency-contacts' },
    { text: 'Campus Map', icon: <Map size={19} />, to: '/campus-map' },
    { text: 'Admin Panel', icon: <ShieldCheck size={19} />, to: '/admin' }
  ]
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userRole = user?.role || 'Student';
  const navItems = navigationByRole[userRole] || navigationByRole.Student;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-900/30 text-red-300 border-red-800';
      case 'Faculty':
        return 'bg-blue-900/30 text-blue-300 border-blue-800';
      case 'Staff':
        return 'bg-purple-900/30 text-purple-300 border-purple-800';
      default:
        return 'bg-yellow-300/20 text-yellow-300 border-yellow-400/40';
    }
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-carbon-black font-poppins text-gray-100">
      {/* Sidebar with single config object driven by role */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        bottomItems={
          <>
            <SidebarItem
              icon={<Cog size={19} />}
              text="Settings"
              to="/settings"
            />
            <SidebarItem
              icon={<Info size={19} />}
              text="Help"
              to="/help"
            />
          </>
        }
      >
        {navItems.map((item) => (
          <SidebarItem
            key={item.to}
            icon={item.icon}
            text={item.text}
            to={item.to}
            active={location.pathname === item.to}
          />
        ))}
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-carbon-black-400 border-b border-gray-800 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Smart Campus Portal</span>
              <span className="text-gray-600">/</span>
              <span className="text-xs font-semibold text-yellow-300 capitalize">{userRole} Space</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(userRole)}`}>
              {userRole}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-200">
              <div className="w-8 h-8 rounded-full bg-carbon-black-100 border border-yellow-400/40 flex items-center justify-center text-yellow-300 text-xs font-bold">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              <span className="hidden sm:inline font-medium text-xs text-gray-200">{user?.full_name || 'User'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-red-400 hover:bg-red-950/20 border border-gray-700 transition cursor-pointer"
              title="Sign out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Shell */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-carbon-black p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
