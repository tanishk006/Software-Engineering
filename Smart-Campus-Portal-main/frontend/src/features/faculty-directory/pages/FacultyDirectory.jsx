import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Clock,
  MapPin,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Building
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
  getFacultyList,
  getDepartments,
  createFaculty,
  updateFaculty,
  deleteFaculty
} from '../services/facultyService';
import { useAuth } from '../../../context/AuthContext';

export default function FacultyDirectory() {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Admin Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: 'Assistant Professor',
    cabinNumber: '',
    officeHours: '',
    qualification: ''
  });

  const isAdmin = user?.role === 'Admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [facRes, deptRes] = await Promise.all([
        getFacultyList({
          departmentId: selectedDept !== 'All' ? selectedDept : undefined,
          search: search || undefined,
          page,
          limit: 12
        }),
        getDepartments()
      ]);
      setFaculty(facRes.data || []);
      setPagination(facRes.pagination || { totalPages: 1, total: 0 });
      setDepartments(deptRes.data || []);
      if (!form.departmentId && deptRes.data?.length > 0) {
        setForm((prev) => ({ ...prev, departmentId: deptRes.data[0].department_id }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load faculty directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setForm({
      fullName: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.department_id || '1',
      designation: 'Assistant Professor',
      cabinNumber: '',
      officeHours: '',
      qualification: ''
    });
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditingFaculty(f);
    setForm({
      fullName: f.full_name,
      email: f.email,
      phone: f.phone || '',
      departmentId: f.department_id,
      designation: f.designation,
      cabinNumber: f.cabin_number,
      officeHours: f.office_hours || '',
      qualification: f.qualification || ''
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.designation || !form.cabinNumber || !form.departmentId) {
      setModalError('Please complete all required fields.');
      return;
    }

    setModalLoading(true);
    setModalError('');
    try {
      if (editingFaculty) {
        await updateFaculty(editingFaculty.faculty_id, form);
      } else {
        await createFaculty(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Error saving faculty member.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (facultyId) => {
    if (!window.confirm('Are you sure you want to remove this faculty record?')) return;
    try {
      await deleteFaculty(facultyId);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove faculty member.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Faculty Directory</h1>
            <p className="text-xs text-gray-400 mt-1">
              Academic personnel contact information, cabin locations, and designated office consultation hours.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Faculty Member</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-carbon-black-400 border border-gray-800 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
              className="bg-transparent text-gray-200 outline-none cursor-pointer"
            >
              <option value="All" className="bg-carbon-black text-white">All Academic Departments</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id} className="bg-carbon-black text-white">
                  {d.department_name} ({d.department_code})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 sm:max-w-xs relative">
            <input
              type="text"
              placeholder="Search faculty name, cabin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-carbon-black-100 border border-gray-700 text-gray-200 text-xs px-3 py-2 pl-8 rounded-xl outline-none focus:border-yellow-400 transition"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          </form>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Directory Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-3 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading faculty profiles...</p>
          </div>
        ) : faculty.length === 0 ? (
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-12 text-center">
            <Building size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No faculty members found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No entries matching your department or name filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculty.map((f) => (
              <div
                key={f.faculty_id}
                className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                      {f.department_code}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                          title="Edit Faculty Entry"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(f.faculty_id)}
                          className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                          title="Remove Faculty Member"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">{f.full_name}</h3>
                  <p className="text-xs font-semibold text-gray-300 mt-0.5">{f.designation}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{f.department_name}</p>

                  {f.qualification && (
                    <div className="flex items-start gap-1.5 mt-2.5 text-[11px] text-gray-400">
                      <GraduationCap size={13} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      <span>{f.qualification}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin size={14} className="text-yellow-300 flex-shrink-0" />
                    <span>Cabin: <strong className="text-white">{f.cabin_number}</strong></span>
                    {f.building_location && (
                      <span className="text-[11px] text-gray-500">({f.building_location})</span>
                    )}
                  </div>

                  {f.office_hours && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock size={14} className="text-yellow-300 flex-shrink-0" />
                      <span>Hours: {f.office_hours}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <a
                      href={`mailto:${f.email}`}
                      className="text-gray-300 hover:text-yellow-300 truncate underline"
                    >
                      {f.email}
                    </a>
                  </div>

                  {f.phone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <a href={`tel:${f.phone}`} className="text-gray-400 hover:text-yellow-300">
                        {f.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
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

        {/* Admin Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">
                  {editingFaculty ? 'Edit Faculty Record' : 'Add Faculty Member'}
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

              <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Rao"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@campus.edu"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91..."
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Department *</label>
                    <select
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    >
                      {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                          {d.department_name} ({d.department_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Associate Professor"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Cabin Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AB-3 412"
                      value={form.cabinNumber}
                      onChange={(e) => setForm({ ...form, cabinNumber: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Office Consultation Hours</label>
                    <input
                      type="text"
                      placeholder="e.g. Mon & Wed, 2:00 PM - 4:00 PM"
                      value={form.officeHours}
                      onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Academic Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D. in Distributed Systems, IIT Bombay"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
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
                    {modalLoading ? 'Saving...' : editingFaculty ? 'Save Changes' : 'Add Member'}
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
