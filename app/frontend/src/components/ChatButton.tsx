import React, { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

export default function ChatButton({
  hidden = false,
  inline = false,
}: {
  hidden?: boolean;
  inline?: boolean;
}) {
  const BRAND_COLOR = "#F724DE";
  const BRAND_HOVER = "#E61FD0";

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("salesape.chatButtonPos");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { x: number; y: number };
      if (typeof parsed.x === "number" && typeof parsed.y === "number") {
        setPos(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const inPanel = !!panelRef.current?.contains(target);
      const inButton = !!containerRef.current?.contains(target);
      if (!inPanel && !inButton) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocMouseDown);
    return () => document.removeEventListener("mousedown", handleDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (hidden) {
      setOpen(false);
    }
  }, [hidden]);

  const clamp = useCallback((value: number, min: number, max: number) => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (inline) return;
      const element = containerRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      draggingRef.current = true;
      movedRef.current = false;
      startRef.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      element.setPointerCapture(event.pointerId);
    },
    [inline],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (inline || !draggingRef.current || !startRef.current) return;
      const element = containerRef.current;
      if (!element) return;
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      const rect = element.getBoundingClientRect();
      const margin = 12;
      const nextLeft = clamp(startRef.current.left + dx, margin, window.innerWidth - rect.width - margin);
      const nextTop = clamp(startRef.current.top + dy, margin, window.innerHeight - rect.height - margin);
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
      setPos({ x: nextLeft, y: nextTop });
    },
    [clamp, inline],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (inline) return;
      const element = containerRef.current;
      if (element) element.releasePointerCapture(event.pointerId);
      draggingRef.current = false;
      startRef.current = null;
      if (movedRef.current && pos) {
        localStorage.setItem("salesape.chatButtonPos", JSON.stringify(pos));
      }
    },
    [inline, pos],
  );

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (movedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      movedRef.current = false;
      return;
    }
    setOpen((prev) => !prev);
  }, []);

  const button = (
    <button
      type="button"
      className="group flex h-10 items-center gap-2 rounded-md px-3 text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F724DE] focus:ring-offset-2"
      style={{ backgroundColor: BRAND_COLOR }}
      aria-label="Open APE assistant"
      title="Ask APE"
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = BRAND_HOVER;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = BRAND_COLOR;
      }}
    >
      {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
      <span className="hidden md:inline text-xs font-semibold">Ask APE</span>
    </button>
  );

  if (hidden) return null;

  return (
    <>
      {inline ? (
        <div ref={containerRef} className="relative">
          {button}
        </div>
      ) : (
        <div
          ref={containerRef}
          className={pos ? "fixed touch-none" : "fixed touch-none"}
          style={
            pos
              ? { left: pos.x, top: pos.y, zIndex: 50 }
              : { right: 24, bottom: 24, zIndex: 50 }
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {button}
        </div>
      )}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-screen w-full sm:max-w-md transition-all duration-200 ${
          open ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-full pointer-events-none"
        }`}
        style={{ zIndex: 50 }}
      >
        <ChatPanel
          fullHeight
          onClose={() => setOpen(false)}
          className="h-full border-l border-[#f724de]/20 shadow-2xl"
        />
      </div>
    </>
  );
}
