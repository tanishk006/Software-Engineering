import DashboardLayout from '../../../layouts/DashboardLayout';
import { Info, BookOpen, MessageCircle, ExternalLink } from 'lucide-react';

export default function Help() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-yellow-300/10 border border-yellow-300/20">
              <Info size={20} className="text-yellow-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Help & Support</h1>
              <p className="text-xs text-gray-400">Get help with the Smart Campus Portal</p>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-yellow-300" />
            <h2 className="text-sm font-bold text-white">Quick Start Guide</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-carbon-black-100/50 rounded-xl">
              <p className="text-xs font-semibold text-gray-200 mb-1">📋 Dashboard</p>
              <p className="text-[11px] text-gray-400">View your personalized stats, upcoming events, and recent activity at a glance.</p>
            </div>
            <div className="p-3 bg-carbon-black-100/50 rounded-xl">
              <p className="text-xs font-semibold text-gray-200 mb-1">🎫 Events</p>
              <p className="text-[11px] text-gray-400">Browse campus events, register for activities, and track your RSVPs.</p>
            </div>
            <div className="p-3 bg-carbon-black-100/50 rounded-xl">
              <p className="text-xs font-semibold text-gray-200 mb-1">🔍 Lost & Found</p>
              <p className="text-[11px] text-gray-400">Report lost items or log found items to help reunite them with their owners.</p>
            </div>
            <div className="p-3 bg-carbon-black-100/50 rounded-xl">
              <p className="text-xs font-semibold text-gray-200 mb-1">🏪 Marketplace</p>
              <p className="text-[11px] text-gray-400">Buy and sell items within the campus community — textbooks, electronics, and more.</p>
            </div>
            <div className="p-3 bg-carbon-black-100/50 rounded-xl">
              <p className="text-xs font-semibold text-gray-200 mb-1">⚠️ Complaints</p>
              <p className="text-[11px] text-gray-400">File maintenance or service complaints and track their resolution status.</p>
            </div>
            <div className="p-3 bg-carbon-black-100/50 rounded-xl">
              <p className="text-xs font-semibold text-gray-200 mb-1">📞 Emergency Contacts</p>
              <p className="text-[11px] text-gray-400">Access critical campus emergency numbers and departmental contacts.</p>
            </div>
            <div className="p-3 bg-carbon-black-100/50 rounded-xl">
              <p className="text-xs font-semibold text-gray-200 mb-1">🗺️ Campus Map</p>
              <p className="text-[11px] text-gray-400">Locate buildings, facilities, and key points of interest across campus.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-yellow-300" />
            <h2 className="text-sm font-bold text-white">Contact Support</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-xs text-gray-400">IT Help Desk</span>
              <span className="text-xs font-medium text-yellow-300">helpdesk@campus.edu</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-xs text-gray-400">Portal Admin</span>
              <span className="text-xs font-medium text-yellow-300">admin@campus.edu</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-400">Working Hours</span>
              <span className="text-xs font-medium text-gray-200">Mon – Fri, 9 AM – 5 PM</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink size={16} className="text-yellow-300" />
            <h2 className="text-sm font-bold text-white">About</h2>
          </div>
          <p className="text-xs text-gray-400">
            Smart Campus Portal v1.1 — A centralized platform for campus management, built with React and Express.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
