import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  ExternalLink,
  X,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvpEvent
} from '../services/eventService';
import { useAuth } from '../../../context/AuthContext';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Placement', 'Social'];

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Selected event for detail inspection
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    eventDate: '',
    eventTime: '',
    venue: '',
    registrationLink: '',
    maxSeats: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const canCreate = user?.role === 'Admin' || user?.role === 'Faculty';

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getEvents({
        timeframe,
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        page,
        limit: 9
      });
      setEvents(res.data || []);
      setPagination(res.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [timeframe, category, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setForm({
      title: '',
      description: '',
      category: 'Technical',
      eventDate: '',
      eventTime: '',
      venue: '',
      registrationLink: '',
      maxSeats: ''
    });
    setSelectedImage(null);
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (evt) => {
    setEditingEvent(evt);
    setForm({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      eventDate: evt.event_date,
      eventTime: evt.event_time ? evt.event_time.slice(0, 5) : '',
      venue: evt.venue,
      registrationLink: evt.registration_link || '',
      maxSeats: evt.max_seats || ''
    });
    setSelectedImage(null);
    setModalError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.eventDate || !form.eventTime || !form.venue) {
      setModalError('Please complete all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('eventDate', form.eventDate);
    formData.append('eventTime', form.eventTime);
    formData.append('venue', form.venue);
    if (form.registrationLink) formData.append('registrationLink', form.registrationLink);
    if (form.maxSeats) formData.append('maxSeats', form.maxSeats);
    if (selectedImage) formData.append('image', selectedImage);

    setModalLoading(true);
    setModalError('');
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.event_id, formData);
      } else {
        await createEvent(formData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Error saving event.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteEvent(eventId);
      fetchEvents();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete event.');
    }
  };

  const handleToggleRsvp = async (evt) => {
    try {
      if (evt.is_registered) {
        await cancelRsvpEvent(evt.event_id);
      } else {
        await rsvpEvent(evt.event_id);
      }
      fetchEvents();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update RSVP.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Campus Events</h1>
            <p className="text-xs text-gray-400 mt-1">
              Workshops, seminars, competitions, and placement sessions across departments.
            </p>
          </div>

          {canCreate && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Event</span>
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-carbon-black-400 border border-gray-800 p-3 rounded-2xl">
          {/* Timeframe Tabs */}
          <div className="flex bg-carbon-black-100 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => { setTimeframe('upcoming'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                timeframe === 'upcoming'
                  ? 'bg-yellow-300 text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => { setTimeframe('past'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                timeframe === 'past'
                  ? 'bg-yellow-300 text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => { setTimeframe('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-yellow-300 text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
          </div>

          {/* Category Dropdown and Search */}
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
                    {c} {c !== 'All' ? 'Events' : ''}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex-1 sm:w-60 relative">
              <input
                type="text"
                placeholder="Search events or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-carbon-black-100 border border-gray-700 text-gray-200 text-xs px-3 py-2 pl-8 rounded-xl outline-none focus:border-yellow-400 transition"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </form>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-3 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading scheduled events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-12 text-center">
            <Calendar size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No events found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              There are no {timeframe !== 'all' ? timeframe : ''} events matching your selected category or search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((evt) => {
              const isOwner = user?.user_id === evt.organizer_id || user?.role === 'Admin';
              return (
                <div
                  key={evt.event_id}
                  className="bg-carbon-black-400 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-700 transition"
                >
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                          {evt.category}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {evt.registration_count} registered
                          {evt.max_seats ? ` / ${evt.max_seats}` : ''}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedEvent(evt)}
                        className="text-base font-bold text-white hover:text-yellow-300 transition cursor-pointer"
                      >
                        {evt.title}
                      </h3>

                      <p className="text-xs text-gray-400 line-clamp-3 mt-2">
                        {evt.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-2 text-xs text-gray-300">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={14} className="text-yellow-300 flex-shrink-0" />
                        <span>{evt.event_date}</span>
                        <span className="text-gray-600">•</span>
                        <Clock size={14} className="text-yellow-300 flex-shrink-0" />
                        <span>{evt.event_time?.slice(0, 5)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                        <Users size={13} className="text-gray-500 flex-shrink-0" />
                        <span className="truncate">Organized by {evt.organizer_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="bg-carbon-black-100 px-5 py-3 border-t border-gray-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleRsvp(evt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        evt.is_registered
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/60'
                          : 'bg-yellow-300 hover:bg-yellow-400 text-black'
                      }`}
                    >
                      {evt.is_registered ? (
                        <>
                          <CheckCircle size={13} />
                          <span>Registered</span>
                        </>
                      ) : (
                        <span>RSVP / Register</span>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(evt)}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                            title="Edit Event"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.event_id)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                        title="View Details"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-carbon-black-400 border border-gray-800 text-xs rounded-lg disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-carbon-black-400 border border-gray-800 text-xs rounded-lg disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedEvent.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-carbon-black-100 p-3.5 rounded-xl border border-gray-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar size={14} className="text-yellow-300" />
                  <span>Date: {selectedEvent.event_date}</span>
                  <span className="text-gray-600">•</span>
                  <Clock size={14} className="text-yellow-300" />
                  <span>Time: {selectedEvent.event_time?.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={14} className="text-yellow-300" />
                  <span>Venue: {selectedEvent.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users size={14} className="text-gray-500" />
                  <span>Organizer: {selectedEvent.organizer_name} ({selectedEvent.organizer_email})</span>
                </div>
                {selectedEvent.registration_link && (
                  <div className="pt-2">
                    <a
                      href={selectedEvent.registration_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-yellow-300 underline flex items-center gap-1"
                    >
                      <span>Official Registration Link</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">About the Event</h4>
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{selectedEvent.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  onClick={() => handleToggleRsvp(selectedEvent)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedEvent.is_registered
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-yellow-300 text-black hover:bg-yellow-400'
                  }`}
                >
                  {selectedEvent.is_registered ? 'Cancel Registration' : 'Register for Event'}
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
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

              <form onSubmit={handleFormSubmit} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. National Technical Symposium 2026"
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
                    <label className="block text-gray-400 font-medium mb-1">Venue *</label>
                    <input
                      type="text"
                      required
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                      placeholder="e.g. Kalam Auditorium, 1st Floor"
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Event Time *</label>
                    <input
                      type="time"
                      required
                      value={form.eventTime}
                      onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Registration Link (Optional)</label>
                    <input
                      type="url"
                      value={form.registrationLink}
                      onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Max Seats (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxSeats}
                      onChange={(e) => setForm({ ...form, maxSeats: e.target.value })}
                      placeholder="e.g. 150"
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide event overview, schedule highlights, and prerequisites..."
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? 'Saving...' : editingEvent ? 'Save Changes' : 'Publish Event'}
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
