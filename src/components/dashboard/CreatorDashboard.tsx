"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp, API_URL } from "@/components/AppContext";
import {
  Home,
  PlusCircle,
  FolderHeart,
  Wallet,
  History,
  TrendingUp,
  Flame,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Edit,
  Image as ImageIcon,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

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
}

interface Contribution {
  id: string;
  campaign_id: string;
  campaign_title: string;
  contribution_amount: number;
  supporter_name: string;
  supporter_email: string;
  creator_name: string;
  creator_email: string;
  status: string;
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

export default function CreatorDashboard() {
  const { user, showToast, refreshUser, getAuthHeaders } = useApp();
  const [activeTab, setActiveTab] = useState<"home" | "add" | "my-campaigns" | "withdrawals" | "history">("home");

  // State lists
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);

  // Forms and Modals state
  const [activeContributionDetail, setActiveContributionDetail] = useState<Contribution | null>(null);
  
  // Campaign Add Form State
  const [campTitle, setCampTitle] = useState("");
  const [campStory, setCampStory] = useState("");
  const [campCategory, setCampCategory] = useState("Technology");
  const [campGoal, setCampGoal] = useState("");
  const [campMinContribution, setCampMinContribution] = useState("");
  const [campDeadline, setCampDeadline] = useState("");
  const [campReward, setCampReward] = useState("");
  const [campImage, setCampImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Campaign Update Form State
  const [updatingCampaign, setUpdatingCampaign] = useState<Campaign | null>(null);
  const [upTitle, setUpTitle] = useState("");
  const [upStory, setUpStory] = useState("");
  const [upReward, setUpReward] = useState("");

  // Withdrawal Form State
  const [withdrawCredits, setWithdrawCredits] = useState("");
  const [withdrawSystem, setWithdrawSystem] = useState("Stripe");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);

