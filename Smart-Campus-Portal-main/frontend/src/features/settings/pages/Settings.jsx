import DashboardLayout from '../../../layouts/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { Cog, User, Shield, Bell } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-yellow-300/10 border border-yellow-300/20">
              <Cog size={20} className="text-yellow-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Settings</h1>
              <p className="text-xs text-gray-400">Manage your account preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-yellow-300" />
            <h2 className="text-sm font-bold text-white">Profile Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-xs text-gray-400">Full Name</span>
              <span className="text-xs font-medium text-gray-200">{user?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-xs text-gray-400">Email</span>
              <span className="text-xs font-medium text-gray-200">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-xs text-gray-400">Role</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                {user?.role || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-400">Phone</span>
              <span className="text-xs font-medium text-gray-200">{user?.phone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-yellow-300" />
            <h2 className="text-sm font-bold text-white">Preferences</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div>
                <p className="text-xs font-medium text-gray-200">Email Notifications</p>
                <p className="text-[11px] text-gray-500">Receive updates about campus events</p>
              </div>
              <div className="w-9 h-5 bg-yellow-300/30 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-yellow-300 rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-xs font-medium text-gray-200">Dark Mode</p>
                <p className="text-[11px] text-gray-500">Interface theme preference</p>
              </div>
              <div className="w-9 h-5 bg-yellow-300/30 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-yellow-300 rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-yellow-300" />
            <h2 className="text-sm font-bold text-white">Security</h2>
          </div>
          <p className="text-xs text-gray-400">
            Password management and two-factor authentication settings will be available in a future update.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
