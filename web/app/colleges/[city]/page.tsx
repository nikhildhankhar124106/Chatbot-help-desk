import CollegeDetailView from "./CollegeDetailView";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4006";

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  
  if (!slug) notFound();

  // 1. Fetch College Data (Server-Side)
  let college = null;
  try {
    const res = await fetch(`${API_URL}/colleges/${encodeURIComponent(slug)}`, {
      cache: 'no-store' // Ensure we get fresh data for now, can optimize later
    });
    if (res.ok) {
      const data = await res.json();
      college = data.college;
    }
  } catch (err) {
    console.error("Failed to fetch college on server", err);
  }

  if (!college) {
    return <NotFoundView slug={slug} />;
  }

  // 2. Fetch News Data (Server-Side)
  let newsData = [];
  try {
    const res = await fetch(`${API_URL}/news?source=${encodeURIComponent(college.college)}&limit=3`, {
      next: { revalidate: 3600 } // Cache news for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      newsData = data.articles || [];
    }
  } catch (err) {
    console.error("Failed to fetch news on server", err);
  }

  return <CollegeDetailView college={college} newsData={newsData} />;
}

function NotFoundView({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-200/80 rounded-3xl p-10 shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Building2 size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">College Not Found</h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            We couldn&apos;t find <strong className="text-slate-800">{slug?.replace(/-/g, " ")}</strong> in our database.
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Link
            href="/rankings"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-500/20 transition-all hover:scale-105"
          >
            Browse All Institutions
          </Link>
        </div>
      </div>
    </div>
  );
}
