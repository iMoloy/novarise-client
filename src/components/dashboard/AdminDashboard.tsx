"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp, API_URL } from "@/components/AppContext";
import {
  Home,
  CheckSquare,
  Users,
  FolderLock,
  Flag,
  HandCoins,
  TrendingUp,
  UserCheck,
  Award,
  AlertTriangle,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url: string;
  credits: number;
  createdAt: string;
}

interface Campaign {
  id: string;
  title: string;
  story: string;
  category: string;
  funding_goal: number;
  minimum_contribution: number;
  deadline: string;
  reward_info: string;
  image_url: string;
  status: string;
  amount_raised: number;
  creator_name: string;
  creator_email: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  creator_name: string;
  creator_email: string;
  withdrawal_credit: number;
  withdrawal_amount: number;
  payment_system: string;
  account_number: string;
  status: string;
  createdAt: string;
}

interface Report {
  id: string;
  campaign_id: string;
  campaign_title: string;
  reporter_name: string;
  reporter_email: string;
  reason: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { showToast, getAuthHeaders } = useApp();
  const [activeTab, setActiveTab] = useState<"home" | "approvals" | "withdrawals" | "users" | "campaigns" | "reports">("home");

  // Admin database lists
  const [users, setUsers] = useState<UserItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch users
      const usersRes = await fetch(`${API_URL}/api/users`, {
        headers: getAuthHeaders(),
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // 2. Fetch campaigns (approved and pending separately)
      const campRes = await fetch(`${API_URL}/api/campaigns?status=pending`);
      const pendingData = await campRes.json();
      const allCampRes = await fetch(`${API_URL}/api/campaigns`);
      const approvedData = await allCampRes.json();

      const combinedCampaigns = [
        ...(pendingData.campaigns || []),
        ...(approvedData.campaigns || []),
      ];
      setCampaigns(combinedCampaigns);

      // 3. Fetch withdrawals
      const withRes = await fetch(`${API_URL}/api/withdrawals`, {
        headers: getAuthHeaders(),
      });
      if (withRes.ok) {
        const withData = await withRes.json();
        setWithdrawals(withData.withdrawals || []);
      }

      // 4. Fetch reports
      const repRes = await fetch(`${API_URL}/api/reports`, {
        headers: getAuthHeaders(),
      });
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData.reports || []);
      }

    } catch (err) {
      console.error(err);
      showToast("Failed to fetch admin dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, showToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData, activeTab]);

  // Campaign Approval/Rejection Action
  const handleCampaignReview = async (id: string, actionStatus: "approved" | "rejected") => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: actionStatus }),
      });

      if (res.ok) {
        showToast(`Campaign has been successfully ${actionStatus}!`, "success");
        fetchAdminData();
      } else {
        showToast("Failed to process campaign status.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // Withdrawal Payment Success Payout Action
  const handlePayoutSuccess = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/withdrawals`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ withdrawalId: id }),
      });

      if (res.ok) {
        showToast("Payout successfully processed!", "success");
        fetchAdminData();
      } else {
        const data = await res.json();
        showToast(data.error || "Payout processing failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // User Deletion (Remove)
  const handleRemoveUser = async (id: string) => {
    const confirmRemove = window.confirm("Are you sure you want to delete this user from the database?");
    if (!confirmRemove) return;

    try {
      const res = await fetch(`${API_URL}/api/users?userId=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        showToast("User deleted from the server.", "success");
        fetchAdminData();
      } else {
        showToast("Failed to remove user.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // User Role Update Dropdown Trigger
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        showToast("User role updated successfully!", "success");
        fetchAdminData();
      } else {
        showToast("Failed to update user role.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // Campaign Deletion
  const handleDeleteCampaign = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this campaign? Backers will be refunded.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        showToast("Campaign deleted and backers refunded.", "success");
        fetchAdminData();
      } else {
        showToast("Failed to delete campaign.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // Admin stats computations
  const totalSupportersCount = users.filter((u) => u.role === "supporter").length;
  const totalCreatorsCount = users.filter((u) => u.role === "creator").length;
  const totalAvailableCredits = users.reduce((sum, u) => sum + u.credits, 0);

  // Total payments processed from approval list (amount withdrawn by creators)
  const totalPayoutProcessed = withdrawals
    .filter((w) => w.status === "approved")
    .reduce((sum, w) => sum + w.withdrawal_amount, 0);

  const pendingCampaigns = campaigns.filter((c) => c.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-white/[0.06] bg-[#090b14]/50 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Command Center</span>
            <h2 className="text-sm font-bold text-white">Administrator Workspace</h2>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab("home"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Home className="h-4.5 w-4.5" />
              Overview Home
            </button>
            <button
              onClick={() => { setActiveTab("approvals"); }}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "approvals"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <CheckSquare className="h-4.5 w-4.5" />
                Campaign Approvals
              </span>
              {pendingCampaigns.length > 0 && (
                <span className="badge badge-sm badge-warning font-bold">{pendingCampaigns.length}</span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab("withdrawals"); }}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "withdrawals"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <HandCoins className="h-4.5 w-4.5" />
                Withdrawal Payouts
              </span>
              {pendingWithdrawals.length > 0 && (
                <span className="badge badge-sm badge-warning font-bold">{pendingWithdrawals.length}</span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab("users"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Manage Users
            </button>
            <button
              onClick={() => { setActiveTab("campaigns"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "campaigns"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <FolderLock className="h-4.5 w-4.5" />
              Manage Campaigns
            </button>
            <button
              onClick={() => { setActiveTab("reports"); }}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Flag className="h-4.5 w-4.5" />
                Flagged Reports
              </span>
              {reports.length > 0 && (
                <span className="badge badge-sm badge-error font-bold">{reports.length}</span>
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* Workspace Area */}
      <main className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto">
        
        {/* Active Tab: Home */}
        {activeTab === "home" && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">System Command Overview</h2>
              <p className="text-xs text-slate-400">Overview dashboard for global user registrations, credit metrics, and payouts.</p>
            </div>

            {/* Admin Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-2">
                <div className="inline-flex rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
                  <Users className="h-5 w-5" />
                </div>
                <span className="block text-sm text-slate-400 font-semibold">Registered Supporters</span>
                <span className="block text-2xl font-black text-white">{totalSupportersCount}</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-2">
                <div className="inline-flex rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <span className="block text-sm text-slate-400 font-semibold">Registered Creators</span>
                <span className="block text-2xl font-black text-white">{totalCreatorsCount}</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-2">
                <div className="inline-flex rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <span className="block text-sm text-slate-400 font-semibold">Global Platform Credits</span>
                <span className="block text-2xl font-black text-white">{totalAvailableCredits} Credits</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-2">
                <div className="inline-flex rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="block text-sm text-slate-400 font-semibold">Total Payouts Processed</span>
                <span className="block text-2xl font-black text-white">${totalPayoutProcessed.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick action warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#fbbf24]/20 bg-[#fbbf24]/5 p-6 flex items-start gap-4">
                <AlertTriangle className="h-10 w-10 text-[#fbbf24] shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Pending Approvals Queue</h4>
                  <p className="text-xs text-slate-400">There are {pendingCampaigns.length} campaigns and {pendingWithdrawals.length} withdrawal payout requests awaiting review.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 flex items-start gap-4">
                <Activity className="h-10 w-10 text-rose-450 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">System Reports compliance</h4>
                  <p className="text-xs text-slate-400">Supporters have reported {reports.length} campaigns for suspicious or compliance violations.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab: Campaign Approvals */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Campaign Approvals</h2>
            
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-300">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Campaign Title</th>
                    <th>Creator</th>
                    <th>Funding Goal</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {pendingCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No pending campaigns to approve.
                      </td>
                    </tr>
                  ) : (
                    pendingCampaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="font-semibold text-white">{c.title}</td>
                        <td>{c.creator_name} ({c.creator_email})</td>
                        <td className="font-bold text-cyan-400">{c.funding_goal} Credits</td>
                        <td>{new Date(c.deadline).toLocaleDateString()}</td>
                        <td className="flex gap-2">
                          <button
                            onClick={() => handleCampaignReview(c.id, "approved")}
                            className="btn btn-xs bg-emerald-600 hover:bg-emerald-550 border-0 text-white cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCampaignReview(c.id, "rejected")}
                            className="btn btn-xs bg-rose-600 hover:bg-rose-550 border-0 text-white cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Tab: Payout Approvals */}
        {activeTab === "withdrawals" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Creator Withdrawal Requests</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-300">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Creator Details</th>
                    <th>Credits Withdrawn</th>
                    <th>Amount USD</th>
                    <th>Payment Method</th>
                    <th>Account Info</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {pendingWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No pending withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    pendingWithdrawals.map((w) => (
                      <tr key={w.id}>
                        <td>{w.creator_name} ({w.creator_email})</td>
                        <td className="font-bold text-cyan-400">{w.withdrawal_credit} Cr</td>
                        <td className="font-bold text-emerald-450">${w.withdrawal_amount}</td>
                        <td>{w.payment_system}</td>
                        <td className="font-mono text-slate-450">{w.account_number}</td>
                        <td>
                          <button
                            onClick={() => handlePayoutSuccess(w.id)}
                            className="btn btn-xs bg-cyan-650 hover:bg-cyan-600 border-0 text-white cursor-pointer"
                          >
                            Payment Success
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Tab: Manage Users */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Manage System Users</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-300">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Display Info</th>
                    <th>Email Address</th>
                    <th>Role type</th>
                    <th>Credits Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No users loaded.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td className="flex items-center gap-3">
                          {u.photo_url ? (
                            <img src={u.photo_url} alt={u.name} className="h-8 w-8 rounded-full object-cover border border-white/[0.08]" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-violet-650/30 flex items-center justify-center font-bold text-violet-300">
                              {u.name.substring(0, 1)}
                            </div>
                          )}
                          <span className="font-semibold text-white">{u.name}</span>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="select select-xs rounded bg-[#070913] text-xs border border-white/[0.08] text-white focus:border-violet-500 cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="creator">Creator</option>
                            <option value="supporter">Supporter</option>
                          </select>
                        </td>
                        <td className="font-bold text-cyan-400">{u.credits} Cr</td>
                        <td>
                          <button
                            onClick={() => handleRemoveUser(u.id)}
                            className="btn btn-xs bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                          >
                            Remove User
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Tab: Manage Campaigns */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Manage Campaigns</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-300">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Title</th>
                    <th>Creator</th>
                    <th>Goal / Raised</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No campaigns found.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="font-semibold text-white">{c.title}</td>
                        <td>{c.creator_name} ({c.creator_email})</td>
                        <td className="font-bold text-cyan-400">
                          {c.amount_raised} <span className="text-slate-500 font-normal">/ {c.funding_goal} Cr</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              c.status === "approved"
                                ? "badge-success bg-emerald-950 text-emerald-300 border-emerald-800"
                                : c.status === "rejected"
                                ? "badge-error bg-rose-950 text-rose-300 border-rose-800"
                                : "badge-warning bg-amber-950 text-amber-300 border-amber-800"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteCampaign(c.id)}
                            className="btn btn-xs bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                          >
                            Delete Campaign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Tab: Reports */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Flagged Campaign Reports</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-300">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Reporter</th>
                    <th>Campaign Title</th>
                    <th>Reason</th>
                    <th>Flagged Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No campaign violation reports submitted yet.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.id}>
                        <td>{r.reporter_name} ({r.reporter_email})</td>
                        <td className="font-semibold text-white">{r.campaign_title}</td>
                        <td className="max-w-xs truncate text-rose-350">{r.reason}</td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteCampaign(r.campaign_id)}
                            className="btn btn-xs bg-rose-600 hover:bg-rose-550 border-0 text-white cursor-pointer"
                          >
                            Suspend Campaign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
