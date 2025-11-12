import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Bot, MessageSquare, X } from "lucide-react";
import api from "@/lib/api";

type Msg = { id: string; role: "user" | "bot"; text: string; ts: number };

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [kb, setKb] = useState<{ section: string; title: string; text: string; link?: string }[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const welcome: Msg = { id: crypto.randomUUID(), role: "bot", text: "Hi, I’m your assistant. Ask about services, portfolio, careers, or contact.", ts: Date.now() };
      setMessages([welcome]);
    }
  }, [open]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const quickActions = useMemo(
    () => [
      { label: "Services", action: () => (window.location.href = "/services") },
      { label: "Portfolio", action: () => (window.location.href = "/portfolio") },
      { label: "Career", action: () => (window.location.href = "/career") },
      { label: "Contact", action: () => (window.location.href = "/contact") },
      { label: "Gallery", action: () => (window.location.href = "/gallery") },
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [services, portfolios, team, gallery, clients, faq] = await Promise.allSettled([
          api.get("/services"),
          api.get("/portfolios"),
          api.get("/team"),
          api.get("/gallery?limit=100"),
          api.get("/clients"),
          api.get("/sentences")
        ]);
        const items: { section: string; title: string; text: string; link?: string }[] = [];
        if (services.status === "fulfilled") {
          const list = Array.isArray(services.value.data) ? services.value.data : services.value.data?.data || [];
          list.forEach((s: any) => items.push({ section: "Services", title: s.name || s.title || "Service", text: s.description || "", link: "/services" }));
        }
        if (portfolios.status === "fulfilled") {
          const list = Array.isArray(portfolios.value.data) ? portfolios.value.data : portfolios.value.data?.data || [];
          list.forEach((p: any) => items.push({ section: "Portfolio", title: p.name || p.title || "Portfolio", text: p.description || "", link: "/portfolio" }));
        }
        if (team.status === "fulfilled") {
          const list = Array.isArray(team.value.data) ? team.value.data : team.value.data?.data || [];
          list.forEach((t: any) => items.push({ section: "Team", title: t.name || "Team Member", text: t.role || t.bio || "", link: "/team" }));
        }
        if (gallery.status === "fulfilled") {
          const list = Array.isArray(gallery.value.data) ? gallery.value.data : gallery.value.data?.data || [];
          list.forEach((g: any) => items.push({ section: "Gallery", title: g.title || "Gallery", text: g.description || "", link: "/gallery" }));
        }
        if (clients.status === "fulfilled") {
          const list = Array.isArray(clients.value.data) ? clients.value.data : clients.value.data?.data || [];
          list.forEach((c: any) => items.push({ section: "Clients", title: c.name || "Client", text: c.description || "", link: c.website || "/" }));
        }
        if (faq.status === "fulfilled") {
          const list = Array.isArray(faq.value.data) ? faq.value.data : faq.value.data?.data || [];
          list.forEach((f: any) => items.push({ section: "FAQ", title: f.title || "FAQ", text: f.content || f.description || "", link: "/faq" }));
        }
        if (!cancelled) setKb(items);
      } catch {}
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const reply = (q: string): string => {
    const s = q.toLowerCase();
    const match = kb
      .map((item) => ({ item, score: (item.title + " " + item.text).toLowerCase().includes(s) ? 1 : 0 }))
      .filter((m) => m.score > 0)
      .slice(0, 4)
      .map((m) => `• ${m.item.section}: ${m.item.title}`)
      .join("\n");
    if (match) return `Here are relevant items:\n${match}`;
    if (s.includes("service")) return "We offer custom development, secure solutions, and scalable architectures.";
    if (s.includes("portfolio")) return "Explore case studies and past work in Portfolio.";
    if (s.includes("career") || s.includes("job") || s.includes("resume")) return "Apply and share your resume on the Career page.";
    if (s.includes("contact") || s.includes("support") || s.includes("help")) return "Reach us on the Contact page.";
    if (s.includes("gallery")) return "View moments and achievements in the Gallery.";
    return "Ask me about services, portfolio, careers, contact, gallery, or clients.";
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text, ts: Date.now() };
    const botMsg: Msg = { id: crypto.randomUUID(), role: "bot", text: reply(text), ts: Date.now() };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setOpen(true)} className="rounded-full w-14 h-14 p-0 shadow-lg">
          <Bot className="w-6 h-6" />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Chatbot</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>Ask about anything on the site. Use quick actions to jump.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto rounded-md border border-border p-3 bg-muted/30">
              {messages.map((m) => (
                <div key={m.id} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-lg text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message" onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
              <Button onClick={send}>Send</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((qa) => (
                <Button key={qa.label} variant="outline" size="sm" onClick={qa.action}>{qa.label}</Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chatbot;
