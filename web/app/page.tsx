"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  Zap,
  Trophy,
  Newspaper,
  Bookmark,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Building2,
  GraduationCap,
  MapPin,
  TrendingUp,
  FileText,
  GitCompare,
  Mic,
  Shield,
  ChevronRight,
  Compass,
  ArrowUpRight,
  Layers,
  Star
} from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

const SUGGESTIONS = [
  "Compare IIT Bombay vs IIT Delhi for Computer Science",
  "Top Engineering colleges in Bangalore with 95+ percentile",
  "Average package and placements at NIT Trichy 2024",
  "Predict my admission chance with 94.2 percentile in JEE",
  "Top Medical colleges in Maharashtra with government quota",
];

const FEATURED_COLLEGES = [
  {
    name: "IIT Bombay",
    location: "Mumbai, Maharashtra",
    rank: "#1 Engineering",
    avgPackage: "₹21.8 LPA",
    highestPackage: "₹1.68 CPA",
    badge: "NIRF Top Tier",
    slug: "mumbai",
  },
  {
    name: "IISc Bangalore",
    location: "Bangalore, Karnataka",
    rank: "#1 Overall University",
    avgPackage: "₹28.0 LPA",
    highestPackage: "₹85.0 LPA",
    badge: "Research Premier",
    slug: "bangalore",
  },
  {
    name: "IIT Delhi",
    location: "New Delhi, Delhi",
    rank: "#2 Engineering",
    avgPackage: "₹20.5 LPA",
    highestPackage: "₹1.50 CPA",
    badge: "Top Placement",
    slug: "delhi",
  },
  {
    name: "AIIMS New Delhi",
    location: "New Delhi, Delhi",
    rank: "#1 Medical",
    avgPackage: "₹18.0 LPA",
    highestPackage: "₹50.0 LPA",
    badge: "Medical Pioneer",
    slug: "delhi",
  },
];

const TOP_CITIES = [
  { name: "Delhi NCR", count: "140+ Colleges", slug: "delhi" },
  { name: "Bangalore", count: "95+ Colleges", slug: "bangalore" },
  { name: "Mumbai", count: "80+ Colleges", slug: "mumbai" },
  { name: "Chennai", count: "70+ Colleges", slug: "chennai" },
  { name: "Pune", count: "65+ Colleges", slug: "pune" },
  { name: "Hyderabad", count: "60+ Colleges", slug: "hyderabad" },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (prompt: string) => {
    router.push(`/chat?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Soft modern ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none opacity-40 blur-3xl -z-10 bg-gradient-to-tr from-indigo-200 via-sky-100 to-violet-100" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-indigo-600 font-bold">Neural-V8 RAG Engine</span>
            <span className="text-slate-300">•</span>
            <span>2024-25 NIRF & Cutoff Intelligence</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Explore Indian Academia with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
              Intelligent Precision
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed mb-10"
          >
            Instant answers on admissions, cutoff percentiles, placement metrics, and side-by-side institutional comparisons across 2,500+ colleges.
          </motion.p>

          {/* Interactive Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="max-w-3xl mx-auto mb-6"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10"
            >
              <div className="pl-3 text-slate-400">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything (e.g. Compare IIT Bombay vs IIT Delhi fees and placements)..."
                className="w-full px-3 py-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent outline-none"
              />
              <button
                type="submit"
                className="shrink-0 flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-indigo-500/20"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-400 mr-1">Trending queries:</span>
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 text-xs text-slate-600 transition-colors shadow-2xs"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
            >
              <Brain size={16} />
              <span>Launch AI Chat</span>
            </Link>
            <Link
              href="/predictor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
            >
              <Zap size={16} className="text-amber-500" />
              <span>Admission Predictor</span>
            </Link>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
            >
              <Trophy size={16} className="text-indigo-500" />
              <span>NIRF Rankings Matrix</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Key Metrics Ribbon ── */}
      <section className="border-y border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">2,500+</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Indexed Institutions</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-indigo-600 tracking-tight">1M+</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cutoff Records</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">2024-25</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">NIRF Data Synchronized</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">100% Free</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open for Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Feature Showcase ── */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider border border-indigo-100">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Everything You Need for Confident Academic Decisions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Engineered with deep multi-source indexing, neural reasoning, and real-time updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Chat Assistant */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Neural RAG Chatbot
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ask questions in plain English or 10+ Indian languages. Features PDF brochure uploads, live Tavily web research, and cited sources.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Brochure OCR & Document QA
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Voice Input & Audio Readback
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Direct Web Link Citations
                </li>
              </ul>
            </div>
            <Link
              href="/chat"
              className="mt-8 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Explore Chatbot</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Predictor */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Cutoff & Fit Predictor
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Estimate your admission probability into top programs across JEE Main, Advanced, NEET, CAT, and state counseling cycles.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-500" />
                  Multi-exam Rank Forecasting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-500" />
                  Category & Quota Calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-500" />
                  Historical Trend Deviation
                </li>
              </ul>
            </div>
            <Link
              href="/predictor"
              className="mt-8 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              <span>Run Predictor</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: Rankings Matrix */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                NIRF Rankings Matrix
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Interactive ranking database filterable by state, city, discipline, average placement packages, and research output scores.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-500" />
                  Salary & Placement Sort
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-500" />
                  City & State Level Filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-500" />
                  1-Click College Shortlisting
                </li>
              </ul>
            </div>
            <Link
              href="/rankings"
              className="mt-8 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              <span>Browse Rankings</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Secondary Row: Compare & News Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GitCompare className="w-7 h-7" />
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-lg font-bold text-slate-900">Side-by-Side Comparison Engine</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Compare up to 5 colleges simultaneously across fees, placement rates, hostel life, faculty strength, and NIRF scores.
              </p>
              <Link href="/chat" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-1">
                <span>Start comparison in Chat</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Newspaper className="w-7 h-7" />
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-lg font-bold text-slate-900">Real-Time News Radar</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Automated live RSS ingestion tracking exam dates, application deadlines, policy updates, and counseling timetables.
              </p>
              <Link href="/news" className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 pt-1">
                <span>View Live News Feed</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Institutions Spotlight ── */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Spotlight</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Top Featured Institutions
              </h2>
            </div>
            <Link
              href="/rankings"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all in Rankings Matrix</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_COLLEGES.map((college, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                      {college.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{college.rank}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {college.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{college.location}</span>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-left">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Avg Package</p>
                      <p className="text-xs font-bold text-slate-900">{college.avgPackage}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Highest</p>
                      <p className="text-xs font-bold text-emerald-600">{college.highestPackage}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <Link
                    href={`/chat?q=Tell me about admissions, placements, and campus life at ${encodeURIComponent(college.name)}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-center text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    Ask AI
                  </Link>
                  <Link
                    href={`/colleges/${college.slug}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                    title="View City Hub"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── City Hubs Directory ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Browse Colleges by Major Education Hubs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Discover premier institutes, cutoffs, and campus placements across India&apos;s leading academic centers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {TOP_CITIES.map((city, idx) => (
            <Link
              key={idx}
              href={`/colleges/${city.slug}`}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-slate-600 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Building2 size={20} />
              </div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                {city.name}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{city.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Ready to Explore CTA ── */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              Start Your Research in Seconds
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to find the ideal college for your future?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              No account required to explore rankings, predict cutoffs, or ask the AI. Get instant clarity today.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/chat"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                Chat with UniBot
              </Link>
              <Link
                href="/predictor"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all"
              >
                Forecast My Admission
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
