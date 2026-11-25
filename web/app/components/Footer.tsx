"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, ShieldCheck, Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Uni<span className="text-indigo-600">Bot</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              India&apos;s intelligent academic exploration engine. RAG-driven institutional intelligence, verified cutoffs, real-time news, and side-by-side college comparisons.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time RAG Engine Operational</span>
            </div>
          </div>

          {/* Quick Intelligence Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">AI Tools</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/chat" className="hover:text-indigo-600 transition-colors flex items-center gap-1 group">
                  <span>Chat Assistant</span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/predictor" className="hover:text-indigo-600 transition-colors">
                  Cutoff Predictor
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="hover:text-indigo-600 transition-colors">
                  NIRF Matrix 2024-25
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-indigo-600 transition-colors">
                  Academic Radar News
                </Link>
              </li>
              <li>
                <Link href="/shortlist" className="hover:text-indigo-600 transition-colors">
                  Academic Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Popular Hubs</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/colleges/delhi" className="hover:text-indigo-600 transition-colors">
                  Top Colleges in Delhi
                </Link>
              </li>
              <li>
                <Link href="/colleges/mumbai" className="hover:text-indigo-600 transition-colors">
                  Top Colleges in Mumbai
                </Link>
              </li>
              <li>
                <Link href="/colleges/bangalore" className="hover:text-indigo-600 transition-colors">
                  Top Colleges in Bangalore
                </Link>
              </li>
              <li>
                <Link href="/colleges/chennai" className="hover:text-indigo-600 transition-colors">
                  Top Colleges in Chennai
                </Link>
              </li>
              <li>
                <Link href="/colleges/pune" className="hover:text-indigo-600 transition-colors">
                  Top Colleges in Pune
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/support/documentation" className="hover:text-indigo-600 transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="hover:text-indigo-600 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/guidelines/usage-policy" className="hover:text-indigo-600 transition-colors">
                  Usage & Data Policy
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-600 transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} UniBot. Built for students across India.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck size={14} className="text-emerald-500" />
              Verified Institutional Data
            </span>
            <Link href="/guidelines/usage-policy" className="hover:text-slate-600 transition-colors">
              Terms & Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