  const fetchCreatorData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch campaigns for this creator
      const campRes = await fetch(`${API_URL}/api/campaigns?creatorEmail=${user.email}`);
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }

      // 2. Fetch pending contributions to review
      const contRes = await fetch(`${API_URL}/api/contributions?status=pending`, {
        headers: getAuthHeaders(),
      });
      if (contRes.ok) {
        const contData = await contRes.json();
        setPendingContributions(contData.contributions || []);
      }

      // 3. Fetch withdrawals history
      const withRes = await fetch(`${API_URL}/api/withdrawals`, {
        headers: getAuthHeaders(),
      });
      if (withRes.ok) {
        const withData = await withRes.json();
        setWithdrawals(withData.withdrawals || []);
      }

    } catch (err) {
      console.error(err);
      showToast("Error loading creator workspace.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders, showToast]);

  useEffect(() => {
    fetchCreatorData();
  }, [fetchCreatorData, activeTab]);

  // Image Upload handler (with optional ImgBB or Base64 fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (apiKey) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setCampImage(data.data.url);
          showToast("Image uploaded successfully to ImgBB!", "success");
          setUploadingImage(false);
          return;
        }
      }

      // Fallback: Base64 local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCampImage(reader.result as string);
        showToast("Image loaded (Base64 local storage fallback)!", "info");
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error(err);
      showToast("Failed to upload image.", "error");
      setUploadingImage(false);
    }
  };

  // Add Campaign Submit
  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || !campStory || !campGoal || !campMinContribution || !campDeadline || !campReward || !campImage) {
      showToast("All fields are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: campTitle,
          story: campStory,
          category: campCategory,
          funding_goal: Number(campGoal),
          minimum_contribution: Number(campMinContribution),
          deadline: campDeadline,
          reward_info: campReward,
          image_url: campImage,
        }),
      });

      if (res.ok) {
        showToast("Campaign submitted successfully! Pending Admin approval.", "success");
        // Reset form
        setCampTitle("");
        setCampStory("");
        setCampGoal("");
        setCampMinContribution("");
        setCampDeadline("");
        setCampReward("");
        setCampImage("");
        setActiveTab("my-campaigns");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create campaign.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update Campaign Details Submit
  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingCampaign) return;

    try {
      const res = await fetch(`${API_URL}/api/campaigns/${updatingCampaign.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: upTitle,
          story: upStory,
          reward_info: upReward,
        }),
      });

      if (res.ok) {
        showToast("Campaign details updated successfully!", "success");
        setUpdatingCampaign(null);
        fetchCreatorData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update campaign details.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // Delete Campaign Submit
  const handleDeleteCampaign = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this campaign? This will delete the campaign from the platform and refund all approved backers!"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        showToast("Campaign deleted successfully. Backers refunded.", "success");
        fetchCreatorData();
        await refreshUser();
      } else {
        showToast("Failed to delete campaign.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // Approve Contribution
  const handleApproveContribution = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/contributions`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contributionId: id,
          action: "approve",
        }),
      });

      if (res.ok) {
        showToast("Contribution approved successfully!", "success");
        setActiveContributionDetail(null);
        fetchCreatorData();
        await refreshUser();
      } else {
        showToast("Failed to approve contribution.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // Reject Contribution
  const handleRejectContribution = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/contributions`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contributionId: id,
          action: "reject",
        }),
      });

      if (res.ok) {
        showToast("Contribution rejected and supporter refunded.", "success");
        setActiveContributionDetail(null);
        fetchCreatorData();
        await refreshUser();
      } else {
        showToast("Failed to reject contribution.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    }
  };

  // Withdrawal Submit
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawCredits || !withdrawAccount) {
      showToast("Please enter credit amount and account number.", "error");
      return;
    }

    setRequestingWithdrawal(true);
    try {
      const res = await fetch(`${API_URL}/api/withdrawals`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          credits_to_withdraw: Number(withdrawCredits),
          payment_system: withdrawSystem,
          account_number: withdrawAccount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Withdrawal request submitted! Pending Admin payout.", "success");
        setWithdrawCredits("");
        setWithdrawAccount("");
        fetchCreatorData();
      } else {
        showToast(data.error || "Failed to submit request.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    } finally {
      setRequestingWithdrawal(false);
    }
  };

  // Creator stats calculations
  const totalCampaignsCount = campaigns.length;
  const activeCampaignsCount = campaigns.filter(
    (c) => c.status === "approved" && new Date(c.deadline) >= new Date()
  ).length;
  const totalAmountRaised = campaigns.reduce((sum, c) => sum + c.amount_raised, 0);

  // Business calculations for withdrawals (20 credits = $1)
  const creatorRaisedCredits = user?.credits || 0;
  const withdrawableAmountDollars = creatorRaisedCredits / 20;

  const currentWithdrawCredits = Number(withdrawCredits) || 0;
  const computedWithdrawDollars = currentWithdrawCredits / 20;

  // Check if creator has minimum credits to withdraw (min 200 credits = $10)
  const canRequestWithdraw = creatorRaisedCredits >= 200;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-white/[0.06] bg-[#090b14]/50 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Workspace</span>
            <h2 className="text-sm font-bold text-white">Creator Dashboard</h2>
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
              Workspace Home
            </button>
            <button
              onClick={() => { setActiveTab("add"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "add"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Add New Campaign
            </button>
            <button
              onClick={() => { setActiveTab("my-campaigns"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "my-campaigns"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <FolderHeart className="h-4.5 w-4.5" />
              My Campaigns
            </button>
            <button
              onClick={() => { setActiveTab("withdrawals"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "withdrawals"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Wallet className="h-4.5 w-4.5" />
              Withdrawals
            </button>
            <button
              onClick={() => { setActiveTab("history"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <History className="h-4.5 w-4.5" />
              Payment History
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
              <h2 className="text-xl font-extrabold text-white">Hello, Creator {user?.name}!</h2>
              <p className="text-xs text-slate-400">Manage campaign milestones, approvals, and review backer contributions.</p>
            </div>

            {/* Statistics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-2">
                <div className="inline-flex rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
                  <Flame className="h-5 w-5" />
                </div>
                <span className="block text-sm text-slate-400 font-semibold">Total Campaigns Launched</span>
                <span className="block text-2xl font-black text-white">{totalCampaignsCount}</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-2">
                <div className="inline-flex rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="block text-sm text-slate-400 font-semibold">Active Campaigns</span>
                <span className="block text-2xl font-black text-white">{activeCampaignsCount}</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-2">
                <div className="inline-flex rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="block text-sm text-slate-400 font-semibold">Total Raised Credits</span>
                <span className="block text-2xl font-black text-white">{totalAmountRaised} Credits</span>
              </div>
            </div>

            {/* Contributions to Review */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Pending Contributions to Review</h3>
              <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
                <table className="table table-zebra w-full text-slate-300">
                  <thead className="bg-white/[0.02] text-xs text-white">
                    <tr>
                      <th>Supporter Name</th>
                      <th>Campaign Title</th>
                      <th>Pledged Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {pendingContributions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No pending contributions to review.
                        </td>
                      </tr>
                    ) : (
                      pendingContributions.map((c) => (
                        <tr key={c.id}>
                          <td>{c.supporter_name}</td>
                          <td className="font-semibold text-white">{c.campaign_title}</td>
                          <td className="font-bold text-cyan-400">{c.contribution_amount} Credits</td>
                          <td className="flex gap-2">
                            <button
                              onClick={() => setActiveContributionDetail(c)}
                              className="btn btn-xs btn-outline border-white/[0.08] text-white hover:bg-white/[0.04] cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleApproveContribution(c.id)}
                              className="btn btn-xs bg-emerald-600 hover:bg-emerald-550 border-0 text-white cursor-pointer"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectContribution(c.id)}
                              className="btn btn-xs bg-rose-600 hover:bg-rose-550 border-0 text-white cursor-pointer"
                            >
                              <XCircle className="h-3 w-3" />
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
          </div>
        )}

        {/* Active Tab: Add New Campaign */}
        {activeTab === "add" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Add New Campaign</h2>
            <form onSubmit={handleAddCampaign} className="rounded-3xl border border-white/[0.08] bg-[#0c0f1a]/80 p-8 space-y-6 max-w-2xl relative">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={campTitle}
                    onChange={(e) => setCampTitle(e.target.value)}
                    placeholder="E.g., Solar Powered Water Pump Development"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">Campaign Story / Description</label>
                  <textarea
                    required
                    rows={5}
                    value={campStory}
                    onChange={(e) => setCampStory(e.target.value)}
                    placeholder="Describe your project story, features, timeline, and how funding will be used..."
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-white focus:border-violet-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={campCategory}
                    onChange={(e) => setCampCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0c0f1a] px-4 py-3 text-sm text-white focus:border-violet-500 transition-all outline-none appearance-none"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Art & Design">Art & Design</option>
                    <option value="Community">Community</option>
                    <option value="Health & Medical">Health & Medical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Funding Goal (Credits)</label>
                  <input
                    type="number"
                    required
                    value={campGoal}
                    onChange={(e) => setCampGoal(e.target.value)}
                    placeholder="1000"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Minimum Contribution (Credits)</label>
                  <input
                    type="number"
                    required
                    value={campMinContribution}
                    onChange={(e) => setCampMinContribution(e.target.value)}
                    placeholder="10"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={campDeadline}
                    onChange={(e) => setCampDeadline(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 focus:border-violet-500 transition-all outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">Rewards Details for Pledging</label>
                  <textarea
                    required
                    rows={2}
                    value={campReward}
                    onChange={(e) => setCampReward(e.target.value)}
                    placeholder="What supporters receive for backing the campaign (E.g., Early Access Code)..."
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-white focus:border-violet-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">Campaign Cover Image URL / Upload</label>
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-grow">
                      <ImageIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 py-2.5 text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-violet-950/40 file:text-violet-400 hover:file:bg-violet-950/60 transition-all outline-none cursor-pointer"
                      />
                    </div>
                    {campImage && (
                      <img src={campImage} alt="Cover Preview" className="h-10 w-16 object-cover rounded-lg border border-white/[0.08]" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                Submit New Campaign
              </button>
            </form>
          </div>
        )}

        {/* Active Tab: My Campaigns */}
        {activeTab === "my-campaigns" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">My Campaigns</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-300">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Campaign Title</th>
                    <th>Raised / Goal</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        You haven't added any campaigns yet.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="font-semibold text-white">{c.title}</td>
                        <td className="font-bold text-cyan-400">
                          {c.amount_raised} <span className="text-slate-500 font-normal">/ {c.funding_goal} Cr</span>
                        </td>
                        <td>{new Date(c.deadline).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`font-semibold capitalize ${
                              c.status === "approved"
                                ? "text-emerald-400"
                                : c.status === "rejected"
                                ? "text-rose-400"
                                : "text-amber-400"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="flex gap-2">
                          <button
                            onClick={() => {
                              setUpdatingCampaign(c);
                              setUpTitle(c.title);
                              setUpStory(c.story);
                              setUpReward(c.reward_info);
                            }}
                            className="btn btn-xs btn-outline border-white/[0.08] text-white hover:bg-white/[0.04] cursor-pointer"
                          >
                            <Edit className="h-3 w-3" />
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(c.id)}
                            className="btn btn-xs bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
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

        {/* Active Tab: Withdrawals */}
        {activeTab === "withdrawals" && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">Withdraw Funds</h2>
              <p className="text-xs text-slate-400">Convert your campaign raised credits into real payout dollars. (20 Credits = $1)</p>
            </div>

            {/* Total earnings cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-1.5">
                <span className="block text-xs text-slate-400 font-semibold uppercase">Total Raised Credits</span>
                <span className="block text-2xl font-black text-cyan-400">{creatorRaisedCredits} Credits</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 space-y-1.5">
                <span className="block text-xs text-slate-400 font-semibold uppercase">Withdrawable Amount ($)</span>
                <span className="block text-2xl font-black text-emerald-400">${withdrawableAmountDollars}</span>
              </div>
            </div>

            {/* Withdrawal request form */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c0f1a]/85 p-8 max-w-md relative overflow-hidden">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-6">Withdrawal Form</h3>

              {canRequestWithdraw ? (
                <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Credits to Withdraw</label>
                    <input
                      type="number"
                      required
                      min={200}
                      max={creatorRaisedCredits}
                      value={withdrawCredits}
                      onChange={(e) => setWithdrawCredits(e.target.value)}
                      placeholder="Min. 200 Credits"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-violet-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Withdraw Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        disabled
                        value={computedWithdrawDollars.toFixed(2)}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.01] pl-10 pr-4 py-3 text-sm text-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Select Payment System</label>
                    <select
                      value={withdrawSystem}
                      onChange={(e) => setWithdrawSystem(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0c0f1a] px-4 py-3 text-sm text-white focus:border-violet-500 transition-all outline-none appearance-none"
                    >
                      <option value="Stripe">Stripe (Direct Card Checkout)</option>
                      <option value="Bkash">bKash (Mobile Account)</option>
                      <option value="Nagad">Nagad (Mobile Account)</option>
                      <option value="Rocket">Rocket (Mobile Account)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Account Number / Details</label>
                    <input
                      type="text"
                      required
                      placeholder="Account Number or Card Info"
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-violet-500 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={requestingWithdrawal}
                    className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {requestingWithdrawal && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                    Withdraw Credits
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-5 text-center text-rose-300 text-xs font-semibold space-y-2">
                  <AlertTriangle className="h-6 w-6 text-rose-400 mx-auto" />
                  <p>Insufficient credit.</p>
                  <p className="text-[10px] text-slate-400 font-medium">You need a minimum of 200 raised credits ($10.00) in order to request a withdrawal payout.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Tab: Payment History (Withdrawal History) */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Withdrawal History</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-300">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Requested Date</th>
                    <th>Credits Withdrawn</th>
                    <th>Amount Paid ($)</th>
                    <th>Method</th>
                    <th>Account Info</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No withdrawal transactions found.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="font-bold text-cyan-400">{w.withdrawal_credit} Cr</td>
                        <td className="font-semibold text-slate-200">${w.withdrawal_amount}</td>
                        <td>{w.payment_system}</td>
                        <td className="font-mono text-slate-400">{w.account_number}</td>
                        <td>
                          <span
                            className={`font-semibold capitalize ${
                              w.status === "approved"
                                ? "text-emerald-400"
                                : w.status === "rejected"
                                ? "text-rose-400"
                                : "text-amber-400"
                            }`}
                          >
                            {w.status}
                          </span>
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

      {/* MODAL: View Contribution message details */}
      {activeContributionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0c0f1a] p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-white">Contribution Review</h3>
            
            <div className="space-y-3.5 text-xs text-slate-300 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 leading-relaxed">
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Backer Name</span>
                <span className="font-semibold text-white">{activeContributionDetail.supporter_name} ({activeContributionDetail.supporter_email})</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Campaign Destination</span>
                <span className="font-semibold text-white">{activeContributionDetail.campaign_title}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Pledged Credits</span>
                <span className="font-bold text-cyan-400">{activeContributionDetail.contribution_amount} Credits</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Submission Date</span>
                <span>{new Date(activeContributionDetail.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActiveContributionDetail(null)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleRejectContribution(activeContributionDetail.id)}
                className="rounded-xl bg-rose-600 hover:bg-rose-550 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Reject Pledges
              </button>
              <button
                onClick={() => handleApproveContribution(activeContributionDetail.id)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-550 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Approve & Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Update Campaign Details */}
      {updatingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0c0f1a] p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white">Update Campaign Details</h3>

            <form onSubmit={handleUpdateCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={upTitle}
                  onChange={(e) => setUpTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-violet-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Story / Full Description</label>
                <textarea
                  required
                  rows={4}
                  value={upStory}
                  onChange={(e) => setUpStory(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-white focus:border-violet-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Reward Pledge Description</label>
                <textarea
                  required
                  rows={2}
                  value={upReward}
                  onChange={(e) => setUpReward(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-white focus:border-violet-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingCampaign(null)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 hover:bg-violet-550 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
