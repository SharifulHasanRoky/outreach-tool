"use client";
import { useState } from "react";

export default function ReplyPanel({ lead, onRefresh }) {
  const [reply, setReply] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleAnalyze() {
    if (!reply.trim() || !lead) return;
    setLoading(true);

    // Client-side intent analysis (works without AI API)
    setTimeout(() => {
      const lowerReply = reply.toLowerCase();
      let intent = "unclear";
      let suggestedAction = "book_meeting";

      if (lowerReply.includes("interested") || lowerReply.includes("tell me more") || lowerReply.includes("sounds good")) {
        intent = "interested";
        suggestedAction = "book_meeting";
      } else if (lowerReply.includes("not interested") || lowerReply.includes("no thanks") || lowerReply.includes("don't need")) {
        intent = "not_interested";
        suggestedAction = "remove_lead";
      } else if (lowerReply.includes("?") || lowerReply.includes("how") || lowerReply.includes("what") || lowerReply.includes("price") || lowerReply.includes("cost")) {
        intent = "question";
        suggestedAction = "answer_question";
      } else if (lowerReply.includes("meet") || lowerReply.includes("call") || lowerReply.includes("schedule") || lowerReply.includes("zoom")) {
        intent = "meeting_request";
        suggestedAction = "book_meeting";
      } else if (lowerReply.includes("unsubscribe") || lowerReply.includes("remove") || lowerReply.includes("stop")) {
        intent = "unsubscribe";
        suggestedAction = "remove_lead";
      } else if (lowerReply.includes("out of office") || lowerReply.includes("vacation") || lowerReply.includes("away")) {
        intent = "out_of_office";
        suggestedAction = "follow_up_later";
      }

      setAnalysis({ intent, suggestedAction });

      // Generate reply suggestion
      const replies = {
        book_meeting: `Thanks for getting back to me! I'd love to chat about some ideas for ${lead.name}. Would you have 15 minutes this week for a quick call? I'm flexible on timing.`,
        answer_question: `Great question! I'd be happy to explain more. The short version is I help businesses like ${lead.name} improve their online presence to get more leads. Would a quick call work to walk you through specifics?`,
        remove_lead: `No worries at all! I appreciate you letting me know. Wishing you and ${lead.name} all the best!`,
        follow_up_later: `Thanks for letting me know! I'll circle back in a couple of weeks. No rush at all.`,
        send_info: `Here's what I typically help with: website speed optimization, better conversion design, and lead capture setup. Would any of these be relevant for ${lead.name}?`,
      };

      setSuggestion(replies[suggestedAction] || replies.book_meeting);
      setLoading(false);
    }, 600);
  }

  if (!lead) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2 text-white">Lead Details</h2>
        <p className="text-gray-500 text-sm">
          Click a lead to view details and use the AI reply assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">{lead.name}</h2>

      {/* Lead Info */}
      <div className="space-y-1 text-sm text-gray-400">
        {lead.website && (
          <p>
            <span className="text-gray-500">Web:</span>{" "}
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {lead.website.replace("https://", "")}
            </a>
          </p>
        )}
        {lead.email && (
          <p>
            <span className="text-gray-500">Email:</span> {lead.email}
          </p>
        )}
        {lead.phone && (
          <p>
            <span className="text-gray-500">Phone:</span> {lead.phone}
          </p>
        )}
        <p>
          <span className="text-gray-500">Source:</span>{" "}
          {lead.source?.replace(/_/g, " ")}
        </p>
        <p>
          <span className="text-gray-500">Status:</span>{" "}
          <span className="text-white capitalize">{lead.status?.replace(/_/g, " ")}</span>
        </p>
      </div>

      {/* Audit */}
      {lead.audit && (
        <div className="border-t border-gray-800 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
              style={{
                borderColor:
                  lead.audit.score > 70
                    ? "#4ade80"
                    : lead.audit.score > 40
                    ? "#facc15"
                    : "#f87171",
                color:
                  lead.audit.score > 70
                    ? "#4ade80"
                    : lead.audit.score > 40
                    ? "#facc15"
                    : "#f87171",
              }}
            >
              {lead.audit.score}
            </div>
            <span className="text-xs text-gray-500">Audit Score</span>
          </div>
          <p className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
            {lead.audit.summary}
          </p>
          {lead.audit.issues?.length > 0 && (
            <ul className="text-xs space-y-1 mt-2">
              {lead.audit.issues.map((issue, i) => (
                <li key={i} className="text-red-400">
                  • {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* AI Reply Assistant */}
      <div className="border-t border-gray-800 pt-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          AI Reply Assistant
        </h3>
        <textarea
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:outline-none"
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

        {analysis && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2 text-xs">
              <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
                Intent: <span className="text-blue-400">{analysis.intent.replace(/_/g, " ")}</span>
              </span>
              <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
                Action: <span className="text-purple-400">{analysis.suggestedAction.replace(/_/g, " ")}</span>
              </span>
            </div>
          </div>
        )}

        {suggestion && (
          <div className="mt-3 bg-gray-800 border border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Suggested Reply:</p>
            <p className="text-sm text-green-300 whitespace-pre-wrap">
              {suggestion}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(suggestion);
                // Brief visual feedback
              }}
              className="mt-2 text-xs text-gray-500 hover:text-white transition"
            >
              📋 Copy to clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
