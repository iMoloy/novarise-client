"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp, API_URL } from "@/components/AppContext";
import { Calendar, Users, Award, ShieldAlert, Heart, Info, DollarSign } from "lucide-react";

interface CampaignDetail {
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

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user, showToast, getAuthHeaders, refreshUser } = useApp();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Contribute & Flag Form State
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign || null);
      } else {
        showToast("Campaign not found.", "error");
        router.push("/explore");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error loading campaign details.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, router, showToast]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to pledge support.", "warning");
      router.push("/login");
      return;
    }

    if (user.role !== "supporter") {
      showToast("Only Supporter accounts can pledge credits to campaigns.", "error");
      return;
    }

    if (!campaign) return;

    const amount = Number(pledgeAmount);
    if (!pledgeAmount || amount <= 0) {
      showToast("Please enter a valid credit amount.", "error");
      return;
    }

    if (amount < campaign.minimum_contribution) {
      showToast(`Minimum pledge is ${campaign.minimum_contribution} credits.`, "error");
      return;
    }

    if (amount > user.credits) {
      showToast("Insufficient credit balance. Purchase credits in your dashboard first.", "error");
      return;
    }

    setIsSubmittingPledge(true);
    try {
      const res = await fetch(`${API_URL}/api/contributions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          campaign_id: campaign.id,
          contribution_amount: amount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Contribution pledged! Awaiting Creator approval.", "success");
        setPledgeAmount("");
        await refreshUser();
        fetchCampaign();
      } else {
        showToast(data.error || "Failed to make contribution.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error processing pledge.", "error");
    } finally {
      setIsSubmittingPledge(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to submit report.", "warning");
      router.push("/login");
      return;
    }

    if (!campaign || !reportReason) return;

    setIsSubmittingReport(true);
    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          campaign_id: campaign.id,
          reason: reportReason,
        }),
      });

      if (res.ok) {
        showToast("Campaign reported. Administrators will evaluate compliance.", "success");
        setReportReason("");
        setShowReportModal(false);
      } else {
        showToast("Failed to file compliance report.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error filing report.", "error");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <span className="loading loading-spinner text-violet-500"></span>
      </div>
    );
  }

  if (!campaign) return null;

  const percentRaised = Math.min(100, Math.round((campaign.amount_raised / campaign.funding_goal) * 100));
  const isExpired = new Date(campaign.deadline) < new Date();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative overflow-hidden">
      
      {/* Background neon elements */}
      <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-cyan-600/5 blur-3xl z-0"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Side: Campaign Cover and story details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-96 w-full rounded-3xl overflow-hidden border border-white/[0.08]">
            <img src={campaign.image_url} alt={campaign.title} className="h-full w-full object-cover" />
            <span className="absolute top-4 right-4 rounded-full bg-black/60 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
              {campaign.category}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white leading-snug">{campaign.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-cyan-400" />
                By {campaign.creator_name} ({campaign.creator_email})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-violet-400" />
                Deadline: {new Date(campaign.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          <hr className="border-white/[0.06]" />

          <article className="space-y-3.5 text-slate-300 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-white">Campaign Story</h3>
            <p className="whitespace-pre-line">{campaign.story}</p>
          </article>

          <hr className="border-white/[0.06]" />

          {/* Reward Details Box */}
          <div className="rounded-2xl border border-violet-500/10 bg-violet-650/5 p-6 space-y-3">
            <h4 className="text-xs font-bold text-violet-400 flex items-center gap-1.5 uppercase">
              <Award className="h-4.5 w-4.5" />
              Supporter Rewards & Perks
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {campaign.reward_info}
            </p>
          </div>
        </div>

        {/* Right Side: Progress indicator and contribution form */}
        <div className="space-y-6">
          
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0f1a]/80 p-8 space-y-6 backdrop-blur-md">
            
            {/* Progress indicators */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="block text-2xl font-black text-cyan-400">{campaign.amount_raised}</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Credits Raised</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-350">{percentRaised}% funded</span>
                  <span className="block text-[10px] text-slate-500">Goal: {campaign.funding_goal} credits</span>
                </div>
              </div>

              <div className="w-full bg-[#151829] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentRaised}%` }}
                ></div>
              </div>
            </div>

            {/* Date validation indicator */}
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5 text-[11px] text-slate-300">
              <Info className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
              {isExpired ? (
                <span className="text-rose-400 font-semibold">This campaign has ended. Pledges are closed.</span>
              ) : (
                <span>Contributions close on <strong>{new Date(campaign.deadline).toLocaleDateString()}</strong>.</span>
              )}
            </div>

            {/* Pledge submission Form */}
            {!isExpired && (
              <form onSubmit={handlePledgeSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">Pledge Credits Support</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={campaign.minimum_contribution}
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                      placeholder={`Min. ${campaign.minimum_contribution} Credits`}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-violet-500 outline-none"
                    />
                  </div>
                  {user && (
                    <span className="block text-[10px] text-slate-500 font-semibold">
                      Your Available Balance: <strong className="text-cyan-400 font-bold">{user.credits}</strong> Credits
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPledge}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Heart className="h-4 w-4 shrink-0 fill-current" />
                  Pledge Support
                </button>
              </form>
            )}

            {/* Flag campaign */}
            <div className="pt-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-450 hover:text-rose-400 transition-colors py-1 cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                Report Suspicious Campaign
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* MODAL: Compliance violation report */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0c0f1a] p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Report Campaign
              </h3>
              <p className="text-xs text-slate-450 mt-1">Please provide details regarding campaign violations (suspicious fraud, misleading perks, copycat materials).</p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for flag (minimum 10 characters)..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-white focus:border-violet-500 outline-none resize-none"
              />

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="rounded-xl bg-rose-600 hover:bg-rose-550 px-5 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
