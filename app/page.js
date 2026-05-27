"use client";
import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import LeadTable from "../components/LeadTable";
import ReplyPanel from "../components/ReplyPanel";
import ActionPanel from "../components/ActionPanel";
import ActivityLog from "../components/ActivityLog";
import {
  initializeStore,
  getLeads,
  getLogs,
  getStats,
  updateLead,
  deleteLead,
  auditLead,
  sendOutreach,
  bulkFind,
  addManualLead,
  resetAllData,
} from "../lib/client-store";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    initializeStore();
    refreshData();
    setLoading(false);
  }, []);

  function refreshData() {
    setLeads(getLeads());
    setLogs(getLogs());
    setStats(getStats());
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleUpdateStatus(id, status) {
    updateLead(id, { status });
    showToast(`Status updated to "${status}"`);
    refreshData();
  }

  function handleDelete(id) {
    deleteLead(id);
    showToast("Lead deleted");
    if (selectedLead?.id === id) setSelectedLead(null);
    refreshData();
  }

  function handleAudit(id) {
    const result = auditLead(id);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast(`Audit complete! Score: ${result.audit.score}/100`);
    }
    refreshData();
  }

  function handleSendOutreach(id) {
    const result = sendOutreach(id);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast("Outreach sent!");
    }
    refreshData();
  }

  function handleBulkFind(data) {
    const result = bulkFind(data);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast(`Found ${result.added} new leads!`);
    }
    refreshData();
    return result;
  }

  function handleAddLead(data) {
    const result = addManualLead(data);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast(`Added "${data.name}" as a new lead`);
    }
    refreshData();
    return result;
  }

  function handleBulkAudit() {
    const unaudited = getLeads().filter((l) => !l.audit && l.website);
    let count = 0;
    for (const lead of unaudited.slice(0, 5)) {
      const r = auditLead(lead.id);
      if (r.success) count++;
    }
    showToast(`Audited ${count} websites`);
    refreshData();
  }

  function handleBulkOutreach() {
    const ready = getLeads().filter(
      (l) => l.audit && !l.outreachSent && l.email && l.status === "new"
    );
    let count = 0;
    for (const lead of ready.slice(0, 5)) {
      const r = sendOutreach(lead.id);
      if (r.success) count++;
    }
    showToast(`Sent outreach to ${count} leads`);
    refreshData();
  }

  function handleReset() {
    if (confirm("Reset all data to demo defaults? This cannot be undone.")) {
      resetAllData();
      refreshData();
      setSelectedLead(null);
      showToast("Data reset to defaults");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "leads", label: "Leads", icon: "👥" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "activity", label: "Activity Log", icon: "📋" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            AI Outreach System
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Find leads, audit websites, send outreach, close clients
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="text-xs text-gray-600 hover:text-gray-400 transition"
          >
            Reset Demo
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Tabs */}
      <div className="flex gap-1 mt-6 mb-4 bg-gray-900 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "leads" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LeadTable
              leads={leads}
              onSelect={setSelectedLead}
              onStatusChange={handleUpdateStatus}
              onAudit={handleAudit}
              onSendOutreach={handleSendOutreach}
              onDelete={handleDelete}
            />
          </div>
          <div className="lg:col-span-1">
            <ReplyPanel lead={selectedLead} onRefresh={refreshData} />
          </div>
        </div>
      )}

      {activeTab === "actions" && (
        <ActionPanel
          leads={leads}
          onBulkFind={handleBulkFind}
          onAddLead={handleAddLead}
          onBulkAudit={handleBulkAudit}
          onBulkOutreach={handleBulkOutreach}
          showToast={showToast}
        />
      )}

      {activeTab === "activity" && <ActivityLog logs={logs} />}
    </main>
  );
}
