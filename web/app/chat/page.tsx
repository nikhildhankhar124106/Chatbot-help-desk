"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import {
  FileText,
  Check,
  Globe,
  ExternalLink,
  ArrowUp,
  X,
  Plus,
  Brain,
  Search,
  Sparkles,
  GitCompare,
  Trophy,
  StopCircle,
  Paperclip,
  Mic,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Copy,
  GraduationCap,
  Bookmark,
  Share2,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import { BarVisualizer } from "../components/ui/bar-visualizer";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

type Message = {
  role: "user" | "assistant";
  content: string;
};

const COMPARISON_CRITERIA = [
  "Fees",
  "Placement",
  "Rankings",
  "Campus Life",
  "Hostel",
  "Alumni",
  "Courses & Programs",
  "Research & Innovation",
  "Location & Infrastructure",
];

const MAX_COMPARE_COLLEGES = 5;

const LANGUAGES = [
  { code: "auto", name: "Auto-detect", native: "Auto", region: "meta" },
  { code: "hi", name: "Hindi", native: "हिंदी", region: "indian" },
  { code: "mr", name: "Marathi", native: "मराठी", region: "indian" },
  { code: "ta", name: "Tamil", native: "தமிழ்", region: "indian" },
  { code: "te", name: "Telugu", native: "తెలుగు", region: "indian" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", region: "indian" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", region: "indian" },
  { code: "bn", name: "Bengali", native: "বাংলা", region: "indian" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", region: "indian" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", region: "indian" },
  { code: "ur", name: "Urdu", native: "اردو", region: "indian" },
  { code: "ar", name: "Arabic", native: "العربية", region: "global" },
  { code: "fr", name: "French", native: "Français", region: "global" },
  { code: "es", name: "Spanish", native: "Español", region: "global" },
  { code: "de", name: "German", native: "Deutsch", region: "global" },
  { code: "zh", name: "Chinese", native: "中文", region: "global" },
  { code: "ja", name: "Japanese", native: "日本語", region: "global" },
  { code: "ru", name: "Russian", native: "Русский", region: "global" },
] as const;

