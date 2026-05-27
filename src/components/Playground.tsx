"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code2, 
  Database, 
  Headset, 
  PenTool, 
  Send, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Terminal,
  Bot
} from "lucide-react";
import clsx from "clsx";

const AGENTS = [
  {
    id: "sdlc",
    name: "SDLC Architect",
    icon: Code2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "Focuses on patterns, scalability, and code structure.",
    greeting: "I'll review your code for architectural best practices and performance bottlenecks. What are we building today?",
  },
  {
    id: "data",
    name: "Data Pipeline Expert",
    icon: Database,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description: "Specializes in ETL robustness and SQL optimization.",
    greeting: "Ready to inspect your data pipelines. Drop your queries or pipeline code here.",
  },
  {
    id: "support",
    name: "Support Engineer",
    icon: Headset,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description: "Ensures code is observable, logged, and user-friendly.",
    greeting: "I look at code from a supportability lens. Let's make sure this is easy to debug in production.",
  },
  {
    id: "content",
    name: "Content Strategist",
    icon: PenTool,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    description: "Reviews localization, copy, and CMS integrations.",
    greeting: "I'll make sure your user-facing text is clear, inclusive, and properly formatted.",
  },
];

const MOCK_REVIEWS: Record<string, string[]> = {
  sdlc: [
    "I noticed you're doing a lot of synchronous work here. Consider using `Promise.all` or a worker thread to unblock the main execution context.",
    "The component structure is a bit monolithic. Breaking this down into smaller, reusable hooks would vastly improve testability.",
    "Great use of TypeScript generics here! However, the `any` type on line 42 bypasses the type safety. Let's define a strict interface for the API payload."
  ],
  data: [
    "This SQL query could be optimized. You're doing a full table scan on `users`. Let's add an index on `created_at` and use a window function.",
    "For this ETL job, batching the inserts in chunks of 1000 will significantly reduce database I/O and prevent lock contention.",
    "I'd recommend adding a dead-letter queue (DLQ) for the failed events instead of just dropping them. Data integrity is key!"
  ],
  support: [
    "If this API call fails, the user just sees a blank screen. We need to add a fallback UI and a clear error message.",
    "Please add some contextual logging here. `console.error(err)` isn't enough for us to debug this if it breaks in production. What was the user's ID?",
    "This error boundary is great, but we should also be firing an event to Sentry or Datadog so the on-call team gets alerted immediately."
  ],
  content: [
    "The error message 'Invalid Input Err 400' is very robotic. Let's change it to something empathetic like: 'We couldn't process that. Please check your details and try again.'",
    "Don't hardcode these strings. Let's move them to our localization files so our translation team can work on the Spanish version.",
    "The formatting here will break on smaller screens. Let's ensure the text truncates gracefully with an ellipsis."
  ]
};

const EXAMPLES: Record<string, { label: string, code: string }[]> = {
  sdlc: [
    { label: "React Component", code: "const UserProfile = () => {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch('/api/user').then(r => r.json()).then(setData);\n  }, []);\n  if(!data) return <div>Loading</div>;\n  return <div>{data.name}</div>;\n};" },
    { label: "Data Fetching", code: "async function getData() {\n  const res = await fetch('https://api.example.com/data');\n  return res.json();\n}" }
  ],
  data: [
    { label: "SQL Query", code: "SELECT * FROM orders\nLEFT JOIN users ON users.id = orders.user_id\nWHERE orders.status = 'pending';" },
    { label: "Data Transformation", code: "def process_data(df):\n    for index, row in df.iterrows():\n        row['total'] = row['price'] * row['qty']\n    return df" }
  ],
  support: [
    { label: "Error Handling", code: "try {\n  await processPayment(cart);\n} catch (e) {\n  console.log(e);\n}" },
    { label: "API Route", code: "app.post('/checkout', (req, res) => {\n  if (!req.body.id) return res.status(500).send('Error');\n  // process checkout\n});" }
  ],
  content: [
    { label: "UI Alert", code: "<Alert variant=\"destructive\">\n  <AlertTitle>Error 500</AlertTitle>\n  <AlertDescription>Bad request param.</AlertDescription>\n</Alert>" },
    { label: "Button Copy", code: "<button onClick={deleteAccount}>\n  Execute Deletion\n</button>" }
  ]
};

