"use client";

import React from "react";
import { useShortlist } from "../context/ShortlistContext";
import { 
  Bookmark, MapPin, Trophy, ArrowRight, GraduationCap, 
  Trash2, Building2, Search, Sparkles, ChevronRight,
  Brain, Newspaper, LayoutGrid, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toSlug } from "../rankings/page";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function ShortlistPage() {
  const { shortlist, removeFromShortlist } = useShortlist();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/tools" className="hover:text-slate-600 transition-colors">
            Tools
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-800">Academic Vault</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Bookmark size={22} className="fill-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Saved Colleges & Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {shortlist.length} {shortlist.length === 1 ? "institution" : "institutions"} bookmarked for comparison and admission tracking
              </p>
            </div>
          </div>

          {shortlist.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
              >
                <Brain size={14} />
                <span>Compare in AI Chat</span>
              </Link>
              <Link
                href="/rankings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Add More</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="py-8">
          {shortlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-20 text-center max-w-2xl mx-auto shadow-sm"
            >
              <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Bookmark size={36} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Your Academic Vault is Empty
              </h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Save target colleges while browsing NIRF rankings to organize admission deadlines, cutoffs, and side-by-side metrics.
              </p>
              <Link 
                href="/rankings" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
              >
                <span>Browse NIRF Rankings</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {shortlist.map((college, i) => (
                  <motion.div
                    key={college.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {college.logo ? (
                          <img src={college.logo} alt="" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Building2 className="text-slate-400" size={26} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                            {college.nirf_category || "College"}
                          </span>
                          {college.nirf_rank && (
                            <span className="text-xs font-semibold text-slate-500">
                              NIRF #{college.nirf_rank}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {college.college}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{college.city || "India"}, {college.state}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Avg Package</p>
                        <p className="text-sm sm:text-base font-bold text-slate-900">₹{college.avg_package || "12.5"} LPA</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/chat?q=Tell me about cutoffs, campus life, and placements at ${encodeURIComponent(college.college ?? "")}`}
                          className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          title="Ask AI about this college"
                        >
                          <Brain size={13} />
                          <span className="hidden sm:inline">Ask AI</span>
                        </Link>
                        <Link 
                          href={`/colleges/${toSlug(college.college ?? "")}`} 
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ChevronRight size={13} />
                        </Link>
                        <button 
                          onClick={() => removeFromShortlist(college.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                          title="Remove from vault"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
