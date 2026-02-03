"use client";
import { useEffect, useState } from "react";
export default function ClientDateTime({ value }: { value: string | number | Date | null }) {
  const [date, setDate] = useState("");
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setDate(`${d.toLocaleDateString()} ${d.toLocaleTimeString()}`);
    }
  }, [value]);
  return <>{date}</>;
}