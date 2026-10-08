import { useState, useEffect } from 'react';
import {
  Bell,
  Phone,
  Mail,
  Shield,
  HeartPulse,
  Flame,
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Clock,
  Edit2,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
} from '../services/emergencyService';
import { useAuth } from '../../../context/AuthContext';

const CATEGORIES = ['All', 'Security', 'Medical', 'Fire', 'Helpline', 'Other'];

export default function EmergencyContacts() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    departmentName: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    category: 'Security',
    is24x7: true
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getEmergencyContacts({
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      setContacts(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load emergency contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [selectedCategory]);

  const handleOpenCreate = () => {
    setEditingContact(null);
    setForm({
      departmentName: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      category: 'Security',
      is24x7: true
    });
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setForm({
      departmentName: contact.department_name,
      contactPerson: contact.contact_person,
      phoneNumber: contact.phone_number,
      email: contact.email || '',
      category: contact.category,
      is24x7: Boolean(contact.is_24x7)
    });
    setModalError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.departmentName || !form.contactPerson || !form.phoneNumber) {
      setModalError('Department name, contact person, and phone number are required.');
      return;
    }

    setModalLoading(true);
    setModalError('');
    try {
      if (editingContact) {
        await updateEmergencyContact(editingContact.contact_id, form);
      } else {
        await createEmergencyContact(form);
      }
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Failed to save emergency contact.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to remove this emergency contact?')) return;
    try {
      await deleteEmergencyContact(contactId);
      fetchContacts();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete emergency contact.');
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.department_name?.toLowerCase().includes(term) ||
      c.contact_person?.toLowerCase().includes(term) ||
      c.phone_number?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Security':
        return <Shield size={16} className="text-yellow-400" />;
      case 'Medical':
        return <HeartPulse size={16} className="text-emerald-400" />;
      case 'Fire':
        return <Flame size={16} className="text-rose-400" />;
      case 'Helpline':
        return <LifeBuoy size={16} className="text-sky-400" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Security':
        return 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30';
      case 'Medical':
        return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30';
      case 'Fire':
        return 'bg-rose-400/10 text-rose-300 border-rose-400/30';
      case 'Helpline':
        return 'bg-sky-400/10 text-sky-300 border-sky-400/30';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Emergency Contacts Directory</h1>
            <p className="text-xs text-gray-400 mt-1">
              Immediate direct-dial access to 24/7 campus security, medical triage, fire safety, and counseling cells.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Emergency Contact</span>
            </button>
          )}
        </div>

        {/* Priority SOS Callout Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="tel:+918023456701"
            className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/15 transition flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-400">Campus Security</span>
              <p className="text-sm font-bold text-white mt-0.5">Control Room Gate 1</p>
              <p className="text-xs font-mono text-yellow-300 mt-1 font-bold">+91 80 2345 6701</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center text-yellow-300 group-hover:scale-105 transition">
              <Phone size={18} />
            </div>
          </a>

          <a
            href="tel:+918023456702"
            className="p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 hover:bg-emerald-400/15 transition flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Health Clinic</span>
              <p className="text-sm font-bold text-white mt-0.5">24/7 Ambulance Bay</p>
              <p className="text-xs font-mono text-emerald-300 mt-1 font-bold">+91 80 2345 6702</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition">
              <HeartPulse size={18} />
            </div>
          </a>

          <a
            href="tel:+918023456703"
            className="p-4 rounded-2xl bg-rose-400/10 border border-rose-400/30 hover:bg-rose-400/15 transition flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Fire & Safety</span>
              <p className="text-sm font-bold text-white mt-0.5">Campus Response Team</p>
              <p className="text-xs font-mono text-rose-300 mt-1 font-bold">+91 80 2345 6703</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-400/20 flex items-center justify-center text-rose-300 group-hover:scale-105 transition">
              <Flame size={18} />
            </div>
          </a>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-carbon-black-400 border border-gray-800 p-3 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
              <Filter size={14} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-gray-200 outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-carbon-black text-white">
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 sm:max-w-xs relative">
            <input
              type="text"
              placeholder="Search desk, officer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-carbon-black-100 border border-gray-700 text-gray-200 text-xs px-3 py-2 pl-8 rounded-xl outline-none focus:border-yellow-400 transition"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Contact Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-3 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading directory...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-12 text-center">
            <Bell size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No emergency contacts found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No emergency contacts match your selected filter or keyword search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.contact_id}
                className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadgeClass(
                        contact.category
                      )}`}
                    >
                      {getCategoryIcon(contact.category)}
                      {contact.category}
                    </span>

                    {contact.is_24x7 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900">
                        <Clock size={11} /> 24x7 Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-medium">Standard Hours</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {contact.department_name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{contact.contact_person}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${contact.phone_number}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-yellow-300 hover:text-yellow-400 transition"
                    >
                      <Phone size={13} />
                      <span>{contact.phone_number}</span>
                    </a>

                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-gray-400 hover:text-yellow-300 transition"
                        title={contact.email}
                      >
                        <Mail size={15} />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`tel:${contact.phone_number}`}
                      className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition"
                    >
                      <Phone size={12} />
                      <span>Call Now</span>
                    </a>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(contact)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                          title="Edit Contact"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.contact_id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                          title="Delete Contact"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">
                  {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
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

              <form onSubmit={handleFormSubmit} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Department / Post *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ambulance Dispatch Center"
                    value={form.departmentName}
                    onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">In-Charge / Officer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Duty Medical Officer"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91..."
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

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
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Official Email Address</label>
                  <input
                    type="email"
                    placeholder="emergency@campus.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is24x7"
                    checked={form.is24x7}
                    onChange={(e) => setForm({ ...form, is24x7: e.target.checked })}
                    className="rounded bg-carbon-black-100 border-gray-700 text-yellow-300 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="is24x7" className="text-gray-300 font-medium cursor-pointer">
                    24x7 Emergency Service
                  </label>
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
                    {modalLoading ? 'Saving...' : editingContact ? 'Save Changes' : 'Create Entry'}
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
