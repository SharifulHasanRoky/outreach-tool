"use client";
import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import LeadTable from "../components/LeadTable";
import ReplyPanel from "../components/ReplyPanel";
import ActionPanel from "../components/ActionPanel";
import ActivityLog from "../components/ActivityLog";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [statsRes, leadsRes, logsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/leads"),
        fetch("/api/logs"),
      ]);
      setStats(await statsRes.json());
      setLeads(await leadsRes.json());
      setLogs(await logsRes.json());
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function updateLeadStatus(id, status) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    showToast(`Lead status updated to "${status}"`);
    fetchData();
  }

  async function runAction(action, data = {}) {
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });
      const result = await res.json();
      if (result.error) {
        showToast(result.error, "error");
        return null;
      }
      fetchData();
      return result;
    } catch (e) {
      showToast("Action failed: " + e.message, "error");
      return null;
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
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Outreach System</h1>
          <p className="text-gray-500 text-sm mt-0.5">Find leads, audit websites, send outreach, close clients</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">System Active</span>
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
              onStatusChange={updateLeadStatus}
              onAudit={(id) => runAction("audit_lead", { leadId: id }).then((r) => r && showToast("Audit complete!"))}
              onSendOutreach={(id) => runAction("send_outreach", { leadId: id }).then((r) => r && showToast("Outreach sent!"))}
              onDelete={(id) => runAction("delete_lead", { leadId: id }).then((r) => r && showToast("Lead deleted"))}
            />
          </div>
          <div className="lg:col-span-1">
            <ReplyPanel lead={selectedLead} onRefresh={fetchData} />
          </div>
        </div>
      )}

      {activeTab === "actions" && (
        <ActionPanel
          onAction={runAction}
          showToast={showToast}
          leads={leads}
        />
      )}

      {activeTab === "activity" && (
        <ActivityLog logs={logs} />
      )}
    </main>
  );
}
