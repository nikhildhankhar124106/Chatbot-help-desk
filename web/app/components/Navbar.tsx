"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Brain, 
  Zap, 
  Trophy, 
  Newspaper, 
  Bookmark, 
  LayoutGrid, 
  Menu, 
  X, 
  Sparkles, 
  User, 
  LogOut,
  ChevronRight,
  Search
} from "lucide-react";
import { useShortlist } from "../context/ShortlistContext";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { name: "Chat Assistant", href: "/chat", icon: Brain, badge: "AI" },
  { name: "Predictor", href: "/predictor", icon: Zap },
  { name: "Rankings", href: "/rankings", icon: Trophy },
  { name: "News Radar", href: "/news", icon: Newspaper },
  { name: "Saved", href: "/shortlist", icon: Bookmark, showCount: true },
  { name: "Tools", href: "/tools", icon: LayoutGrid },
];

export function Navbar() {
  const pathname = usePathname();
  const { shortlist } = useShortlist();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Uni<span className="text-indigo-600">Bot</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block -mt-1">
              Intelligent College Explorer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon size={14} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="px-1 py-0.2 bg-gradient-to-r from-indigo-500 to-violet-500 text-[9px] font-bold text-white rounded">
                    {item.badge}
                  </span>
                )}
                {item.showCount && shortlist.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-indigo-600 text-[10px] font-bold text-white rounded-full">
                    {shortlist.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/chat"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold border border-indigo-200/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span>Ask AI</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate hidden md:inline">
                {user.displayName || user.email?.split("@")[0]}
              </span>
              <button
                onClick={() => logout()}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-500/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1 shadow-lg"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                    <span>{item.name}</span>
                  </div>
                  {item.showCount && shortlist.length > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-600 text-xs font-bold text-white rounded-full">
                      {shortlist.length}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold bg-indigo-600 text-white rounded-lg shadow-sm"
              >
                Launch Chat AI
              </Link>
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
