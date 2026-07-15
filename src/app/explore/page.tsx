"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/components/AppContext";
import { Search, Compass, Eye, Filter, ArrowUpDown } from "lucide-react";

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
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  // State hooks
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minGoal, setMinGoal] = useState("0");
  const [maxGoal, setMaxGoal] = useState("10000");
  const [sortBy, setSortBy] = useState<"newest" | "highest-raised" | "lowest-raised">("newest");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Categories list
  const categories = ["Technology", "Art & Design", "Community", "Health & Medical"];

  // Filter & sorting algorithm execution
  const filteredCampaigns = campaigns
    .filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.story.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
      const matchesMinGoal = c.funding_goal >= Number(minGoal);
      const matchesMaxGoal = c.funding_goal <= Number(maxGoal);
      return matchesSearch && matchesCategory && matchesMinGoal && matchesMaxGoal;
    })
    .sort((a, b) => {
      if (sortBy === "highest-raised") return b.amount_raised - a.amount_raised;
      if (sortBy === "lowest-raised") return a.amount_raised - b.amount_raised;
      return new Date(b.deadline).getTime() - new Date(a.deadline).getTime(); // default newest
    });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-950/50 border border-violet-800/40 px-3 py-1 text-xs font-semibold text-violet-400">
          <Compass className="h-3.5 w-3.5" />
          Active Listings
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Explore Campaigns</h1>
        <p className="text-xs text-slate-400 max-w-md">Find and pledge to cutting edge projects launched by global creators.</p>
      </div>

      {/* Main Exploration workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="space-y-6 rounded-3xl border border-white/[0.08] bg-[#0c0f1a]/80 p-6 h-fit backdrop-blur-md">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] text-xs font-bold text-white uppercase tracking-wider">
            <Filter className="h-4 w-4 text-violet-400" />
            Refine Search
          </div>

          {/* Search bar */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Search Keywords</label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-9 pr-4 py-2.5 text-xs text-white focus:border-violet-500 outline-none"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0c0f1a] px-3.5 py-2.5 text-xs text-white focus:border-violet-500 outline-none appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Goal ranges */}
          <div className="space-y-3.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block">Goal Range (Credits)</label>
            <div className="space-y-1">
              <span className="flex justify-between text-[10px] text-slate-400 font-semibold">Min: <strong>{minGoal}</strong></span>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={minGoal}
                onChange={(e) => setMinGoal(e.target.value)}
                className="w-full range range-xs range-primary opacity-80 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <span className="flex justify-between text-[10px] text-slate-400 font-semibold">Max: <strong>{maxGoal}</strong></span>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={maxGoal}
                onChange={(e) => setMaxGoal(e.target.value)}
                className="w-full range range-xs range-primary opacity-80 cursor-pointer"
              />
            </div>
          </div>

          {/* Sort selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Sort By</label>
            <div className="relative">
              <ArrowUpDown className="absolute top-1/2 right-3.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c0f1a] px-3.5 py-2.5 text-xs text-white focus:border-violet-500 outline-none appearance-none cursor-pointer"
              >
                <option value="newest">Newest Deadline</option>
                <option value="highest-raised">Highest Raised Credits</option>
                <option value="lowest-raised">Lowest Raised Credits</option>
              </select>
            </div>
          </div>

        </aside>

        {/* Listings Grid */}
        <section className="lg:col-span-3">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="loading loading-spinner text-violet-500"></span>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.01] p-16 text-center space-y-3">
              <Compass className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-slate-450 text-xs">No active campaigns match your selected search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredCampaigns.map((c) => {
                const percent = Math.min(100, Math.round((c.amount_raised / c.funding_goal) * 100));
                return (
                  <div
                    key={c.id}
                    className="group rounded-3xl border border-white/[0.06] bg-[#0c0f1d]/40 overflow-hidden hover:border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/3 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden">
                        <img src={c.image_url} alt={c.title} className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500" />
                        <span className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                          {c.category}
                        </span>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{c.title}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.story}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 space-y-4">
                      {/* Meter bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Raised <strong className="text-cyan-400 font-bold">{c.amount_raised}</strong> Credits</span>
                          <span className="font-semibold text-slate-350">{percent}%</span>
                        </div>
                        <div className="w-full bg-[#151829] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-0.5">
                          <span>Goal: {c.funding_goal} Credits</span>
                          <span>Min: {c.minimum_contribution} Credits</span>
                        </div>
                      </div>

                      <Link
                        href={`/campaign/${c.id}`}
                        className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] px-4 py-2.5 text-xs font-bold text-white transition-all"
                      >
                        <Eye className="h-4 w-4 text-cyan-450" />
                        View Campaign
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
