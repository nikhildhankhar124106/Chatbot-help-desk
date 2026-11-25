"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, ChevronRight, MessageSquare } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const FORMSPREE_ID = "xqewveag";
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-800">Support & Feedback</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Context Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Mail size={24} />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                Technical Support
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                Contact Engineering & Support
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
                Have feedback, questions about cutoffs, or want to report institutional data discrepancies? Our team is here to assist.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Typical response time: Under 24 hours</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span>Verified data feedback directly updates RAG vector indexes</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Message Delivered</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Thank you! Our support engineers have received your inquiry and will respond shortly.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors mt-4"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Send a Message</h3>

                  {status === "error" && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      Failed to send. Please check your network or try again.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-0.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nikhil Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-0.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 pl-0.5">
                      Message & Query Details
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your question, college data update, or issue..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 pt-2"
                  >
                    <span>{status === "sending" ? "Sending Message..." : "Submit Message"}</span>
                    <Send size={15} />
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
