export default function StatsCard({ title, value, subtitle, icon: Icon, to, badge }) {
  const content = (
    <div className="bg-carbon-black-400 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-yellow-400/50 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1.5 font-poppins">{value}</p>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-carbon-black-100 text-yellow-300 border border-yellow-400/20">
            <Icon size={20} />
          </div>
        )}
      </div>
      {(subtitle || badge) && (
        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <span>{subtitle}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded bg-yellow-300/10 text-yellow-300 text-[11px] font-semibold border border-yellow-300/20">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return content;
}
