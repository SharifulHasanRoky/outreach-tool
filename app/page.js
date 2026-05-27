"use client";
import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import LeadTable from "../components/LeadTable";
import ReplyPanel from "../components/ReplyPanel";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [statsRes, leadsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/leads"),
      ]);
      setStats(await statsRes.json());
      setLeads(await leadsRes.json());
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(id, status) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI Outreach Dashboard</h1>
        <p className="text-gray-400 mt-1">Automated client acquisition system</p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Lead Table */}
        <div className="lg:col-span-2">
          <LeadTable
            leads={leads}
            onSelect={setSelectedLead}
            onStatusChange={updateLeadStatus}
          />
        </div>

        {/* Reply Panel */}
        <div className="lg:col-span-1">
          <ReplyPanel lead={selectedLead} onRefresh={fetchData} />
        </div>
      </div>
    </main>
  );
}
