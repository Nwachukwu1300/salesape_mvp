import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { WebsiteRenderer } from "../components/WebsiteRenderer";
import type { WebsiteConfig } from "../types/website-config";

export function LiveWebsite() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WebsiteConfig | null>(null);

  const apiBase = useMemo(() => {
    if (typeof window === "undefined") return "http://localhost:3001";
    return `http://${window.location.hostname}:3001`;
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiBase}/public/business?id=${id}`);
        if (!res.ok) throw new Error("Failed to load website");
        const data = await res.json();
        const cfg = (data?.business?.generatedConfig || null) as WebsiteConfig | null;
        if (!cfg) throw new Error("Website config not available yet");
        setConfig(cfg);
      } catch (err: any) {
        setError(err?.message || "Unable to load website");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [apiBase, id]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-gray-600">Loading live site...</div>;
  }

  if (error || !config || !id) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Live site unavailable</h1>
          <p className="text-gray-600">{error || "This site is not ready yet."}</p>
        </div>
      </div>
    );
  }

  return <WebsiteRenderer config={config} templateId={config.templateId} businessId={id} isPreview={false} />;
}

