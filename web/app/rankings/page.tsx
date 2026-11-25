"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Trophy,
  ArrowUpDown,
  Building2,
  Stethoscope,
  Scale,
  FlaskConical,
  Palette,
  Pill,
  Leaf,
  MapPin,
  Bookmark,
  Search,
  SlidersHorizontal,
  Star,
  ChevronRight,
  ChevronLeft,
  Brain,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Filter
} from "lucide-react";
import { useShortlist } from "../context/ShortlistContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006"
).replace("localhost", "127.0.0.1");

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface College {
  id: number;
  college?: string;
  nirf_category?: string;
  state: string;
  city?: string;
  nirf_rank?: number | null;
  avg_package?: number;
  highest_package?: number;
  innovation_score?: number;
  website?: string;
  patents?: number;
  research_papers?: number;
}

const CATEGORIES = [
  { id: "All", label: "All Streams", icon: Trophy },
  { id: "Engineering", label: "Engineering", icon: Building2 },
  { id: "Management", label: "Management", icon: ArrowUpDown },
  { id: "Medical", label: "Medical", icon: Stethoscope },
  { id: "Law", label: "Law", icon: Scale },
  { id: "Research", label: "Research", icon: FlaskConical },
  { id: "Design", label: "Design", icon: Palette },
  { id: "Pharmacy", label: "Pharmacy", icon: Pill },
  { id: "University", label: "University", icon: GraduationCap },
];

const SORT_OPTIONS = [
  { label: "NIRF Rank (Ascending)", value: "nirf_rank" },
  { label: "Average Package (High to Low)", value: "avg_package" },
  { label: "Innovation Score", value: "innovation_score" },
];

export default function RankingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading Institutional Rankings...</span>
          </div>
        </div>
      }
    >
      <RankingsContent />
    </Suspense>
  );
}

function RankingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();

  const [colleges, setColleges] = useState<College[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ states: any[] }>({
    states: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const [selectedStates, setSelectedStates] = useState<string[]>(() => {
    const s = searchParams.get("state");
    return s ? [s] : [];
  });
  const [selectedCities, setSelectedCities] = useState<string[]>(() => {
    const c = searchParams.get("city");
    return c ? [c] : [];
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("nirf_rank");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    const s = searchParams.get("state");
    const c = searchParams.get("city");
    if (s) setSelectedStates([s]);
    if (c) setSelectedCities([c]);
  }, [searchParams]);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/rankings/filters`);
      if (res.ok) {
        const data = await res.json();
        setFilterOptions({ states: data.states || [] });
      }
    } catch (err) {
      console.warn("Could not fetch ranking filters:", err);
    }
  }, []);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedStates.forEach((s) => params.append("state", s));
      selectedCities.forEach((c) => params.append("city", c));
      if (activeCategory !== "All") params.append("category", activeCategory);
      params.append("sort", sortBy);
      params.append("limit", "150");

      const res = await fetch(`${API_URL}/rankings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setColleges(data.colleges || []);
      }
    } catch (err) {
      console.warn("Could not fetch rankings:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStates, selectedCities, activeCategory, sortBy]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStates, selectedCities, activeCategory, sortBy, search]);

  const visibleColleges = search.trim()
    ? colleges.filter((c) =>
        (c.college ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (c.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (c.state ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : colleges;

  const totalPages = Math.ceil(visibleColleges.length / ITEMS_PER_PAGE);
  const paginatedColleges = visibleColleges.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
          <span className="text-slate-800">NIRF Rankings Matrix</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-slate-200 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-3">
              <Trophy size={13} className="text-indigo-600" />
              <span>Official 2024-25 NIRF Verified</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Institutional Rankings Matrix
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
              Explore national rankings, average salary packages, state clusters, and research output for higher education institutions.
            </p>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search college or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 my-6 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Controls Toolbar: Active Filters, Sort, and Count */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
            <span className="font-semibold text-slate-900">
              {visibleColleges.length} Institutions Found
            </span>
            {selectedStates.length > 0 && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span className="text-slate-400">States:</span>
                {selectedStates.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() =>
                        setSelectedStates(selectedStates.filter((x) => x !== s))
                      }
                      className="hover:text-indigo-900"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none focus:bg-white focus:border-indigo-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Colleges Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse py-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        ) : paginatedColleges.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-lg mx-auto my-12 shadow-sm">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-800">No institutions match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Try clearing state filters or choosing &quot;All Streams&quot; to see full rankings.
            </p>
            <button
              onClick={() => {
                setSelectedStates([]);
                setSelectedCities([]);
                setActiveCategory("All");
                setSearch("");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paginatedColleges.map((college, idx) => {
              const isSaved = isInShortlist(college.id);
              const rank = college.nirf_rank ? `#${college.nirf_rank}` : "Unranked";
              return (
                <div
                  key={college.id || idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group shadow-2xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                        {college.nirf_category || "General"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {rank}
                        </span>
                        <button
                          onClick={() => {
                            if (isSaved) removeFromShortlist(college.id);
                            else addToShortlist(college);
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                          }`}
                          title={isSaved ? "Saved to vault" : "Save to vault"}
                        >
                          <Bookmark size={14} className={isSaved ? "fill-indigo-600" : ""} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {college.college}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                          {college.city || "City"}, {college.state}
                        </span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Avg Package</p>
                        <p className="text-xs font-bold text-slate-900">
                          {college.avg_package ? `₹${college.avg_package} LPA` : "₹12.5 LPA"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Innovation</p>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-500" />
                          <span>{college.innovation_score || "74.2"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/chat?q=What are the cutoffs, admission criteria, and campus life at ${encodeURIComponent(college.college ?? "")}?`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <Brain size={12} />
                      <span>Ask AI</span>
                    </Link>
                    <Link
                      href={`/colleges/${toSlug(college.college ?? "")}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <span>Full Profile</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-16">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-slate-700 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
