import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bot, Send, X, Loader2, Sparkles, Trash2, Zap, Database, Shield, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-chat`;

const QUICK_ACTIONS = [
  { label: "🏥 System Health", prompt: "Run a complete system health check — tables, configs, API keys, errors, everything", icon: Shield },
  { label: "📊 Full Dashboard", prompt: "Give me a complete dashboard — usage, revenue, errors, feedback, API costs — everything at once", icon: BarChart3 },
  { label: "🔑 API Key Check", prompt: "Check all API keys — Gemini, OpenAI, Firecrawl, Razorpay, Stripe. Show which are set and how many", icon: Zap },
  { label: "💰 Revenue Deep Dive", prompt: "Revenue report last 30 days — by gateway, daily breakdown, pending payments, failed orders", icon: Database },
  { label: "🐛 Error Diagnosis", prompt: "Check all errors in last 24 hours. Show function-wise breakdown, status codes, and suggest fixes", icon: Shield },
  { label: "📢 Ad Slots Status", prompt: "List all ad slots with their status, type, and whether they have code. Show which are earning", icon: BarChart3 },
  { label: "⭐ Feedback Analysis", prompt: "Analyze all user feedback — rating distribution, recent comments, trends, and suggestions", icon: Database },
  { label: "🚦 Rate Limit Status", prompt: "Check rate limits — any blocked IPs? Current usage vs limits for all functions", icon: Shield },
];

const STORAGE_KEY = "admin-ai-chat-history";

const loadHistory = (): Msg[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveHistory = (msgs: Msg[]) => {
  try {
    // Keep last 100 messages to avoid storage limits
    const trimmed = msgs.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* storage full */ }
};

const AdminAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const parseAndExecuteActions = async (text: string): Promise<string> => {
    const actionRegex = /\[ACTION:(\w+):(\{[^}]*(?:\{[^}]*\}[^}]*)*\})\]/g;
    let match;
    let resultText = text;
    const actions: { full: string; name: string; params: any }[] = [];

    while ((match = actionRegex.exec(text)) !== null) {
      try {
        actions.push({ full: match[0], name: match[1], params: JSON.parse(match[2]) });
      } catch { /* skip malformed */ }
    }

    for (const action of actions) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) continue;

        const { data, error } = await supabase.functions.invoke("admin-ai-chat", {
          body: { action: { name: action.name, params: action.params } },
        });

        if (error) {
          resultText = resultText.replace(action.full, `\n> ⚠️ Action failed: ${error.message}\n`);
        } else {
          const result = data?.result;
          const formatted = typeof result === "string" ? result : `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
          resultText = resultText.replace(action.full, `\n> ✅ **${action.name}**:\n${formatted}\n`);
        }
      } catch {
        resultText = resultText.replace(action.full, `\n> ❌ Action error\n`);
      }
    }

    return resultText;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: content.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not authenticated"); setIsLoading(false); return; }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantSoFar.includes("[ACTION:")) {
        const processed = await parseAndExecuteActions(assistantSoFar);
        setMessages((prev) =>
          prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, content: processed } : m)
        );
      }
    } catch (e: any) {
      console.error("AI Chat error:", e);
      toast.error(e.message || "Chat failed");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error: ${e.message || "Something went wrong"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[440px] sm:h-[650px] sm:max-h-[85vh] flex flex-col bg-card border border-border sm:rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Super Admin AI</h3>
            <p className="text-[10px] text-muted-foreground">Full System Access • All Tables • All Actions</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="text-center py-3">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-foreground">Super Admin Assistant</p>
              <p className="text-xs text-muted-foreground mt-1">
                Full access to all tables, configs, diagnostics & actions
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Read/Write All Tables</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Live Diagnostics</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Config Manager</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => sendMessage(qa.prompt)}
                  className="text-left px-2.5 py-2 rounded-lg bg-muted/30 border border-border hover:border-primary/30 hover:bg-primary/5 text-[11px] text-muted-foreground hover:text-foreground transition-all active:scale-[0.97]"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted/50 text-foreground border border-border rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-xs sm:text-sm [&_pre]:bg-background/50 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-[10px] [&_pre]:overflow-x-auto [&_code]:text-[10px]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs sm:text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Analyzing system...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-card">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything — full system access..."
            className="flex-1 h-10 text-sm bg-muted/30 border-border"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="h-10 w-10 p-0 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminAIChat;
