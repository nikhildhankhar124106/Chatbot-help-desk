"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  ArrowUp,
  Volume2,
  VolumeX,
  ChevronDown,
  Mic,
  Sparkles,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006"
).replace("localhost", "127.0.0.1");

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  collegeName: string;
  collegeId?: string;
  logo?: string;
}

export function ChatWidget({ collegeName, collegeId, logo }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your **${collegeName} Academic Counselor**. Ask me anything about cutoffs, placements, faculty, or campus life at ${collegeName}!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (textToUse?: string) => {
    const text = textToUse || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          mode: "web",
          contextHint: collegeName,
        }),
      });

      if (!response.ok) throw new Error("Failed to connect to assistant");

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
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "").trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantReply += content;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, content: assistantReply }];
                    }
                    return prev;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isRecordingVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsRecordingVoice(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      handleSend(text);
    };
    recognition.onend = () => setIsRecordingVoice(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSpeak = (text: string, index: number) => {
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(index);

    const cleanText = text.replace(/\[SOURCE_META:.*?\]/g, "").replace(/\*\*/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className={cn(
              "mb-4 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col",
              "fixed inset-4 bottom-24 sm:inset-auto sm:relative sm:w-[400px] sm:h-[580px] sm:rounded-3xl rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                  {logo ? (
                    <img src={logo} alt={collegeName} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="text-indigo-600" size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Counselor</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{collegeName}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-200/70 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-slate-800"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 text-xs leading-relaxed",
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm font-medium shadow-sm" 
                      : "text-slate-700 bg-slate-100/90 rounded-2xl rounded-tl-sm border border-slate-200/60"
                  )}>
                    {msg.role === "assistant" ? (
                      <div>
                        <div className="prose-premium prose-xs max-w-none text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content || "..."}
                          </ReactMarkdown>
                        </div>
                        {msg.content && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                            <button
                              onClick={() => handleSpeak(msg.content, idx)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                            >
                              {isSpeaking === idx ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              <span>{isSpeaking === idx ? "Stop" : "Listen"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1].role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-3 py-2 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    <span>Analyzing institutional data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="relative flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isRecordingVoice ? "Listening to voice..." : "Ask anything about this college..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-10 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-12 top-1.5 p-1 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={startVoiceRecording}
                  className={`p-2 rounded-xl border transition-all ${
                    isRecordingVoice 
                      ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse" 
                      : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                  title="Voice input"
                >
                  <Mic size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all",
          isOpen 
            ? "bg-slate-900 text-white" 
            : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25"
        )}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
}
