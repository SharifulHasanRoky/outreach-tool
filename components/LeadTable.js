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

export default function LeadTable({ leads, onSelect, onStatusChange, onAudit, onSendOutreach, onDelete }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Leads ({leads.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Click a row to see details + AI reply assistant</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Business</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Source</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Audit</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-1">No leads yet</p>
                  <p className="text-xs">Go to the Actions tab to find or add leads</p>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-gray-800 hover:bg-gray-800/30 cursor-pointer transition-colors"
                  onClick={() => onSelect(lead)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">
                      {lead.email || lead.website || "No contact info"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs capitalize">
                    {lead.source?.replace(/_/g, " ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.audit?.score != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                          style={{
                            borderColor: lead.audit.score > 70 ? "#4ade80" : lead.audit.score > 40 ? "#facc15" : "#f87171",
                            color: lead.audit.score > 70 ? "#4ade80" : lead.audit.score > 40 ? "#facc15" : "#f87171",
                          }}
                        >
                          {lead.audit.score}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">Not audited</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[lead.status] || "bg-gray-600"} text-white`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {/* Audit button */}
                      {!lead.audit && lead.website && (
                        <button
                          onClick={() => onAudit(lead.id)}
                          className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/40 transition"
                          title="Audit website"
                        >
                          Audit
                        </button>
                      )}
                      {/* Send outreach button */}
                      {lead.audit && !lead.outreachSent && lead.email && lead.status === "new" && (
                        <button
                          onClick={() => onSendOutreach(lead.id)}
                          className="px-2 py-1 text-xs bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/40 transition"
                          title="Send outreach"
                        >
                          Send
                        </button>
                      )}
                      {/* Status dropdown */}
                      <select
                        className="bg-gray-800 border border-gray-700 text-xs rounded px-1.5 py-1 text-gray-400 max-w-[90px]"
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value)}
                      >
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${lead.name}"?`)) onDelete(lead.id);
                        }}
                        className="px-1.5 py-1 text-xs text-red-500/60 hover:text-red-400 transition"
                        title="Delete lead"
                      >
                        x
                      </button>
                    </div>
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
