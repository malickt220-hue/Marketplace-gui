import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, AlertTriangle, HelpCircle } from "lucide-react";
import { UserProfile } from "../types";

interface ChatbotProps {
  currentUser: UserProfile | null;
}

export default function Chatbot({ currentUser }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Bonjour ! Je suis l'assistant IA de Guinée Market Pro. Comment puis-je vous aider aujourd'hui ? Je peux vous conseiller sur les produits locaux (comme le Café Ziama ou le Miel du Fouta), vous aider à négocier, ou expliquer nos options de paiement par Orange Money ou Mobile Money !"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text,
          })),
          context: currentUser ? {
            name: currentUser.name,
            role: currentUser.role,
            email: currentUser.email,
          } : { guest: true }
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur lors de la requête IA");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.text }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "Désolé, je rencontre des difficultés pour me connecter au serveur d'intelligence artificielle. Assurez-vous d'avoir une connexion active ou essayez à nouveau. (Paiements mobiles Orange Money & MoMo toujours pleinement disponibles)."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-gradient-to-r from-[#009460] via-yellow-500 to-[#CE1126] text-white font-bold text-sm shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer animate-bounce"
        >
          <Sparkles size={18} className="animate-spin text-yellow-200" />
          <span>Aide IA Guinée</span>
          <MessageSquare size={16} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] h-[500px] rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-200 animate-pulse" />
              <div>
                <h4 className="font-bold text-sm">Guinée Market Pro Assistant</h4>
                <p className="text-[10px] text-white/80 font-mono tracking-wider uppercase">IA Conseil 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Warning banner of simulation */}
          <div className="bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 border-b border-amber-100 dark:border-amber-900/50 flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-400 font-mono">
            <HelpCircle size={12} className="shrink-0" />
            <span>Posez des questions sur le Café Ziama ou Orange Money</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-zinc-950/20">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs inline-block leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#009460] text-white rounded-br-none shadow-sm"
                      : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span>Analyse intelligente...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrire votre message..."
              className="flex-1 bg-gray-100 dark:bg-zinc-800 border-none outline-none focus:ring-1 focus:ring-green-500 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-[#009460] hover:bg-[#007f52] disabled:bg-gray-200 dark:disabled:bg-zinc-800 text-white transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