export default function Playground() {
  const [activeAgentId, setActiveAgentId] = useState(AGENTS[0].id);
  const [inputCode, setInputCode] = useState("");
  const [messages, setMessages] = useState<{role: "user"|"agent", content: string}[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const activeAgent = AGENTS.find(a => a.id === activeAgentId)!;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting when changing agents
  useEffect(() => {
    setMessages([
      { role: "agent", content: activeAgent.greeting }
    ]);
  }, [activeAgentId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim() || isAnalyzing) return;

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: inputCode }]);
    const currentInput = inputCode;
    setInputCode("");
    setIsAnalyzing(true);

    // Simulate Agent Thinking and Responding
    setTimeout(() => {
      // Pick a random mock response based on the active agent
      const reviews = MOCK_REVIEWS[activeAgent.id];
      const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
      
      setMessages(prev => [...prev, { role: "agent", content: randomReview }]);
      setIsAnalyzing(false);
    }, 2000 + Math.random() * 1500); // 2-3.5 second delay for realism
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-80 border-r border-zinc-800 bg-[#09090b]/80 flex flex-col z-10">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Review Team AI</h1>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Select a specialized AI agent to review your pull requests and code snippets.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4 px-2">Agents</h2>
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              className={clsx(
                "w-full text-left p-3 rounded-xl transition-all duration-200 border",
                activeAgentId === agent.id 
                  ? `bg-zinc-800/50 ${agent.border} shadow-sm` 
                  : "bg-transparent border-transparent hover:bg-zinc-800/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx("p-2 rounded-lg", agent.bg)}>
                  <agent.icon className={clsx("w-4 h-4", agent.color)} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-zinc-200">{agent.name}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-zinc-800 text-center">
          <a href="https://github.com/yourusername/code-review-playground" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            View on GitHub
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-background to-background -z-10 pointer-events-none" />
        
        {/* Header */}
        <div className="h-16 border-b border-zinc-800/50 glass-panel flex items-center px-6 justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <activeAgent.icon className={clsx("w-5 h-5", activeAgent.color)} />
            <h2 className="font-medium">{activeAgent.name}</h2>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium border border-green-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  "flex gap-4 max-w-3xl",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {msg.role === "agent" && (
                  <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-1", activeAgent.bg, activeAgent.border)}>
                    <activeAgent.icon className={clsx("w-4 h-4", activeAgent.color)} />
                  </div>
                )}
                
                <div className={clsx(
                  "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-sm border border-zinc-700 font-mono whitespace-pre-wrap overflow-x-auto" 
                    : "glass-panel text-zinc-300 rounded-tl-sm shadow-sm"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-3xl"
              >
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-1", activeAgent.bg, activeAgent.border)}>
                  <activeAgent.icon className={clsx("w-4 h-4 animate-spin", activeAgent.color)} />
                </div>
                <div className="px-5 py-4 rounded-2xl text-sm glass-panel text-zinc-400 rounded-tl-sm shadow-sm flex items-center gap-2">
                  <span className="flex gap-1">
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
                  </span>
                  Analyzing codebase...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 pt-0 mt-auto z-10">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Paste code or describe a PR for the ${activeAgent.name} to review...`}
              className="w-full h-32 bg-zinc-900/50 border border-zinc-700/50 rounded-2xl p-4 pr-14 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none font-mono group-hover:border-zinc-600/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 hidden sm:inline-block font-sans">
                Press Cmd + Enter
              </span>
              <button
                type="submit"
                disabled={!inputCode.trim() || isAnalyzing}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          
          {/* Quick Snippets */}
          <div className="max-w-4xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-xs text-zinc-500 py-1.5 px-2 flex-shrink-0">Try an example:</span>
            {EXAMPLES[activeAgent.id].map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputCode(example.code)}
                className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/40 border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
