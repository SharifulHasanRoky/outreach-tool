"use client";

const statusColors = {
  new: "bg-gray-600",
  outreach_sent: "bg-blue-600",
  replied: "bg-green-600",
  interested: "bg-yellow-600",
  meeting_booked: "bg-emerald-600",
  closed: "bg-pink-600",
  no_response: "bg-red-900",
};

const statusLabels = {
  new: "New",
  outreach_sent: "Outreach Sent",
  replied: "Replied",
  interested: "Interested",
  meeting_booked: "Meeting Booked",
  closed: "Closed",
  no_response: "No Response",
};

export default function LeadTable({ leads, onSelect, onStatusChange }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Leads ({leads.length})</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Source</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Score</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No leads yet. Run the lead finder to get started.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-gray-800 hover:bg-gray-800/30 cursor-pointer"
                  onClick={() => onSelect(lead)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                      {lead.email || lead.website || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize">
                    {lead.source?.replace("_", " ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.audit?.score != null ? (
                      <span
                        className={`text-sm font-mono ${
                          lead.audit.score > 70
                            ? "text-green-400"
                            : lead.audit.score > 40
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {lead.audit.score}
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusColors[lead.status] || "bg-gray-600"
                      } text-white`}
                    >
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-gray-800 border border-gray-700 text-xs rounded px-2 py-1 text-gray-300"
                      value={lead.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(lead.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
