"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Book, Terminal, Database, ChevronRight, 
  Cpu, Layers, Zap, Globe, ShieldCheck, 
  Activity, Search, MessageSquare, Box,
  Newspaper, CheckCircle2, ArrowRight
} from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800">System Architecture Documentation</span>
        </div>

        {/* Hero Section */}
        <header className="space-y-6 mb-16">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Book size={24} />
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
            Technical Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            UniBot Platform Architecture
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
            An overview of the multi-hop RAG intelligence layer, autonomous institutional scrapers, and deterministic database fusion.
          </p>
        </header>

        {/* Section 01: Hub Philosophy */}
        <section className="mb-16 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <Box size={14} />
            <span>01 / Core Foundation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Data-First Decision Making
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            UniBot is built on a unified intelligence layer that consolidates disparate institutional records from 2,500+ universities across India. By pairing high-frequency official notice board scraping with neural reasoning, we provide students with verified, cited facts.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-sm text-slate-900">1. Intent Extraction</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deconstructs queries into constraints: exam percentiles, domicile state quotas, categories, and budgets.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-sm text-slate-900">2. Vector Retrieval</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Performs hybrid dense/sparse search across thousands of indexed brochures and admission guidelines.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-sm text-slate-900">3. Deterministic Fusion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cross-references LLM outputs against hard relational data from NIRF rankings and institutional databases.
              </p>
            </div>
          </div>
        </section>

        {/* Section 02: Tech Stack Grid */}
        <section className="mb-16 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Technology Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Engineered for low latency, deterministic accuracy, and multi-turn conversational memory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {[
              {
                category: "Frontend UI",
                techs: ["Next.js 16", "React 19", "Tailwind CSS", "Framer Motion"],
                desc: "Reactive, mobile-first interface with motion-driven transitions.",
              },
              {
                category: "Backend Engine",
                techs: ["Fastify 5", "Node.js", "TypeScript", "Docker"],
                desc: "High-throughput asynchronous microservices with streaming SSE.",
              },
              {
                category: "Neural Layer",
                techs: ["OpenRouter", "GPT-4o-mini", "Tavily AI", "LangChain"],
                desc: "Hybrid RAG pipeline with multi-hop reasoning and live web research.",
              },
              {
                category: "Storage Ops",
                techs: ["PostgreSQL", "Qdrant Vector DB", "Redis"],
                desc: "Dual-engine storage for relational records and dense vector embeddings.",
              },
            ].map((stack, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-2xs space-y-4"
              >
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {stack.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stack.techs.map((t, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{stack.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-lg shadow-indigo-500/20 mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Have architectural questions?</h2>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-md mx-auto">
            Contact our engineering team for technical inquiries or institutional API access.
          </p>
          <div className="pt-2">
            <Link
              href="/support/contact"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <span>Contact Support</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
