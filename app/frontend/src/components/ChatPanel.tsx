import React, { useState, useRef } from 'react';

type Message = { id: string; text: string; from: 'user' | 'assistant' };

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  function appendDelta(text: string) {
    setMessages((m) => {
      const last = m[m.length - 1];
      if (last && last.from === 'assistant') {
        // append to last
        return [...m.slice(0, -1), { ...last, text: last.text + text }];
      }
      return [...m, { id: Date.now().toString(), from: 'assistant', text }];
    });
  }

  async function startStream() {
    // Prompt for demo purposes
    const userId = 'demo-user';
    const query = 'Hello, tell me about Nine Stars Records.';

    // add user message
    setMessages((m) => [...m, { id: Date.now().toString(), from: 'user', text: query }]);

    setStreaming(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch('/api/ape/chat', {
        method: 'POST',
        headers: { 'Accept': 'text/event-stream', 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error('No body on response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let lines = buf.split(/\r?\n/);
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line) continue;
          // SSE 'data:' lines
          if (line.startsWith('data:')) {
            const payload = line.replace(/^data:\s?/, '');
            try {
              const obj = JSON.parse(payload);
              if (obj.delta) appendDelta(obj.delta);
              if (obj.done) {
                setStreaming(false);
                controllerRef.current = null;
              }
            } catch (e) {
              // not JSON — treat as plain text
              appendDelta(payload);
            }
          }
          if (line.startsWith('event:')) {
            // handle events like 'done' or 'error' if needed
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
    <div style={{ width: 480, border: '1px solid #223', padding: 12, background: '#010615', color: '#E6E6EA' }}>
      <div style={{ height: 300, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ margin: '8px 0' }}>
            <div style={{ fontSize: 12, color: '#9fa8b2' }}>{m.from}</div>
            <div style={{ padding: 8, background: m.from === 'user' ? '#051231' : '#081826', borderRadius: 6 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={startStream} disabled={streaming} style={{ padding: '8px 12px' }}>
          {streaming ? 'Streaming...' : 'Start Stream'}
        </button>
        <button onClick={stopStream} disabled={!streaming} style={{ padding: '8px 12px' }}>Stop</button>
      </div>
    </div>
  );
}
