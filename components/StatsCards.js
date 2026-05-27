"use client";

const cards = [
  { key: "totalLeads", label: "Total Leads", color: "bg-blue-600" },
  { key: "outreachSent", label: "Outreach Sent", color: "bg-purple-600" },
  { key: "replies", label: "Replies", color: "bg-green-600" },
  { key: "interested", label: "Interested", color: "bg-yellow-600" },
  { key: "meetingsBooked", label: "Meetings Booked", color: "bg-emerald-600" },
  { key: "closed", label: "Closed Clients", color: "bg-pink-600" },
];

export default function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4"
        >
          <div className={`w-3 h-3 rounded-full ${card.color} mb-2`} />
          <p className="text-2xl font-bold text-white">
            {stats[card.key] || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
