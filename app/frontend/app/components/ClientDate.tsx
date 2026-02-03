"use client";
import { useEffect, useState } from "react";
export default function ClientDate({ value }: { value: string | number | Date | null }) {
  const [date, setDate] = useState("");
  useEffect(() => {
    if (value) {
      setDate(new Date(value).toLocaleDateString());
    }
  }, [value]);
  return <>{date}</>;
}