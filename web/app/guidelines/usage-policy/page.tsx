"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Shield, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

export default function UsagePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-800">Usage & Data Policy</span>
        </div>

        <header className="space-y-4 mb-12">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
            Governance & Standards
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Platform Usage & Data Policy
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Operational standards ensuring verified academic data synchronization, responsible AI usage, and student privacy.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>01. Data Integrity & Official Sourcing</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                UniBot indexes institutional cutoff records, placement reports, and accreditation metrics directly from verified government bodies (NIRF, AICTE, UGC, NTA) and university portals.
              </p>
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 leading-relaxed font-medium">
                All retrieved document chunks are cryptographically anchored with source citations.
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                02. Responsible AI Interaction
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our conversational systems and cutoff predictors are designed purely for educational exploration. Users may not:
              </p>
              <ul className="space-y-2 text-xs text-slate-600 font-medium list-disc pl-5">
                <li>Attempt automated scraper attacks or bypass query limits.</li>
                <li>Submit misleading brochures to manipulate institutional comparisons.</li>
                <li>Rely on cutoff predictions as guaranteed admission offers.</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                03. Student Privacy & Security
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We never sell student search queries or personal admission percentiles to commercial lead aggregators. Your academic vault and chat conversations remain confidential.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Policy Version</p>
              <p className="text-xl font-extrabold text-slate-900">v2.0 Active</p>
              <p className="text-xs text-slate-500">Last updated: October 2026</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance Standards</p>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Shield size={14} className="text-indigo-600" />
                  <span>Student Data Privacy Adherence</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>NIRF / Official Portal Synchronization</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
