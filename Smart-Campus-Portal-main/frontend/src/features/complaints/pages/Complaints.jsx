import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  User,
  MapPin,
  X,
  UserCheck,
  Send,
  History,
  Trash2
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
  getComplaints,
  getComplaintById,
  submitComplaint,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getStaffList
} from '../services/complaintService';
import { useAuth } from '../../../context/AuthContext';

const COMPLAINT_TYPES = [
  'All',
  'Electrical',
  'Plumbing',
  'IT & Internet',
  'Laboratory',
  'Hostel',
  'Housekeeping',
  'Civil & Infrastructure',
  'Other'
];

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved', 'Rejected'];

export default function Complaints() {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Detail Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // New Complaint Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    complaintType: 'Electrical',
    title: '',
    location: '',
    description: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Status Update Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'In Progress', remarks: '' });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Assign Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [assignForm, setAssignForm] = useState({ assignedTo: '', remarks: '' });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getComplaints({
        complaintType: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        search: search || undefined,
        page,
        limit: 10
      });
      setComplaints(res.data || []);
      setPagination(res.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (!isAdminOrStaff) return;
    try {
      const res = await getStaffList();
      setStaffList(res.data || []);
      if (res.data?.length > 0) {
        setAssignForm((prev) => ({ ...prev, assignedTo: String(res.data[0].user_id) }));
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, status, page]);

  useEffect(() => {
    if (isAdminOrStaff) {
      fetchStaff();
    }
  }, [isAdminOrStaff]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const openDetail = async (complaintId) => {
    setDetailLoading(true);
    try {
      const res = await getComplaintById(complaintId);
      setSelectedComplaint(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to fetch complaint details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!submitForm.title || !submitForm.location || !submitForm.description) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('complaintType', submitForm.complaintType);
    formData.append('title', submitForm.title);
    formData.append('location', submitForm.location);
    formData.append('description', submitForm.description);
    if (attachment) formData.append('attachment', attachment);

    setSubmitLoading(true);
    setSubmitError('');
    try {
      await submitComplaint(formData);
      setShowSubmitModal(false);
      setSubmitForm({
        complaintType: 'Electrical',
        title: '',
        location: '',
        description: ''
      });
      setAttachment(null);
      fetchComplaints();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to lodge complaint ticket.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openStatusModal = (complaint) => {
    setStatusTarget(complaint);
    setStatusForm({
      status: complaint.status === 'Open' ? 'In Progress' : complaint.status,
      remarks: ''
    });
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusForm.remarks.trim()) {
      setStatusError('A remark explaining the status change is required.');
      return;
    }

    setStatusLoading(true);
    setStatusError('');
    try {
      const res = await updateComplaintStatus(statusTarget.complaint_id, statusForm.status, statusForm.remarks);
      setShowStatusModal(false);
      if (selectedComplaint && selectedComplaint.complaint_id === statusTarget.complaint_id) {
        setSelectedComplaint(res.data);
      }
      fetchComplaints();
    } catch (err) {
      setStatusError(err?.response?.data?.message || 'Failed to update complaint status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const openAssignModal = (complaint) => {
    setAssignTarget(complaint);
    setAssignForm({
      assignedTo: staffList.length > 0 ? String(staffList[0].user_id) : '',
      remarks: ''
    });
    setAssignError('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.assignedTo) {
      setAssignError('Please select a staff member.');
      return;
    }

    setAssignLoading(true);
    setAssignError('');
    try {
      const res = await assignComplaint(assignTarget.complaint_id, assignForm.assignedTo, assignForm.remarks);
      setShowAssignModal(false);
      if (selectedComplaint && selectedComplaint.complaint_id === assignTarget.complaint_id) {
        setSelectedComplaint(res.data);
      }
      fetchComplaints();
    } catch (err) {
      setAssignError(err?.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to withdraw this complaint ticket?')) return;
    try {
      await deleteComplaint(complaintId);
      if (selectedComplaint?.complaint_id === complaintId) {
        setSelectedComplaint(null);
      }
      fetchComplaints();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete complaint.');
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-400/10 text-yellow-300 border border-yellow-400/30">
            <Clock size={11} /> Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <Clock size={11} /> In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-300 border border-green-500/30">
            <CheckCircle2 size={11} /> Resolved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/30">
            <XCircle size={11} /> Rejected
          </span>
        );
      default:
        return <span className="text-xs text-gray-400">{s}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Campus Complaints & Maintenance</h1>
            <p className="text-xs text-gray-400 mt-1">
              Submit and track infrastructure, laboratory, and hostel maintenance grievances with audit timelines.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>Lodge Grievance</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-carbon-black-400 border border-gray-800 p-3 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
              <Filter size={14} className="text-gray-400" />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-gray-200 outline-none cursor-pointer"
              >
                {COMPLAINT_TYPES.map((c) => (
                  <option key={c} value={c} className="bg-carbon-black text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-gray-200 outline-none cursor-pointer"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s} className="bg-carbon-black text-white">
                    {s === 'All' ? 'All Statuses' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 sm:max-w-xs relative">
            <input
              type="text"
              placeholder="Search title, location..."
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

        {/* Complaints List Table / Cards */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-3 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-12 text-center">
            <ShieldAlert size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No complaints found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              There are no complaint tickets matching your filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-carbon-black-100 text-gray-400 font-semibold border-b border-gray-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4">Reported</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-normal">
                  {complaints.map((item) => (
                    <tr key={item.complaint_id} className="hover:bg-carbon-black-100/50 transition">
                      <td className="py-3.5 px-4 font-medium text-white max-w-[220px]">
                        <div className="truncate font-semibold text-gray-200">{item.title}</div>
                        <div className="text-[11px] text-gray-500 truncate">By {item.student_name}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-800 text-gray-300 border border-gray-700">
                          {item.complaint_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 max-w-[150px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-500 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                      <td className="py-3.5 px-4 text-gray-300 whitespace-nowrap">
                        {item.assigned_to_name ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <UserCheck size={13} className="text-yellow-300" />
                            <span>{item.assigned_to_name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetail(item.complaint_id)}
                            className="px-2.5 py-1 bg-carbon-black-100 hover:bg-gray-800 border border-gray-700 text-gray-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
                          >
                            Details
                          </button>

                          {isAdminOrStaff && (
                            <>
                              <button
                                onClick={() => openStatusModal(item)}
                                className="px-2.5 py-1 bg-yellow-300/10 hover:bg-yellow-300/20 text-yellow-300 border border-yellow-300/30 rounded-lg text-[11px] font-medium transition cursor-pointer"
                                title="Update Status"
                              >
                                Status
                              </button>
                              <button
                                onClick={() => openAssignModal(item)}
                                className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-medium transition cursor-pointer"
                                title="Assign to Staff"
                              >
                                Assign
                              </button>
                            </>
                          )}

                          {(user?.user_id === item.student_id || user?.role === 'Admin') && (
                            <button
                              onClick={() => handleDelete(item.complaint_id)}
                              className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {pagination.totalPages > 1 && (
              <div className="bg-carbon-black-100 px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-carbon-black border border-gray-700 rounded-lg hover:border-gray-500 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-carbon-black border border-gray-700 rounded-lg hover:border-gray-500 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal with Audit History Timeline */}
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-gray-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-yellow-300 border border-gray-700">
                      {selectedComplaint.complaint_type}
                    </span>
                    {getStatusBadge(selectedComplaint.status)}
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">{selectedComplaint.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Complaint Metadata Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-carbon-black-100 p-4 rounded-xl border border-gray-800 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Submitted By</span>
                  <div className="font-semibold text-white mt-0.5">{selectedComplaint.student_name}</div>
                  <div className="text-gray-400 text-[11px]">{selectedComplaint.student_email}</div>
                  {selectedComplaint.student_phone && (
                    <div className="text-gray-400 text-[11px]">{selectedComplaint.student_phone}</div>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Location</span>
                  <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                    <MapPin size={12} className="text-yellow-300" />
                    <span>{selectedComplaint.location}</span>
                  </div>
                  <span className="text-gray-500 block text-[11px] mt-2">Assigned Staff</span>
                  <div className="font-semibold text-yellow-300 mt-0.5">
                    {selectedComplaint.assigned_to_name || 'Not yet assigned'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Issue Details</h4>
                <div className="p-3 bg-carbon-black-100 rounded-xl border border-gray-800 text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Attachment if any */}
              {selectedComplaint.attachment_url && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Attached Evidence</h4>
                  <div className="p-3 bg-carbon-black-100 rounded-xl border border-gray-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-300 truncate">
                      <FileText size={16} className="text-yellow-300 flex-shrink-0" />
                      <span className="truncate">{selectedComplaint.attachment_url.split('/').pop()}</span>
                    </div>
                    <a
                      href={selectedComplaint.attachment_url.startsWith('http') ? selectedComplaint.attachment_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${selectedComplaint.attachment_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-yellow-300 text-black text-[11px] font-semibold rounded-lg hover:bg-yellow-400 transition flex-shrink-0 cursor-pointer"
                    >
                      View Attachment
                    </a>
                  </div>
                  {/\.(jpg|jpeg|png|webp)$/i.test(selectedComplaint.attachment_url) && (
                    <div className="mt-2 h-44 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                      <img
                        src={selectedComplaint.attachment_url.startsWith('http') ? selectedComplaint.attachment_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${selectedComplaint.attachment_url}`}
                        alt="Complaint evidence"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Admin remarks if any */}
              {selectedComplaint.admin_remarks && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Latest Administrative Remark</h4>
                  <div className="p-3 bg-carbon-black-100 rounded-xl border border-yellow-400/20 text-xs text-yellow-200/90 leading-relaxed">
                    {selectedComplaint.admin_remarks}
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <History size={14} className="text-yellow-300" />
                  <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Audit & Resolution Timeline
                  </h4>
                </div>

                {selectedComplaint.history && selectedComplaint.history.length > 0 ? (
                  <div className="space-y-3 relative pl-4 border-l-2 border-gray-800 ml-2">
                    {selectedComplaint.history.map((h) => (
                      <div key={h.history_id} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {h.old_status} &rarr; <span className="text-yellow-300">{h.new_status}</span>
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(h.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-400 mt-1 italic">"{h.remarks}"</p>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            Updated by: <span className="text-gray-300">{h.changed_by_name}</span> ({h.changed_by_role})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No status transitions recorded yet.</p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isAdminOrStaff && (
                    <>
                      <button
                        onClick={() => {
                          const target = selectedComplaint;
                          setSelectedComplaint(null);
                          openStatusModal(target);
                        }}
                        className="px-3 py-1.5 bg-yellow-300 text-black text-xs font-semibold rounded-xl hover:bg-yellow-400 transition"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => {
                          const target = selectedComplaint;
                          setSelectedComplaint(null);
                          openAssignModal(target);
                        }}
                        className="px-3 py-1.5 bg-gray-800 text-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-700 transition"
                      >
                        Assign Staff
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Complaint Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">Lodge Campus Grievance</h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {submitError && (
                <div className="mt-3 p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitNew} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Issue Category *</label>
                  <select
                    value={submitForm.complaintType}
                    onChange={(e) => setSubmitForm({ ...submitForm, complaintType: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  >
                    {COMPLAINT_TYPES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Subject / Issue Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AC cooling malfunction in Computing Lab 3"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Precise Campus Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Turing Block, 3rd Floor, Room 304"
                    value={submitForm.location}
                    onChange={(e) => setSubmitForm({ ...submitForm, location: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Comprehensive Description *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about the issue, affected devices or facilities, and when it began..."
                    value={submitForm.description}
                    onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Optional Photo Evidence</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAttachment(e.target.files[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {submitLoading ? 'Filing Ticket...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && statusTarget && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">Update Ticket Status</h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-3 text-xs text-gray-300">
                Ticket: <strong className="text-white">{statusTarget.title}</strong>
              </div>

              {statusError && (
                <div className="mb-3 p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
                  {statusError}
                </div>
              )}

              <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">New Status *</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Resolution Remark / Audit Note *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain actions taken, work order status, or resolution rationale..."
                    value={statusForm.remarks}
                    onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={statusLoading}
                    className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {statusLoading ? 'Updating...' : 'Commit Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && assignTarget && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">Assign Ticket to Staff</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-3 text-xs text-gray-300">
                Ticket: <strong className="text-white">{assignTarget.title}</strong>
              </div>

              {assignError && (
                <div className="mb-3 p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
                  {assignError}
                </div>
              )}

              <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Select Assignee *</label>
                  <select
                    value={assignForm.assignedTo}
                    onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  >
                    {staffList.map((st) => (
                      <option key={st.user_id} value={st.user_id}>
                        {st.full_name} ({st.role_title || st.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Assignment Directive / Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Instructions for the assigned team member..."
                    value={assignForm.remarks}
                    onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
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
