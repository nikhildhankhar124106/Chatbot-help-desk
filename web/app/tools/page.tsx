"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Zap,
  Trophy,
  Newspaper,
  Bookmark,
  GitCompare,
  Building2,
  FileSearch,
  Search,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Compass,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface ToolItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  href: string;
  category: "Core" | "Intelligence" | "Discovery";
  tag?: string;
  isFeatured?: boolean;
}

const TOOLS: ToolItem[] = [
  {
    id: "chat",
    name: "Neural Research Chat",
    description: "Multilingual conversational AI with PDF brochure intelligence, web search, and citations.",
    icon: Brain,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    href: "/chat",
    category: "Core",
    tag: "Multi-hop RAG",
    isFeatured: true,
  },
  {
    id: "predictor",
    name: "Admission & Cutoff Predictor",
    description: "Forecast your admission chances across JEE Main, Advanced, NEET, and CAT based on 2024-25 data.",
    icon: Zap,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    href: "/predictor",
    category: "Intelligence",
    tag: "Historical Forecaster",
    isFeatured: true,
  },
  {
    id: "rankings",
    name: "NIRF Rankings Matrix",
    description: "Comprehensive institutional directory with state, city, placement salary, and research filters.",
    icon: Trophy,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    href: "/rankings",
    category: "Discovery",
    tag: "2024-25 Verified",
  },
  {
    id: "news",
    name: "Academic Radar News",
    description: "Real-time updates on exam schedules, answer keys, counseling rounds, and national policy.",
    icon: Newspaper,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    href: "/news",
    category: "Intelligence",
    tag: "Automated Feed",
  },
  {
    id: "compare",
    name: "Side-by-Side Comparison",
    description: "Direct comparative breakdown between up to 5 institutions across fees, hostels, and packages.",
    icon: GitCompare,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    href: "/chat",
    category: "Core",
    tag: "5-Way Compare",
  },
  {
    id: "shortlist",
    name: "Academic Vault & Shortlist",
    description: "Save and organize your target colleges, review application requirements, and download summaries.",
    icon: Bookmark,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    href: "/shortlist",
    category: "Discovery",
    tag: "Personal Vault",
  },
  {
    id: "hubs",
    name: "City Education Hubs",
    description: "Explore top colleges clustered by metropolitan areas like Delhi NCR, Mumbai, Bangalore, and Chennai.",
    icon: Building2,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    href: "/colleges/delhi",
    category: "Discovery",
    tag: "Regional Guide",
  },
];

const CATEGORIES = ["All", "Core", "Intelligence", "Discovery"];

export default function ToolsHub() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory =
      activeCategory === "All" || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-800">Intelligence Tools</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-3">
              <Sparkles size={12} />
              <span>UniBot Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Intelligence Apps & Tools
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Specialized AI and data tools designed to simplify institutional search, admission probabilities, and campus evaluations.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 my-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      {tool.tag && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600 border border-slate-200">
                          {tool.tag}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {tool.category}
                    </span>
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700"
                    >
                      <span>Launch App</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
