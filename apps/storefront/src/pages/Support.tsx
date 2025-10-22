import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, User, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

type Message = {
  id: string;
  from: "user" | "bot";
  text: string;
  time: string;
};

export default function Support() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const customerId = localStorage.getItem("customerId");

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      from: "user",
      text: trimmed,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed, context: { customerId } }),
      });

      if (!res.ok) {
        throw new Error(`Assistant failed (${res.status})`);
      }

      const data = await res.json();

      const botMsg: Message = {
        id: crypto.randomUUID(),
        from: "bot",
        text: data.text || "I’m not sure how to respond to that.",
        time: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("❌ Assistant request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "bot",
          text: "I’m having trouble connecting right now. Please try again later.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-800">Support Chat</h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Store
        </button>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              Start a conversation with Nora 👋
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  msg.from === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.from === "bot" ? (
                    <Bot size={14} className="text-indigo-500" />
                  ) : (
                    <User size={14} className="text-indigo-100" />
                  )}
                  <span className="font-semibold text-xs opacity-70">
                    {msg.from === "bot" ? "Nora" : "You"}
                  </span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                <p className="text-[10px] opacity-50 mt-1 text-right">
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}