const QUICK_STARTERS = [
  {
    title: "Compare IIT Bombay vs IIT Delhi",
    desc: "Placements, average package, and curriculum differences",
    prompt: "Compare IIT Bombay vs IIT Delhi for Computer Science placements and fees",
  },
  {
    title: "Cutoff for NIT Trichy CSE",
    desc: "Historical cutoffs, categories, and home state quota",
    prompt: "What is the 2024 cutoff for CSE at NIT Trichy across categories?",
  },
  {
    title: "Medical Colleges under 5 Lakhs",
    desc: "Top government and low-fee medical institutions in India",
    prompt: "Which top medical colleges in India offer MBBS under ₹5 lakh annual fees?",
  },
  {
    title: "BITS Pilani Placements & ROI",
    desc: "Average compensation and top tech recruiters",
    prompt: "Give me detailed placement statistics and ROI for BITS Pilani 2024",
  },
];

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006"
).replace("localhost", "127.0.0.1");

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-slate-50 items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Neural Chat...</span>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");

  const {
    messages,
    setMessages,
    chatMode,
    setChatMode,
    webPdfFilename,
    setWebPdfFilename,
    selectedLanguage,
    setSelectedLanguage,
  } = useChat();

  const { user, token, logout } = useAuth();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Compare mode states
  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeInput, setCollegeInput] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);

  // Language & UI menus
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle incoming query param (?q=...)
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (queryOverride?: string) => {
    const textToSend = queryOverride || input;
    if (!textToSend.trim() || isLoading) return;

    let finalPrompt = textToSend;
    if (chatMode === "compare" && colleges.length > 0) {
      const criteriaStr =
        selectedCriteria.length > 0
          ? `Compare ONLY on these parameters: ${selectedCriteria.join(", ")}.`
          : "Provide a comprehensive comparison table on fees, placements, rankings, and hostel life.";
      finalPrompt = `SYSTEM: Compare these colleges side-by-side: ${colleges.join(" vs ")}. ${criteriaStr}\n\n${textToSend}`;
    }

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: finalPrompt }],
          mode: chatMode,
          ...(webPdfFilename ? { pdfFilename: webPdfFilename } : {}),
          ...(chatMode === "compare" && colleges.length > 0 ? { colleges } : {}),
          ...(selectedLanguage && selectedLanguage !== "auto" ? { language: selectedLanguage } : {}),
        }),
      });

      if (!response.ok) {
        let errMsg = "Unable to reach assistant engine. Please try again.";
        try {
          const errData = await response.json();
          if (errData?.error) errMsg = errData.error;
          else if (errData?.message) errMsg = errData.message;
        } catch {
          try {
            const errText = await response.text();
            if (errText) errMsg = errText;
          } catch {}
        }
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const dataStr = line.replace("data:", "").trim();
              if (dataStr === "[DONE]") break;
              try {
                const json = JSON.parse(dataStr);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  assistantReply += content;
                  setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1].content = assistantReply;
                    return copy;
                  });
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1].content =
            err.message || "I encountered a temporary connection issue. Please check your network or try again in a moment.";
          return copy;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);
    setUploadProgressText("Extracting PDF content...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(45);
      const res = await fetch(`${API_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(85);
      if (res.ok) {
        const data = await res.json();
        setWebPdfFilename(data.filename || file.name);
        setUploadProgress(100);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `📄 **${file.name}** has been indexed successfully. You can now ask any questions about admissions, fees, or courses in this document.`,
          },
        ]);
      }
    } catch (err) {
      console.warn("Upload failed:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleVoiceRecording = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice speech recognition is not supported in this browser.");
      return;
    }

    if (isRecordingVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = selectedLanguage === "hi" ? "hi-IN" : "en-IN";

    rec.onstart = () => setIsRecordingVoice(true);
    rec.onend = () => setIsRecordingVoice(false);
    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      handleSend(text);
    };

    rec.start();
    recognitionRef.current = rec;
  };

  const speakText = (text: string, index: number) => {
    if (currentlySpeaking === index) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentlySpeaking(index);

    const clean = text.replace(/\[SOURCE_META:.*?\]/g, "").replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.onend = () => setCurrentlySpeaking(null);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* ── Chat Top Header ── */}
      <header className="h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap size={16} />
            </div>
            <span className="font-bold text-base text-slate-900 hidden sm:inline">
              Uni<span className="text-indigo-600">Bot</span>
            </span>
          </Link>

          <span className="text-slate-300">/</span>

          {/* Mode Switch Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setChatMode("research")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                chatMode === "research"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search size={12} />
              <span>Research</span>
            </button>
            <button
              onClick={() => setChatMode("compare")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                chatMode === "compare"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GitCompare size={12} />
              <span>Compare</span>
            </button>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* PDF indicator */}
          {webPdfFilename && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <FileText size={12} />
              <span className="max-w-[100px] truncate">{webPdfFilename}</span>
              <button
                onClick={() => setWebPdfFilename(null)}
                className="hover:text-rose-600 ml-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Globe size={13} className="text-slate-500" />
              <span className="hidden sm:inline">
                {LANGUAGES.find((l) => l.code === selectedLanguage)?.name || "Auto"}
              </span>
              <ChevronDown size={12} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 max-h-60 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code as any);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      selectedLanguage === lang.code
                        ? "bg-indigo-50 text-indigo-600 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-[10px] text-slate-400">{lang.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset / New Chat */}
          <button
            onClick={() => setMessages([])}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Start fresh conversation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* ── Messages Feed Area ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Empty State Showcase */}
          {messages.length === 0 ? (
            <div className="pt-12 sm:pt-20 text-center space-y-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <Brain size={28} />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {chatMode === "compare"
                    ? "Side-by-Side College Analysis"
                    : "Intelligent Academic Assistant"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {chatMode === "compare"
                    ? "Add institutions below to compare cutoffs, placement rates, hostel life, and curriculum."
                    : "Ask complex admission questions, evaluate campus statistics, or upload a college brochure."}
                </p>
              </div>

              {/* Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-4">
                {QUICK_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(starter.prompt)}
                    className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                      <span>{starter.title}</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {starter.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm text-sm font-medium"
                        : "bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 text-slate-800 shadow-2xs space-y-3"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Brain size={12} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">UniBot</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyToClipboard(msg.content)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy reply"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => speakText(msg.content, idx)}
                            className={`p-1 rounded transition-colors ${
                              currentlySpeaking === idx
                                ? "text-indigo-600 bg-indigo-50"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                            title="Read aloud"
                          >
                            {currentlySpeaking === idx ? (
                              <VolumeX size={13} />
                            ) : (
                              <Volume2 size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="prose-premium prose-sm max-w-none text-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-slate-500">
                  Retrieving neural evidence...
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Compare College Selector Panel (when compare mode active) ── */}
      {chatMode === "compare" && (
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
                Colleges ({colleges.length}/{MAX_COMPARE_COLLEGES}):
              </span>
              {colleges.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100"
                >
                  <span>{c}</span>
                  <button
                    onClick={() =>
                      setColleges(colleges.filter((_, idx) => idx !== i))
                    }
                    className="hover:text-rose-600"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {colleges.length < MAX_COMPARE_COLLEGES && (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={collegeInput}
                    onChange={(e) => setCollegeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && collegeInput.trim()) {
                        e.preventDefault();
                        setColleges([...colleges, collegeInput.trim()]);
                        setCollegeInput("");
                      }
                    }}
                    placeholder="Add college (e.g. IIT Bombay)..."
                    className="text-xs bg-slate-100 px-2.5 py-1 rounded-md outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                  {collegeInput.trim() && (
                    <button
                      onClick={() => {
                        setColleges([...colleges, collegeInput.trim()]);
                        setCollegeInput("");
                      }}
                      className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold"
                    >
                      Add
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Chat Input Capsule ── */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Upload progress */}
          {isUploading && (
            <div className="mb-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>{uploadProgressText}</span>
              </div>
              <span className="font-bold text-slate-500">{uploadProgress}%</span>
            </div>
          )}

          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-900/5 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Upload prospectus PDF"
            >
              <Paperclip size={18} />
            </button>

            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-xl transition-all ${
                isRecordingVoice
                  ? "bg-rose-50 text-rose-600 animate-pulse"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title="Dictate message"
            >
              <Mic size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isRecordingVoice
                  ? "Listening to voice input..."
                  : chatMode === "compare"
                  ? "Ask comparison question or press send..."
                  : "Ask anything about colleges, cutoffs, or placements..."
              }
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
            />

            {/* Send / Stop Button */}
            {isLoading ? (
              <button
                onClick={() => abortControllerRef.current?.abort()}
                className="shrink-0 p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                title="Stop response"
              >
                <StopCircle size={18} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="shrink-0 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-20 text-white transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
