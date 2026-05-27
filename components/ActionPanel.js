"use client";
import { useState } from "react";

export default function ActionPanel({ onAction, showToast, leads }) {
  const [findQuery, setFindQuery] = useState("restaurant");
  const [findLocation, setFindLocation] = useState("New York");
  const [findCount, setFindCount] = useState(5);
  const [addName, setAddName] = useState("");
  const [addWebsite, setAddWebsite] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [loading, setLoading] = useState({});

  async function handleFind() {
    setLoading((p) => ({ ...p, find: true }));
    const result = await onAction("bulk_find", {
      query: findQuery,
      location: findLocation,
      count: findCount,
    });
    if (result) showToast(`Found ${result.added} new leads!`);
    setLoading((p) => ({ ...p, find: false }));
  }

  async function handleAddLead() {
    if (!addName.trim()) return showToast("Name is required", "error");
    setLoading((p) => ({ ...p, add: true }));
    const result = await onAction("add_lead", {
      name: addName,
      website: addWebsite,
      email: addEmail,
      phone: addPhone,
      source: "manual",
    });
    if (result) {
      showToast(`Added "${addName}" as a new lead`);
      setAddName("");
      setAddWebsite("");
      setAddEmail("");
      setAddPhone("");
    }
    setLoading((p) => ({ ...p, add: false }));
  }

  async function handleAuditAll() {
    setLoading((p) => ({ ...p, auditAll: true }));
    const unaudited = leads.filter((l) => !l.audit && l.website);
    let count = 0;
    for (const lead of unaudited.slice(0, 5)) {
      const r = await onAction("audit_lead", { leadId: lead.id });
      if (r) count++;
    }
    showToast(`Audited ${count} websites`);
    setLoading((p) => ({ ...p, auditAll: false }));
  }

  async function handleOutreachAll() {
    setLoading((p) => ({ ...p, outreachAll: true }));
    const ready = leads.filter((l) => l.audit && !l.outreachSent && l.email && l.status === "new");
    let count = 0;
    for (const lead of ready.slice(0, 5)) {
      const r = await onAction("send_outreach", { leadId: lead.id });
      if (r) count++;
    }
    showToast(`Sent outreach to ${count} leads`);
    setLoading((p) => ({ ...p, outreachAll: false }));
  }

  const unaudited = leads.filter((l) => !l.audit && l.website).length;
  const readyForOutreach = leads.filter((l) => l.audit && !l.outreachSent && l.email && l.status === "new").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* FIND LEADS */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Find New Leads</h3>
        <p className="text-xs text-gray-500 mb-4">Search for businesses to add to your pipeline</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Business Type</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
              placeholder="e.g., dentist, restaurant, gym"
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
              placeholder="e.g., Chicago, Miami, Local"
              value={findLocation}
              onChange={(e) => setFindLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">How many?</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={findCount}
              onChange={(e) => setFindCount(Number(e.target.value))}
            >
              <option value={3}>3 leads</option>
              <option value={5}>5 leads</option>
              <option value={10}>10 leads</option>
            </select>
          </div>
          <button
            onClick={handleFind}
            disabled={loading.find}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition mt-2"
          >
            {loading.find ? "Finding leads..." : `Find ${findCount} Leads`}
          </button>
        </div>
      </div>

      {/* ADD LEAD MANUALLY */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Add Lead Manually</h3>
        <p className="text-xs text-gray-500 mb-4">Add a specific business you want to reach out to</p>

        <div className="space-y-3">
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
            placeholder="Business Name *"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
          />
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
            placeholder="Website URL"
            value={addWebsite}
            onChange={(e) => setAddWebsite(e.target.value)}
          />
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
            placeholder="Email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
          />
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
            placeholder="Phone (optional)"
            value={addPhone}
            onChange={(e) => setAddPhone(e.target.value)}
          />
          <button
            onClick={handleAddLead}
            disabled={loading.add || !addName.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition"
          >
            {loading.add ? "Adding..." : "Add Lead"}
          </button>
        </div>
      </div>

      {/* BULK AUDIT */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Audit Websites</h3>
        <p className="text-xs text-gray-500 mb-4">Check websites for speed, SEO, CTAs, and issues</p>

        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Leads needing audit</span>
            <span className="text-lg font-bold text-yellow-400">{unaudited}</span>
          </div>
        </div>

        <button
          onClick={handleAuditAll}
          disabled={loading.auditAll || unaudited === 0}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition"
        >
          {loading.auditAll ? "Auditing..." : unaudited > 0 ? `Audit ${Math.min(unaudited, 5)} Websites` : "No Leads to Audit"}
        </button>
        <p className="text-xs text-gray-600 mt-2 text-center">Checks speed, SEO, CTA, forms, trust signals</p>
      </div>

      {/* BULK OUTREACH */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Send Outreach</h3>
        <p className="text-xs text-gray-500 mb-4">Send AI-personalized emails to audited leads</p>

        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Ready for outreach</span>
            <span className="text-lg font-bold text-purple-400">{readyForOutreach}</span>
          </div>
        </div>

        <button
          onClick={handleOutreachAll}
          disabled={loading.outreachAll || readyForOutreach === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition"
        >
          {loading.outreachAll ? "Sending..." : readyForOutreach > 0 ? `Send to ${Math.min(readyForOutreach, 5)} Leads` : "No Leads Ready"}
        </button>
        <p className="text-xs text-gray-600 mt-2 text-center">Leads must be audited first</p>
      </div>
    </div>
  );
}
