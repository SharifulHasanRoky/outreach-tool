"use client";

const cards = [
  { key: "totalLeads", label: "Total Leads", color: "from-blue-600 to-blue-800", icon: "👥" },
  { key: "outreachSent", label: "Outreach Sent", color: "from-purple-600 to-purple-800", icon: "📧" },
  { key: "replies", label: "Replies", color: "from-green-600 to-green-800", icon: "💬" },
  { key: "interested", label: "Interested", color: "from-yellow-600 to-yellow-800", icon: "🎯" },
  { key: "meetingsBooked", label: "Meetings", color: "from-emerald-600 to-emerald-800", icon: "📅" },
  { key: "closed", label: "Clients Won", color: "from-pink-600 to-pink-800", icon: "🏆" },
];

export default function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">{card.icon}</span>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color}`} />
          </div>
          <p className="text-2xl font-bold text-white">{stats[card.key] || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
