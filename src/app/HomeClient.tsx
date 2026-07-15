"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Flame, Compass, ChevronRight, CheckCircle2, ShieldCheck, HeartHandshake, TrendingUp, Users, Target, Award } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface HomeCampaign {
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

interface HomeClientProps {
  topCampaigns: HomeCampaign[];
}

export default function HomeClient({ topCampaigns }: HomeClientProps) {
  const categories = [
    { name: "Technology", count: 18, gradient: "from-cyan-500 to-blue-600" },
    { name: "Art & Design", count: 12, gradient: "from-pink-500 to-rose-600" },
    { name: "Community", count: 24, gradient: "from-emerald-400 to-teal-600" },
    { name: "Health & Medical", count: 9, gradient: "from-amber-400 to-orange-500" },
  ];

  const bannerSlides = [
    {
      title: "Fueling the Next Tech Frontier",
      subtitle: "Empower visionary inventors building the future of AI, hardware, and sustainable computing.",
      bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
      ctaText: "Discover Tech",
      ctaLink: "/explore?category=Technology",
    },
    {
      title: "Design That Inspires Change",
      subtitle: "Back creative makers publishing art, crafting sustainable designs, and producing music.",
      bgImage: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&auto=format&fit=crop&q=80",
      ctaText: "Explore Creative Arts",
      ctaLink: "/explore?category=Art+%26+Design",
    },
    {
      title: "Transforming Communities Together",
      subtitle: "Support local community-driven campaigns to build solar grids, clean water systems, and clinics.",
      bgImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1600&auto=format&fit=crop&q=80",
      ctaText: "Back Causes",
      ctaLink: "/explore?category=Community",
    },
  ];

  const testimonials = [
    {
      name: "Elizabeth Ross",
      role: "Lead Creator, SolarPump Initiative",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      quote: "NovaRise changed everything for our campaign. We raised 25,000 credits to build smart irrigation pumps in record time! The credit-based system is fast, transparent, and easy to use.",
    },
    {
      name: "Marcus Vance",
      role: "Supporter & Early Backer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      quote: "I love exploring and supporting campaigns here. The dashboard design is beautiful, and keeping track of my credits and contribution histories is incredibly simple.",
    },
    {
      name: "Sophia Martinez",
      role: "Creator, VR Learn Platform",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      quote: "The admin approval process is very secure, which gives our supporters complete peace of mind. We are already planning our next tech launch on NovaRise!",
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SLIDER */}
      <section className="relative w-full h-[650px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          className="h-full w-full"
        >
          {bannerSlides.map((slide, idx) => (
            <SwiperSlide key={idx} className="relative h-full w-full">
              <div className="absolute inset-0 z-0">
                <Image
                  src={slide.bgImage}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  className="object-cover brightness-[0.35]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-transparent"></div>
              </div>
              <div className="relative z-10 mx-auto max-w-7xl h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-3.5 font-bold text-white shadow-xl shadow-violet-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {slide.ctaText}
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. TOP FUNDED CAMPAIGNS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/50 border border-cyan-800/40 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
              <Flame className="h-3.5 w-3.5" />
              Hot Projects
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Top Funded Campaigns
            </h2>
            <p className="mt-2 text-slate-400 text-sm max-w-md">
              Discover the projects that have raised the most support from our global developer community.
            </p>
          </div>
          <Link
            href="/explore"
            className="group flex items-center gap-1.5 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Explore all campaigns
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {topCampaigns.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.01] p-12 text-center">
            <p className="text-slate-400 text-sm">No campaigns launched yet. Check back soon or seed the database!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topCampaigns.map((campaign) => {
              const percent = Math.min(
                100,
                Math.round((campaign.amount_raised / campaign.funding_goal) * 100)
              );
              return (
                <div
                  key={campaign.id}
                  className="group rounded-3xl border border-white/[0.06] bg-[#0c0f1d]/50 overflow-hidden hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      {campaign.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div className="flex-grow space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {campaign.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {campaign.story}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Raised <strong className="text-cyan-400 font-bold">{campaign.amount_raised}</strong> Credits</span>
                        <span className="font-semibold text-slate-300">{percent}%</span>
                      </div>
                      <div className="w-full bg-[#161a2d] rounded-full h-2 overflow-hidden border border-white/[0.04]">
                        <div
                          className="bg-gradient-to-r from-violet-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                        <span>Goal: {campaign.funding_goal} Credits</span>
                        <span>By {campaign.creator_name}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/campaign/${campaign.id}`}
                        className="w-full inline-flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] px-4 py-2.5 text-xs font-bold text-white transition-all"
                      >
                        View Campaign Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. EXTRA SECTION 1: HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            How NovaRise Works
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Our step-by-step credit ecosystem is secure, transparent, and built for builders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Lines for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20 -translate-y-8 z-0"></div>

          <div className="relative z-10 text-center space-y-4 group">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] group-hover:bg-violet-600/10 group-hover:border-violet-500/40 transition-all duration-300">
              <Compass className="h-7 w-7 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Discover Campaigns</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Supporters browse vetted, creative campaigns, and contribute credits towards revolutionary products they love.
            </p>
          </div>

          <div className="relative z-10 text-center space-y-4 group">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] group-hover:bg-cyan-600/10 group-hover:border-cyan-500/40 transition-all duration-300">
              <HeartHandshake className="h-7 w-7 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Launch & Pledge</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Creators upload campaigns, verify minimal pledge levels, offer unique rewards, and gain support validation.
            </p>
          </div>

          <div className="relative z-10 text-center space-y-4 group">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] group-hover:bg-fuchsia-600/10 group-hover:border-fuchsia-500/40 transition-all duration-300">
              <ShieldCheck className="h-7 w-7 text-fuchsia-400" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Secure Cashouts</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Once campaigns succeed and contributions are approved, creators withdraw funds securely to their payment accounts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. EXTRA SECTION 2: EXPLORE BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-[#0c0f1d]/40 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
                Explore by Category
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Easily filter projects based on your primary interests. Check out cutting-edge gadgets, community welfare, and artistic designs.
              </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 gap-4">
              {categories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="space-y-1">
                    <span className="block font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                      {cat.name}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {cat.count} Active Projects
                    </span>
                  </div>
                  <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r ${cat.gradient} group-hover:w-full transition-all duration-500`}></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXTRA SECTION 3: PLATFORM IMPACT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 text-center space-y-2">
            <div className="inline-flex rounded-xl bg-violet-500/10 p-3 text-violet-400 mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="block text-2xl font-black text-white">450K+</span>
            <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Credits Contributed</span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 text-center space-y-2">
            <div className="inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-400 mb-2">
              <Users className="h-5 w-5" />
            </div>
            <span className="block text-2xl font-black text-white">12,000+</span>
            <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active Members</span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 text-center space-y-2">
            <div className="inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-400 mb-2">
              <Target className="h-5 w-5" />
            </div>
            <span className="block text-2xl font-black text-white">98%</span>
            <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Success Campaign Rate</span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0f1d]/30 p-6 text-center space-y-2">
            <div className="inline-flex rounded-xl bg-amber-500/10 p-3 text-amber-400 mb-2">
              <Award className="h-5 w-5" />
            </div>
            <span className="block text-2xl font-black text-white">85</span>
            <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Funded Tech Startups</span>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS (SWIPER) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Backed by Satisfied Users
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Read stories of how creators and supporters are succeeding together.
          </p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="pb-12"
          >
            {testimonials.map((test, idx) => (
              <SwiperSlide key={idx}>
                <div className="h-full rounded-3xl border border-white/[0.06] bg-[#0c0f1d]/40 p-8 space-y-5 flex flex-col justify-between">
                  <p className="text-slate-300 text-xs leading-relaxed italic">
                    "{test.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={test.image}
                      alt={test.name}
                      className="h-10 w-10 rounded-full object-cover border border-violet-500/30"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white">{test.name}</span>
                      <span className="block text-[10px] text-slate-500">{test.role}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}
