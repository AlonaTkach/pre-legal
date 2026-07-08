"use client";

import { useRef, useState } from "react";
import { NdaData } from "@/lib/nda";
import { apiFieldsToNdaData, ChatMessage, sendChat } from "@/lib/api";

const GREETING =
  "Hi! I'll help you draft a mutual NDA. To start — what's the purpose of this agreement?";

type Props = {
  onFieldsChange: (data: NdaData) => void;
  onComplete: (complete: boolean) => void;
};

export function NdaChat({ onFieldsChange, onComplete }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const result = await sendChat(next);
      setMessages([...next, { role: "assistant", content: result.reply }]);
      onFieldsChange(apiFieldsToNdaData(result.fields));
      onComplete(result.complete);
    } catch {
      setError("Something went wrong reaching the assistant. Please try again.");
      setMessages(next);
    } finally {
      setSending(false);
      // Return focus to the input after each answer.
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-700 px-4 py-2 text-sm text-white"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 text-sm text-slate-800"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 text-sm text-slate-400">
              …
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="px-4 pb-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          ref={inputRef}
          aria-label="Message"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer…"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
