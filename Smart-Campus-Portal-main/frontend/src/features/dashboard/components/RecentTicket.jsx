export default function RecentTicket({ tickets = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800';
      case 'In Progress':
        return 'bg-blue-950/40 text-blue-400 border-blue-800';
      case 'Rejected':
        return 'bg-red-950/40 text-red-400 border-red-800';
      default:
        return 'bg-yellow-950/40 text-yellow-300 border-yellow-800';
    }
  };

  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-gray-500">
        No active complaints on record.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {tickets.map((t) => (
        <div key={t.complaint_id} className="py-3 px-4 flex items-center justify-between hover:bg-carbon-black-100/40 transition">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-xs font-semibold text-gray-200 truncate">{t.title}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
              <span>{t.complaint_type}</span>
              {t.student_name && (
                <>
                  <span>•</span>
                  <span>{t.student_name}</span>
                </>
              )}
              <span>•</span>
              <span>{new Date(t.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(t.status)}`}>
            {t.status}
          </span>
        </div>
      ))}
    </div>
  );
}
