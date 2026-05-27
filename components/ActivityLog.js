"use client";

export default function ActivityLog({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-500">No outreach activity yet. Send your first message from the Actions tab.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Outreach Activity</h2>
        <p className="text-xs text-gray-500 mt-0.5">{logs.length} messages sent</p>
      </div>

      <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
        {logs.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).map((entry) => (
          <div key={entry.id} className="px-4 py-3 hover:bg-gray-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  entry.status === "sent" ? "bg-green-500" :
                  entry.status === "failed" ? "bg-red-500" :
                  "bg-yellow-500"
                }`} />
                <div>
                  <p className="text-sm font-medium text-white">{entry.leadName}</p>
                  <p className="text-xs text-gray-500">{entry.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {entry.followupNumber > 0 ? `Follow-up #${entry.followupNumber}` : "Initial"}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(entry.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 pl-5">
              <span className="text-gray-600">Subject:</span> {entry.subject}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
