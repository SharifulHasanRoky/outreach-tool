"use client";
import { useState } from "react";

export default function ReplyPanel({ lead, onRefresh }) {
  const [reply, setReply] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!reply.trim() || !lead) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reply-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, replyText: reply }),
      });
      const data = await res.json();
      setSuggestion(data.suggestedReply || "Could not generate suggestion.");
    } catch (e) {
      setSuggestion("Error generating suggestion.");
    } finally {
      setLoading(false);
    }
  }

  if (!lead) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Lead Details</h2>
        <p className="text-gray-500 text-sm">Click a lead to view details and use the AI reply assistant.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">{lead.name}</h2>

      {/* Lead Info */}
      <div className="space-y-1 text-sm text-gray-400">
        {lead.website && (
          <p>
            <span className="text-gray-500">Web:</span>{" "}
            <a href={lead.website} target="_blank" className="text-blue-400 hover:underline truncate">
              {lead.website}
            </a>
          </p>
        )}
        {lead.email && <p><span className="text-gray-500">Email:</span> {lead.email}</p>}
        {lead.audit?.summary && (
          <p className="mt-2 text-xs bg-gray-800 p-2 rounded">
            <span className="text-gray-500">Audit:</span> {lead.audit.summary}
          </p>
        )}
      </div>

      {/* Audit Issues */}
      {lead.audit?.issues?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Issues Found:</p>
          <ul className="text-xs space-y-1">
            {lead.audit.issues.map((issue, i) => (
              <li key={i} className="text-red-400">• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Reply Assistant */}
      <div className="border-t border-gray-800 pt-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">AI Reply Assistant</h3>
        <textarea
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none"
          rows={3}
          placeholder="Paste their reply here..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !reply.trim()}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
        >
          {loading ? "Analyzing..." : "Get AI Suggestion"}
        </button>

        {suggestion && (
          <div className="mt-3 bg-gray-800 border border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Suggested Reply:</p>
            <p className="text-sm text-green-300 whitespace-pre-wrap">{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
