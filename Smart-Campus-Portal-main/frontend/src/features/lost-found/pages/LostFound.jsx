import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  CheckCircle,
  Trash2,
  MapPin,
  Calendar,
  Phone,
  X,
  AlertCircle,
  HelpCircle,
  Tag
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
  getLostItems,
  getFoundItems,
  reportLostItem,
  reportFoundItem,
  updateLostStatus,
  updateFoundStatus,
  deleteLostItem,
  deleteFoundItem
} from '../services/lostFoundService';
import { useAuth } from '../../../context/AuthContext';

const CATEGORIES = [
  'All',
  'Electronics',
  'Personal Items',
  'Documents',
  'Accessories',
  'Stationery',
  'Keys',
  'Other'
];

export default function LostFound() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Selected item for detail inspection
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    itemName: '',
    category: 'Electronics',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    storageLocation: 'Main Campus Security Desk (Gate 1)',
    contactPhone: user?.phone || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        category: category !== 'All' ? category : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search || undefined,
        page,
        limit: 9
      };

      let res;
      if (activeTab === 'lost') {
        res = await getLostItems(params);
      } else {
        res = await getFoundItems(params);
      }

      setItems(res.data || []);
      setPagination(res.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab, category, statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleOpenModal = () => {
    setForm({
      itemName: '',
      category: 'Electronics',
      description: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      storageLocation: 'Main Campus Security Desk (Gate 1)',
      contactPhone: user?.phone || ''
    });
    setSelectedFile(null);
    setModalError('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.category || !form.description || !form.date || !form.location) {
      setModalError('Please fill in all mandatory fields.');
      return;
    }

    const formData = new FormData();
    formData.append('itemName', form.itemName);
    formData.append('category', form.category);
    formData.append('description', form.description);
    if (selectedFile) formData.append('image', selectedFile);

    setModalLoading(true);
    setModalError('');
    try {
      if (activeTab === 'lost') {
        formData.append('dateLost', form.date);
        formData.append('lostLocation', form.location);
        if (form.contactPhone) formData.append('contactPhone', form.contactPhone);
        await reportLostItem(formData);
      } else {
        formData.append('dateFound', form.date);
        formData.append('foundLocation', form.location);
        formData.append('storageLocation', form.storageLocation);
        await reportFoundItem(formData);
      }
      setShowReportModal(false);
      fetchItems();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Error submitting report.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleMarkStatus = async (item, newStatus) => {
    try {
      if (activeTab === 'lost') {
        await updateLostStatus(item.lost_item_id, newStatus);
      } else {
        const claimer = newStatus === 'Claimed' ? prompt('Enter name of student/faculty claiming this item:') : null;
        await updateFoundStatus(item.found_item_id, newStatus, claimer);
      }
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      if (activeTab === 'lost') {
        await deleteLostItem(item.lost_item_id);
      } else {
        await deleteFoundItem(item.found_item_id);
      }
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete record.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Lost & Found Registry</h1>
            <p className="text-xs text-gray-400 mt-1">
              Centralized custody and reporting registry for misplaced campus belongings.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>Report {activeTab === 'lost' ? 'Lost Item' : 'Found Item'}</span>
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-carbon-black-400 border border-gray-800 p-3 rounded-2xl">
          {/* Tabs */}
          <div className="flex bg-carbon-black-100 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => { setActiveTab('lost'); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'lost'
                  ? 'bg-yellow-300 text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => { setActiveTab('found'); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'found'
                  ? 'bg-yellow-300 text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Found Items
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
              <Filter size={14} className="text-gray-400" />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="bg-transparent text-gray-200 outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-carbon-black text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent text-gray-200 outline-none cursor-pointer"
              >
                <option value="All" className="bg-carbon-black text-white">All Statuses</option>
                {activeTab === 'lost' ? (
                  <>
                    <option value="Reported" className="bg-carbon-black text-white">Reported</option>
                    <option value="Resolved" className="bg-carbon-black text-white">Resolved</option>
                  </>
                ) : (
                  <>
                    <option value="Available" className="bg-carbon-black text-white">Available</option>
                    <option value="Claimed" className="bg-carbon-black text-white">Claimed</option>
                    <option value="Resolved" className="bg-carbon-black text-white">Resolved</option>
                  </>
                )}
              </select>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex-1 sm:w-56 relative">
              <input
                type="text"
                placeholder="Search items, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-carbon-black-100 border border-gray-700 text-gray-200 text-xs px-3 py-2 pl-8 rounded-xl outline-none focus:border-yellow-400 transition"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </form>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Items Listing */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-3 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading registry items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-12 text-center">
            <HelpCircle size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No {activeTab} items recorded</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No matching records found for the selected category or keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const isOwner = user?.user_id === item.user_id || user?.role === 'Admin';
              const isLost = activeTab === 'lost';
              const isResolved = item.status === 'Resolved' || item.status === 'Claimed';

              return (
                <div
                  key={isLost ? item.lost_item_id : item.found_item_id}
                  className="bg-carbon-black-400 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-700 transition"
                >
                  {item.image_url && (
                    <div className="h-40 w-full overflow-hidden bg-gray-900 border-b border-gray-800">
                      <img
                        src={item.image_url.startsWith('http') ? item.image_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${item.image_url}`}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                          {item.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            isResolved
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                              : 'bg-yellow-950/40 text-yellow-300 border-yellow-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedItem(item)}
                        className="text-base font-bold text-white hover:text-yellow-300 transition cursor-pointer"
                      >
                        {item.item_name}
                      </h3>

                      <p className="text-xs text-gray-400 line-clamp-3 mt-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-1.5 text-xs text-gray-300">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={14} className="text-yellow-300 flex-shrink-0" />
                        <span>{isLost ? `Lost: ${item.date_lost}` : `Found: ${item.date_found}`}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="truncate">
                          {isLost ? item.lost_location : item.found_location}
                        </span>
                      </div>

                      {!isLost && item.storage_location && (
                        <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                          <Tag size={13} className="text-gray-500 flex-shrink-0" />
                          <span className="truncate">Held at: {item.storage_location}</span>
                        </div>
                      )}

                      {isLost && item.contact_phone && (
                        <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                          <Phone size={13} className="text-gray-500 flex-shrink-0" />
                          <span>Contact: {item.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="bg-carbon-black-100 px-5 py-3 border-t border-gray-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isOwner && !isResolved && (
                        <button
                          onClick={() => handleMarkStatus(item, 'Resolved')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <CheckCircle size={13} />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      {isOwner && (
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                          title="Delete report"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-xs text-yellow-300 hover:underline font-medium cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-carbon-black-400 border border-gray-800 text-xs text-gray-300 rounded-lg hover:border-gray-700 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 bg-carbon-black-400 border border-gray-800 text-xs text-gray-300 rounded-lg hover:border-gray-700 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                    {selectedItem.category}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedItem.item_name}</h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedItem.image_url && (
                <div className="h-48 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                  <img
                    src={selectedItem.image_url.startsWith('http') ? selectedItem.image_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${selectedItem.image_url}`}
                    alt={selectedItem.item_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="bg-carbon-black-100 p-3.5 rounded-xl border border-gray-800 space-y-2 text-xs">
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span className="font-semibold text-white">{selectedItem.status}</span>
                </div>
                <div>
                  <span className="text-gray-400">Date: </span>
                  <span className="text-gray-200">{selectedItem.date_lost || selectedItem.date_found}</span>
                </div>
                <div>
                  <span className="text-gray-400">Location: </span>
                  <span className="text-gray-200">{selectedItem.lost_location || selectedItem.found_location}</span>
                </div>
                {selectedItem.storage_location && (
                  <div>
                    <span className="text-gray-400">Custody Desk: </span>
                    <span className="text-gray-200">{selectedItem.storage_location}</span>
                  </div>
                )}
                {selectedItem.claimed_by_name && (
                  <div>
                    <span className="text-gray-400">Claimed By: </span>
                    <span className="text-emerald-400 font-semibold">{selectedItem.claimed_by_name}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Reported By: </span>
                  <span className="text-gray-200">{selectedItem.reporter_name || selectedItem.finder_name}</span>
                </div>
                {selectedItem.contact_phone && (
                  <div>
                    <span className="text-gray-400">Contact Phone: </span>
                    <span className="text-yellow-300">{selectedItem.contact_phone}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Description</h4>
                <p className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">{selectedItem.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">
                  Report {activeTab === 'lost' ? 'Lost Item' : 'Found Item'}
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="mt-3 p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSubmitReport} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Casio Scientific Calculator fx-991"
                    value={form.itemName}
                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">
                    {activeTab === 'lost' ? 'Last Seen Location *' : 'Found Location *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Library 2nd Floor Reading Section"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                {activeTab === 'found' ? (
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Current Custody Desk *</label>
                    <input
                      type="text"
                      required
                      value={form.storageLocation}
                      onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                      placeholder="e.g. Security Post Gate 1"
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      placeholder="+91..."
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Specify physical appearance, color, brand, markings..."
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Item Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 cursor-pointer"
                  />
                  {selectedFile && (
                    <span className="text-[11px] text-yellow-300 mt-1 block">Selected: {selectedFile.name}</span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
