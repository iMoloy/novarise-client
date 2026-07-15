"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp, API_URL } from "@/components/AppContext";
import {
  Coins,
  History,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Contribution {
  id: string;
  campaign_title: string;
  contribution_amount: number;
  status: string;
  createdAt: string;
}

interface PaymentHistoryItem {
  id: string;
  credits_purchased: number;
  amount_paid: number;
  payment_date: string;
  status: string;
}

export default function SupporterDashboard() {
  const { user, showToast, refreshUser, getAuthHeaders } = useApp();
  const [activeTab, setActiveTab] = useState<"contributions" | "buy" | "history">("contributions");

  // State lists
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination states for contributions
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Buy credits state
  const [selectedPackage, setSelectedPackage] = useState<{ credits: number; price: number } | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchSupporterData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch contributions with pagination
      const contribRes = await fetch(
        `${API_URL}/api/contributions?page=${currentPage}&limit=5`,
        { headers: getAuthHeaders() }
      );
      if (contribRes.ok) {
        const contribData = await contribRes.json();
        setContributions(contribData.contributions || []);
        if (contribData.pagination) {
          setTotalPages(contribData.pagination.totalPages || 1);
        }
      }

      // 2. Fetch checkout payments history
      const paymentsRes = await fetch(`${API_URL}/api/payment/checkout`, {
        headers: getAuthHeaders(),
      });
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments || []);
      }

    } catch (err) {
      console.error(err);
      showToast("Error loading supporter dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, getAuthHeaders, showToast]);

  useEffect(() => {
    fetchSupporterData();
  }, [fetchSupporterData, activeTab]);

  // Credit Packages list
  const creditPackages = [
    { credits: 100, price: 10, popular: false },
    { credits: 500, price: 45, popular: true }, // 10% discount
    { credits: 1000, price: 80, popular: false }, // 20% discount
  ];

  // Process Mock Checkout Payment
  const handlePaymentCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !cardNumber || !cardExpiry || !cardCVC) {
      showToast("Please enter complete card details.", "error");
      return;
    }

    setProcessingPayment(true);
    try {
      const res = await fetch(`${API_URL}/api/payment/checkout`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          credits: selectedPackage.credits,
          price: selectedPackage.price,
        }),
      });

      if (res.ok) {
        showToast(`Successfully purchased ${selectedPackage.credits} credits!`, "success");
        setSelectedPackage(null);
        setCardNumber("");
        setCardExpiry("");
        setCardCVC("");
        setActiveTab("contributions");
        await refreshUser();
      } else {
        showToast("Payment failed. Please check card inputs.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error during payment processing.", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-white/[0.06] bg-[#090b14]/50 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Supporter Workspace</span>
            <h2 className="text-sm font-bold text-white">Supporter Dashboard</h2>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab("contributions"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "contributions"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              My Pledges
            </button>
            <button
              onClick={() => { setActiveTab("buy"); }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "buy"
                  ? "bg-violet-600/10 border border-violet-500/30 text-violet-400"
                  : "border border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Coins className="h-4.5 w-4.5" />
              Buy Credits
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

      {/* Main Workspace Panel */}
      <main className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto">
        
        {/* Active Tab: Contributions (Pledges list) */}
        {activeTab === "contributions" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">Hello, Supporter {user?.name}!</h2>
              <p className="text-xs text-slate-400 font-medium">Monitor your contribution approvals and campaign pledges.</p>
            </div>

            {/* List */}
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
                <table className="table table-zebra w-full text-slate-350">
                  <thead className="bg-white/[0.02] text-xs text-white">
                    <tr>
                      <th>Pledge Date</th>
                      <th>Campaign Title</th>
                      <th>Contributed Credits</th>
                      <th>Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center">
                          <span className="loading loading-spinner text-violet-500"></span>
                        </td>
                      </tr>
                    ) : contributions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold">
                          You haven't supported any campaigns yet.
                        </td>
                      </tr>
                    ) : (
                      contributions.map((c) => (
                        <tr key={c.id}>
                          <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="font-semibold text-white">{c.campaign_title}</td>
                          <td className="font-bold text-cyan-400">{c.contribution_amount} Credits</td>
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    className="btn btn-xs btn-outline border-white/[0.08] text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <span className="text-xs text-slate-450 self-center font-bold px-1.5">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                    className="btn btn-xs btn-outline border-white/[0.08] text-white disabled:opacity-30 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Tab: Buy Credits */}
        {activeTab === "buy" && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">Buy Credits</h2>
              <p className="text-xs text-slate-450">Deposit credits to fund revolutionary developer launchpads. 10 Credits = $1.</p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
              {creditPackages.map((pkg, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`rounded-2xl border p-6 flex flex-col justify-between items-center text-center relative cursor-pointer transition-all duration-300 ${
                    selectedPackage?.credits === pkg.credits
                      ? "bg-violet-600/10 border-violet-500 shadow-xl shadow-violet-500/5"
                      : "border-white/[0.06] bg-[#0c0f1d]/30 hover:border-white/[0.12]"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-[9px] font-black text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Popular (Save 10%)
                    </span>
                  )}
                  <div className="space-y-1">
                    <span className="block text-2xl font-black text-white">{pkg.credits} Credits</span>
                    <span className="block text-xs text-slate-400">Pledge level capacity</span>
                  </div>
                  <div className="pt-6">
                    <span className="text-3xl font-black text-cyan-400">${pkg.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment form */}
            {selectedPackage && (
              <form onSubmit={handlePaymentCheckout} className="rounded-3xl border border-white/[0.08] bg-[#0c0f1a]/85 p-8 max-w-md space-y-5 relative overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Payment Checkouts</h3>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4.5 flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Credits Purchased</span>
                  <span className="font-bold text-white">{selectedPackage.credits} Credits</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-11 pr-4 py-3 text-xs text-white focus:border-violet-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs text-white focus:border-violet-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">CVC Code</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        placeholder="•••"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs text-white focus:border-violet-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Processing Payout...
                    </>
                  ) : (
                    `Pay $${selectedPackage.price}.00`
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Active Tab: Payment History (Deposit Logs) */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Credits Purchase History</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/20">
              <table className="table table-zebra w-full text-slate-350">
                <thead className="bg-white/[0.02] text-xs text-white">
                  <tr>
                    <th>Purchase Date</th>
                    <th>Credits Deposited</th>
                    <th>Amount Paid ($)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No credit transaction records found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="font-bold text-cyan-400">+{p.credits_purchased} Credits</td>
                        <td className="font-semibold text-slate-200">${p.amount_paid}.00</td>
                        <td>
                          <span className="badge badge-success bg-emerald-950 text-emerald-300 border-emerald-800 flex items-center gap-1 text-[10px]">
                            <CheckCircle className="h-3 w-3" />
                            {p.status}
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
    </div>
  );
}
