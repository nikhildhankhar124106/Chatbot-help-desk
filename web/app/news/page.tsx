"use client";

import React, { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  Newspaper,
  Search,
  CloudSun,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Calendar,
  Share2
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006"
).replace("localhost", "127.0.0.1");

function formatRelativeTime(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface Article {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  image: string;
  published_at: string | null;
  created_at: string;
}

const getFallbackImage = (category?: string, index: number = 0) => {
  const cat = (category || "General").toLowerCase();

  const images = {
    admission: [
      "https://images.unsplash.com/photo-1523050853063-8951ac51b4c3?w=1200&q=80",
      "https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?w=1200&q=80",
    ],
    placement: [
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
    ],
    tech: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    ],
    medical: [
      "https://images.unsplash.com/photo-1505751172107-5732488c371c?w=1200&q=80",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
    ],
    general: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
      "https://images.unsplash.com/photo-1498243639359-f75cb752ee97?w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    ],
  };

  if (cat.includes("admission")) return images.admission[index % 2];
  if (cat.includes("placement")) return images.placement[index % 2];
  if (cat.includes("tech")) return images.tech[index % 2];
  if (cat.includes("medical")) return images.medical[index % 2];

  return images.general[index % 3];
};

const CATEGORIES = [
  "All",
  "Admissions",
  "Results",
  "Placements",
  "Colleges",
  "Internships",
  "Scholarships",
  "Tech",
  "Science",
];

export default function NewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const fetchNews = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      let url = `${API_URL}/news?limit=30`;
      if (category && category !== "All") {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.warn("Could not fetch live news feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(activeTab);
  }, [fetchNews, activeTab]);

  const filteredArticles = articles.filter(
    (a) =>
      a.title?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      a.source?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      a.summary?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const featured = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1, 13);

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
          <Link href="/tools" className="hover:text-slate-600 transition-colors">
            Tools
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-800">Live Academic Radar</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-slate-200 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-xs font-bold text-rose-700 mb-3">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Continuous Surveillance Feed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Academic Radar & News
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
              Real-time educational intelligence across exam dates, counseling schedules, cutoffs, and campus placements.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search news & notifications..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 my-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeTab === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse py-8">
            <div className="md:col-span-2 h-96 bg-slate-200 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-28 bg-slate-200 rounded-2xl" />
              <div className="h-28 bg-slate-200 rounded-2xl" />
              <div className="h-28 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-lg mx-auto my-12">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-800">No news articles found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or switching to another category.
            </p>
          </div>
        ) : (
          <div className="space-y-10 mb-16">
            {/* Top Featured Headline */}
            {featured && (
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-900 text-white shadow-md group">
                <div className="absolute inset-0">
                  <ArticleImage
                    src={featured.image}
                    category={featured.category}
                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                </div>

                <div className="relative p-6 sm:p-10 md:p-14 max-w-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      Top Spotlight
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {featured.source}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <Clock size={12} />
                      {formatRelativeTime(featured.published_at || featured.created_at)}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                    {featured.title}
                  </h2>

                  <p className="text-sm text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
                    {featured.summary}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={featured.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <span>Read Full Report</span>
                      <ExternalLink size={13} />
                    </a>
                    <Link
                      href={`/chat?q=Summarize this academic news for me: ${encodeURIComponent(featured.title)}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs backdrop-blur-sm transition-colors"
                    >
                      <Brain size={13} />
                      <span>Ask AI to Analyze</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map((article, idx) => (
                <div
                  key={article.id || idx}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <ArticleImage
                        src={article.image}
                        category={article.category}
                        index={idx}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-800 shadow-2xs">
                          {article.category || "Education"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-slate-600 truncate max-w-[140px]">
                          {article.source}
                        </span>
                        <span>{formatRelativeTime(article.published_at || article.created_at)}</span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                    <Link
                      href={`/chat?q=Explain the key takeaways of this news: ${encodeURIComponent(article.title)}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Brain size={12} />
                      <span>Ask AI</span>
                    </Link>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Read source"
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ArticleImage({
  src,
  category,
  className,
  index = 0,
}: {
  src?: string;
  category?: string;
  className?: string;
  index?: number;
}) {
  const [imgSrc, setImgSrc] = useState(
    src || getFallbackImage(category, index)
  );
  const [hasError, setHasError] = useState(false);

  const isGenericLogo =
    src?.includes("google") || src?.includes("logo") || !src;

  useEffect(() => {
    if (isGenericLogo) {
      setImgSrc(getFallbackImage(category, index));
    } else {
      setImgSrc(src!);
    }
  }, [src, category, index, isGenericLogo]);

  return (
    <img
      src={imgSrc}
      className={className}
      alt=""
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(getFallbackImage(category, index));
        }
      }}
    />
  );
}
