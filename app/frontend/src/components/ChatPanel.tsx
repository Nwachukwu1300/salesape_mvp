import React, { useEffect, useRef, useState } from 'react';
import { getAccessToken } from '../lib/supabase';
import { Button } from './Button';
import { Input } from './Input';
import { API_BASE } from '../lib/api';
import { X } from 'lucide-react';

type Message = { id: string; text: string; from: 'user' | 'assistant' };

const APE_GREETING =
  "Hi, I'm APE. I can help you understand your workspace, sharpen messaging, and move faster. What are you building today?";

export default function ChatPanel({
  className = '',
  storageKey = 'salesape.apechat.messages',
  fullHeight = false,
  onClose,
}: {
  className?: string;
  storageKey?: string;
  fullHeight?: boolean;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") {
      return [{ id: 'ape-greeting', from: 'assistant', text: APE_GREETING }];
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [{ id: 'ape-greeting', from: 'assistant', text: APE_GREETING }];
  });
  const [streaming, setStreaming] = useState(false);
  const [query, setQuery] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  function appendDelta(text: string) {
    setMessages((m) => {
      const last = m[m.length - 1];
      if (last && last.from === 'assistant') {
        return [...m.slice(0, -1), { ...last, text: last.text + text }];
      }
      return [...m, { id: Date.now().toString(), from: 'assistant', text }];
    });
  }

  async function startStream() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const token = getAccessToken();
    if (!token) {
      appendDelta('\n[missing auth token]');
      return;
    }

    setMessages((m) => [...m, { id: Date.now().toString(), from: 'user', text: trimmed }]);
    setQuery('');

    setStreaming(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const streamUrl = API_BASE ? `${API_BASE}/api/ape/chat` : '/api/ape/chat';
      const res = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: trimmed }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No body on response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split(/\r?\n/);
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line) continue;
          if (line.startsWith('data:')) {
            const payload = line.replace(/^data:\s?/, '');
            try {
              const obj = JSON.parse(payload);
              if (obj.delta) appendDelta(obj.delta);
              if (obj.done) {
                setStreaming(false);
                controllerRef.current = null;
              }
            } catch {
              appendDelta(payload);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Stream error', err);
      appendDelta('\n[stream interrupted]');
    } finally {
      setStreaming(false);
      controllerRef.current = null;
    }
  }

  function stopStream() {
    controllerRef.current?.abort();
    setStreaming(false);
  }

  return (
    <div
      className={`w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg ${fullHeight ? "h-screen rounded-none flex flex-col" : "rounded-xl"} ${className}`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div>
          <h3 className="font-semibold text-sm">APE Assistant</h3>
          <p className="text-xs text-gray-500">Ask questions, get fast answers.</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close APE assistant"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div
        className={`${fullHeight ? "flex-1 min-h-0" : "h-[60vh] min-h-[420px]"} overflow-y-auto px-4 py-3 space-y-3`}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.from === "user"
                  ? "bg-[#F724DE] text-white rounded-br-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          startStream();
        }}
        className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex gap-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask APE anything..."
          disabled={streaming}
          className="flex-1"
        />
        <Button type="submit" disabled={streaming || !query.trim()} size="sm">
          {streaming ? 'Streaming...' : 'Send'}
        </Button>
        <Button type="button" onClick={stopStream} disabled={!streaming} variant="outline" size="sm">
          Stop
        </Button>
      </form>
    </div>
  );
}
