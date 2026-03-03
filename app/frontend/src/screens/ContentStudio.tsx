import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import {
  createBusinessContentInput,
  createBusiness,
  getBusinesses,
  getBusinessContentInputs,
  getBusinessRepurposedContent,
  getContentProjects,
  createContentProject,
  repurposeBusinessContent,
  uploadBusinessContentInput,
  deleteContentProject,
  deleteBusinessContentInput,
  scheduleRepurposedContent,
  getUpcomingSchedule,
  cancelScheduledPost,
  updateScheduledPost,
  type BusinessContentInput,
  type ContentProjectItem,
  type RepurposedContentItem,
} from "../lib/api";
import { ArrowLeft, Plus, Upload } from "lucide-react";

type InputType = "text" | "blog_url" | "video" | "audio";

const PLATFORM_OPTIONS = ["instagram", "tiktok", "youtube", "linkedin"] as const;

const STATUS_VARIANT: Record<string, string> = {
  processing: "warning",
  ready: "success",
  failed: "info",
  draft: "info",
  approved: "success",
  published: "primary",
};

export function ContentStudio() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pl-4 md:pl-0 pt-16 md:pt-0">
        <ContentStudioContent />
      </div>
    </div>
  );
}

function ContentStudioContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businessId, setBusinessId] = useState<string>("");
  const [contentInputs, setContentInputs] = useState<BusinessContentInput[]>([]);
  const [repurposedItems, setRepurposedItems] = useState<RepurposedContentItem[]>([]);
  const [contentProjects, setContentProjects] = useState<ContentProjectItem[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [draftType, setDraftType] = useState<InputType>("text");
  const [draftSource, setDraftSource] = useState<"url" | "file">("url");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState("Content Studio Workspace");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [repurposeNotice, setRepurposeNotice] = useState("");
  const [refreshingOutputs, setRefreshingOutputs] = useState(false);
  const [generationGrowthMode, setGenerationGrowthMode] = useState<
    "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE"
  >("BALANCED");
  const [genInputType, setGenInputType] = useState<"video" | "blog" | "text" | "voice">("text");
  const [genInputUrl, setGenInputUrl] = useState("");
  const [genInputText, setGenInputText] = useState("");
  const [genStyle, setGenStyle] = useState("educational");
  const [genReelsRequested, setGenReelsRequested] = useState(3);
  const [generationNotice, setGenerationNotice] = useState("");
  const outputsRef = useRef<HTMLDivElement>(null);
  const [scheduleTimes, setScheduleTimes] = useState<Record<string, string>>({});
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([]);
  const [scheduleSelection, setScheduleSelection] = useState<Record<string, boolean>>({});
  const [bulkScheduleTime, setBulkScheduleTime] = useState("");
  const [editingSchedule, setEditingSchedule] = useState<Record<string, string>>({});
  const activeTab = searchParams.get("tab") === "generate" ? "generate" : "repurpose";

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError("");
        const businesses = await getBusinesses();
        const id = Array.isArray(businesses) ? businesses[0]?.id : "";
        if (!id) {
          setError("No business found. Create a Content Studio workspace to get started.");
          return;
        }

        setBusinessId(id);
        await Promise.all([
          loadInputs(id),
          loadRepurposed(id),
          loadProjects(id),
          loadUpcomingSchedule(id),
        ]);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load Content Studio"));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const selectedInput = useMemo(
    () => contentInputs.find((input) => input.id === selectedInputId) || null,
    [contentInputs, selectedInputId],
  );

  const selectedRepurposed = useMemo(
    () =>
      selectedInputId
        ? repurposedItems.filter((item) => item.contentInputId === selectedInputId)
        : [],
    [repurposedItems, selectedInputId],
  );

  const loadInputs = async (id: string) => {
    const inputs = await getBusinessContentInputs(id);
    setContentInputs(inputs);
  };

  const loadRepurposed = async (id: string) => {
    const items = await getBusinessRepurposedContent(id);
    setRepurposedItems(items);
  };

  const loadProjects = async (id: string) => {
    try {
      const projects = await getContentProjects(id);
      setContentProjects(projects);
    } catch (err) {
      setContentProjects([]);
    }
  };

  const loadUpcomingSchedule = async (id: string) => {
    try {
      const scheduled = await getUpcomingSchedule(id);
      setUpcomingSchedule(Array.isArray(scheduled) ? scheduled : []);
    } catch (err) {
      setUpcomingSchedule([]);
    }
  };

  const waitForRepurposingCompletion = async (id: string, contentId: string) => {
    setRefreshingOutputs(true);
    const maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const [inputs, outputs] = await Promise.all([
        getBusinessContentInputs(id),
        getBusinessRepurposedContent(id),
      ]);
      setContentInputs(inputs);
      setRepurposedItems(outputs);

      const updatedInput = inputs.find((input) => input.id === contentId);
      const hasOutput = outputs.some((item) => item.contentInputId === contentId);
      if (hasOutput || updatedInput?.status === "ready" || updatedInput?.status === "failed") {
        setRefreshingOutputs(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    setRefreshingOutputs(false);
  };

  const handleCreateInput = async (payload: {
    type: InputType;
    title: string;
    content: string;
    url: string;
    file?: File;
  }) => {
    if (!businessId) return;
    try {
      setSubmitting(true);
      setError("");
      let contentInput: BusinessContentInput;
      if (payload.file && (payload.type === "video" || payload.type === "audio")) {
        const dataBase64 = await fileToDataUrl(payload.file);
        contentInput = await uploadBusinessContentInput(businessId, {
          type: payload.type,
          title: payload.title || undefined,
          fileName: payload.file.name,
          mimeType: payload.file.type || "application/octet-stream",
          dataBase64,
        });
      } else {
        contentInput = await createBusinessContentInput(businessId, {
          type: payload.type,
          title: payload.title || undefined,
          content: payload.type === "text" ? payload.content : undefined,
          url: payload.type !== "text" ? payload.url : undefined,
        });
      }

      await loadInputs(businessId);
      if (contentInput?.id) {
        setSelectedInputId(contentInput.id);
      }
      setShowNewForm(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create content input"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      setSubmitting(true);
      setError("");
      if (!workspaceUrl.trim()) {
        setError("Please provide a business website or public URL to create the workspace.");
        return;
      }
      const business = await createBusiness({
        name: workspaceName.trim() || "Content Studio Workspace",
        description: "Workspace created for content repurposing.",
        url: workspaceUrl.trim(),
      });
      const nextId = business?.id;
      if (!nextId) {
        throw new Error("Failed to create workspace");
      }
      setBusinessId(nextId);
      setWorkspaceUrl("");
      await Promise.all([
        loadInputs(nextId),
        loadRepurposed(nextId),
        loadProjects(nextId),
        loadUpcomingSchedule(nextId),
      ]);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create Content Studio workspace"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepurpose = async (contentId: string) => {
    if (!businessId) return;
    try {
      setSubmitting(true);
      setError("");
      await repurposeBusinessContent(
        businessId,
        contentId,
        [...PLATFORM_OPTIONS],
      );
      setRepurposeNotice("Repurposing started. We’ll surface new outputs automatically.");
      await waitForRepurposingCompletion(businessId, contentId);
      setSelectedInputId(contentId);
      setRepurposeNotice("Repurposing completed. View outputs below.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to repurpose content"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!businessId) return;
    try {
      setSubmitting(true);
      setError("");
      const payload = {
        inputType: genInputType,
        inputUrl: genInputType !== "text" ? genInputUrl.trim() : undefined,
        inputText: genInputType === "text" ? genInputText.trim() : undefined,
        reelsRequested: Math.max(1, Math.min(5, genReelsRequested)),
        style: genStyle,
        growthMode: generationGrowthMode,
      };
      await createContentProject(businessId, payload);
      setGenerationNotice("Generation started. Your new project will appear below.");
      setGenInputUrl("");
      setGenInputText("");
      await loadProjects(businessId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to generate content"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleOutput = async (repurposedId: string, overrideTime?: string) => {
    if (!businessId) return;
    const scheduledFor = overrideTime || scheduleTimes[repurposedId];
    if (!scheduledFor) {
      setError("Choose a date and time to schedule this post.");
      return;
    }
    try {
      setSubmitting(true);
      await scheduleRepurposedContent(businessId, repurposedId, scheduledFor);
      await loadUpcomingSchedule(businessId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to schedule content"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSchedule = async (scheduledPostId: string) => {
    if (!businessId) return;
    try {
      setSubmitting(true);
      await cancelScheduledPost(businessId, scheduledPostId);
      await loadUpcomingSchedule(businessId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to cancel scheduled post"));
    } finally {
      setSubmitting(false);
    }
  };

  const scheduleForTomorrowNine = (repurposedId: string) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const isoLocal = new Date(
      tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
    setScheduleTimes((prev) => ({ ...prev, [repurposedId]: isoLocal }));
    return isoLocal;
  };

  const handleBulkSchedule = async () => {
    if (!businessId) return;
    const selected = Object.entries(scheduleSelection)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
    if (selected.length === 0) {
      setError("Select at least one output to schedule.");
      return;
    }
    const scheduledFor = bulkScheduleTime;
    if (!scheduledFor) {
      setError("Choose a date and time for bulk scheduling.");
      return;
    }
    try {
      setSubmitting(true);
      await Promise.all(
        selected.map((repurposedId) =>
          scheduleRepurposedContent(businessId, repurposedId, scheduledFor),
        ),
      );
      setScheduleSelection({});
      await loadUpcomingSchedule(businessId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to bulk schedule content"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSchedule = async (scheduledPostId: string) => {
    if (!businessId) return;
    const scheduledFor = editingSchedule[scheduledPostId];
    if (!scheduledFor) {
      setError("Choose a new date/time.");
      return;
    }
    try {
      setSubmitting(true);
      await updateScheduledPost(businessId, scheduledPostId, { scheduledFor });
      await loadUpcomingSchedule(businessId);
      setEditingSchedule((prev) => {
        const next = { ...prev };
        delete next[scheduledPostId];
        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update scheduled post"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!businessId) return;
    if (!confirm("Delete this generated content project?")) return;
    try {
      setSubmitting(true);
      await deleteContentProject(businessId, projectId);
      await loadProjects(businessId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete content project"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInput = async (contentId: string) => {
    if (!businessId) return;
    if (!confirm("Delete this content input and its outputs?")) return;
    try {
      setSubmitting(true);
      await deleteBusinessContentInput(businessId, contentId);
      await loadInputs(businessId);
      await loadRepurposed(businessId);
      if (selectedInputId === contentId) {
        setSelectedInputId(null);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete content input"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading Content Studio...</p>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Your Content Studio Workspace
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              This keeps Content Studio independent and lets you repurpose content without setup in other areas.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Workspace name</label>
              <input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            {selectedRepurposed.length > 0 && (
              <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Bulk schedule</span>
                  <input
                    type="datetime-local"
                    value={bulkScheduleTime}
                    onChange={(e) => setBulkScheduleTime(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkSchedule}
                    disabled={submitting}
                  >
                    Schedule selected
                  </Button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Business website or public URL</label>
              <input
                value={workspaceUrl}
                onChange={(e) => setWorkspaceUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <Button variant="primary" onClick={handleCreateWorkspace} disabled={submitting}>
              {submitting ? "Creating..." : "Create Workspace"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedInput && activeTab === "repurpose") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedInputId(null)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content Inputs
        </button>

        {repurposeNotice && (
          <Card className="mb-6 border-blue-200 dark:border-blue-500/30">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-blue-700 dark:text-blue-300">{repurposeNotice}</p>
              <Button
                variant="primary"
                onClick={() => outputsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                View outputs
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedInput.title || "Untitled Content"}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant={STATUS_VARIANT[selectedInput.status]}>
                {selectedInput.status}
              </Badge>
              <Badge variant="info">{selectedInput.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedInput.content && (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedInput.content}
              </p>
            )}
            {selectedInput.url && (
              <a
                href={selectedInput.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 underline break-all"
              >
                {selectedInput.url}
              </a>
            )}

            <div ref={outputsRef}>
              <h3 className="text-lg font-semibold mb-3">Repurposed Outputs</h3>
              {selectedRepurposed.length === 0 ? (
                <p className="text-gray-500 mb-4">
                  {refreshingOutputs
                    ? "Generating outputs. This updates automatically."
                    : "No outputs yet. Generate platform variants for this content."}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRepurposed.map((item) => {
                    const performance =
                      typeof item.performance === "object" && item.performance !== null
                        ? (item.performance as {
                            status?: string;
                            message?: string;
                            metrics?: Record<string, number | null>;
                          })
                        : null;
                    const trendHooks = Array.isArray(item.trendHooks)
                      ? item.trendHooks
                      : [];
                    const metadata =
                      typeof item.metadata === "object" && item.metadata !== null
                        ? (item.metadata as Record<string, unknown>)
                        : null;
                    const shotList = Array.isArray(metadata?.shotList) ? metadata?.shotList : null;
                    const onScreenText = Array.isArray(metadata?.onScreenText)
                      ? metadata?.onScreenText
                      : null;
                    const bRollGuide = Array.isArray(metadata?.bRollGuide) ? metadata?.bRollGuide : null;
                    const cutTimestamps =
                      metadata?.cutTimestamps && typeof metadata.cutTimestamps === "object"
                        ? metadata.cutTimestamps
                        : null;

                    return (
                      <Card key={item.id}>
                        <CardHeader className="pb-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-semibold capitalize">{item.platform}</h4>
                            <Badge variant={STATUS_VARIANT[item.status]}>
                              {item.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={!!scheduleSelection[item.id]}
                              onChange={(e) =>
                                setScheduleSelection((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.checked,
                                }))
                              }
                            />
                            <span>Select for bulk schedule</span>
                          </div>
                          {item.assetUrl && (
                            <video className="w-full rounded-lg" controls>
                              <source src={item.assetUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {item.content}
                          </p>
                          {item.score !== undefined && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Score: <span className="font-semibold">{item.score}/100</span>
                            </p>
                          )}
                          {trendHooks.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Trend hooks: {trendHooks.slice(0, 3).join(", ")}
                            </div>
                          )}
                          {!performance && (
                            <div className="text-xs text-amber-600 dark:text-amber-300">
                              Performance not available at this moment.
                            </div>
                          )}
                          {shotList && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Shot list: {shotList.slice(0, 3).join(" | ")}
                            </div>
                          )}
                          {onScreenText && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              On-screen text: {onScreenText.slice(0, 3).join(" | ")}
                            </div>
                          )}
                          {bRollGuide && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              B-roll guide: {bRollGuide.slice(0, 2).join(" | ")}
                            </div>
                          )}
                          {cutTimestamps && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Cut: {String((cutTimestamps as any).start ?? 0)}s -
                              {String((cutTimestamps as any).end ?? 0)}s
                            </div>
                          )}
                          <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <label className="text-xs text-gray-500 dark:text-gray-400">
                              Schedule this post
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="datetime-local"
                                value={scheduleTimes[item.id] || ""}
                                onChange={(e) =>
                                  setScheduleTimes((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScheduleOutput(item.id)}
                                disabled={submitting}
                              >
                                Schedule
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const next = scheduleForTomorrowNine(item.id);
                                  setScheduleTimes((prev) => ({ ...prev, [item.id]: next }));
                                  handleScheduleOutput(item.id, next);
                                }}
                                disabled={submitting}
                              >
                                Schedule for tomorrow 9am
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              variant="primary"
              onClick={() => handleRepurpose(selectedInput.id)}
              disabled={submitting}
            >
              {submitting ? "Generating..." : "Repurpose Content"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Content Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ingest content from text or cloud URLs and generate platform-ready variants.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === "repurpose" ? "primary" : "outline"}
            onClick={() => setSearchParams({ tab: "repurpose" })}
          >
            Repurpose Content
          </Button>
          <Button
            variant={activeTab === "generate" ? "primary" : "outline"}
            onClick={() => setSearchParams({ tab: "generate" })}
          >
            Generate Content
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 dark:border-red-500/30">
          <CardContent>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {activeTab === "generate" && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-bold">Generate New Content (AI)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This creates new video or text content from an input source.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                Experimental: Generation output may change as we refine the model pipeline.
              </div>
              {generationNotice && (
                <p className="text-sm text-blue-600 dark:text-blue-300">{generationNotice}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Input type</label>
                  <select
                    value={genInputType}
                    onChange={(e) => setGenInputType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="text">Text</option>
                    <option value="blog">Blog URL</option>
                    <option value="video">Video URL</option>
                    <option value="voice">Voice transcript</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Growth mode</label>
                  <div className="flex flex-wrap gap-2">
                    {(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setGenerationGrowthMode(mode)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                          generationGrowthMode === mode
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200"
                            : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {mode === "CONSERVATIVE"
                          ? "Conservative"
                          : mode === "BALANCED"
                            ? "Balanced"
                            : "Aggressive"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {genInputType === "text" || genInputType === "voice" ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Input text</label>
                  <textarea
                    value={genInputText}
                    onChange={(e) => setGenInputText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Paste your source text or transcript"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Source URL</label>
                  <input
                    value={genInputUrl}
                    onChange={(e) => setGenInputUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Style</label>
                  <select
                    value={genStyle}
                    onChange={(e) => setGenStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="educational">Educational</option>
                    <option value="authority">Authority</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="entertaining">Entertaining</option>
                    <option value="bold">Bold</option>
                    <option value="calm">Calm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reels requested</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={genReelsRequested}
                    onChange={(e) => setGenReelsRequested(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="primary" onClick={handleGenerateContent} disabled={submitting}>
                    {submitting ? "Generating..." : "Generate Content"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {contentProjects.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-bold">Generated Content Projects</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentProjects.map((project) => (
                    <div key={project.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div>
                        <span className="font-semibold capitalize">{project.inputType}</span>
                        <span className="ml-2 text-gray-500">
                          Reels: {project.reelsGenerated ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANT[project.status] || "info"}>
                          {project.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={submitting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === "repurpose" && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="primary"
              onClick={() => {
                setDraftType("video");
                setDraftSource("file");
                setShowNewForm(true);
              }}
            >
              <Upload className="w-5 h-5" />
              Upload Video
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDraftType("video");
                setDraftSource("url");
                setShowNewForm(true);
              }}
            >
              <Plus className="w-5 h-5" />
              Paste Video URL
            </Button>
            <Button variant="ghost" onClick={() => setShowNewForm((v) => !v)}>
              <Plus className="w-5 h-5" />
              New Content Input
            </Button>
          </div>
        </>
      )}

      {showNewForm && activeTab === "repurpose" && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold">Add Content</h2>
          </CardHeader>
          <CardContent>
            <NewContentInputForm
              onSubmit={handleCreateInput}
              onCancel={() => setShowNewForm(false)}
              submitting={submitting}
              initialType={draftType}
              initialSource={draftSource}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "repurpose" && (contentInputs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              No content inputs yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first text, video URL, audio URL, or blog URL input.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentInputs.map((input) => {
            const outputCount = repurposedItems.filter(
              (item) => item.contentInputId === input.id,
            ).length;
            return (
              <Card key={input.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {input.title || "Untitled Content"}
                    </h3>
                    <Badge variant={STATUS_VARIANT[input.status]}>{input.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Type: {input.type}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-gray-500">{outputCount} outputs</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        onClick={() => setSelectedInputId(input.id)}
                      >
                        View
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRepurpose(input.id);
                        }}
                        disabled={submitting || input.status === "processing"}
                      >
                        Repurpose
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInput(input.id);
                        }}
                        disabled={submitting}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}

      {activeTab === "repurpose" && (
        <Card className="mt-10">
          <CardHeader>
            <h2 className="text-xl font-bold">Upcoming Scheduled Posts</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lightweight scheduling list for planned posts.
            </p>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-sm text-gray-500">No scheduled posts yet.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedule.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                  >
                    <div>
                      <div className="font-semibold capitalize">
                        {post.repurposedContent?.platform || "platform"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {post.repurposedContent?.content?.slice(0, 80) || "Scheduled post"}
                      </div>
                      <div className="mt-2">
                        <input
                          type="datetime-local"
                          value={
                            editingSchedule[post.id] ||
                            (post.scheduledFor
                              ? new Date(
                                  new Date(post.scheduledFor).getTime() -
                                    new Date(post.scheduledFor).getTimezoneOffset() * 60000,
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : "")
                          }
                          onChange={(e) =>
                            setEditingSchedule((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          className="px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xs text-gray-500">
                        {post.scheduledFor
                          ? new Date(post.scheduledFor).toLocaleString()
                          : "TBD"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelSchedule(post.id)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateSchedule(post.id)}
                        disabled={submitting}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

function NewContentInputForm({
  onSubmit,
  onCancel,
  submitting,
  initialType,
  initialSource,
}: {
  onSubmit: (payload: {
    type: InputType;
    title: string;
    content: string;
    url: string;
    file?: File;
  }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  initialType?: InputType;
  initialSource?: "url" | "file";
}) {
  const [type, setType] = useState<InputType>(initialType || "text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<"url" | "file">(initialSource || "url");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    if (initialType) setType(initialType);
    if (initialSource) setSource(initialSource);
  }, [initialType, initialSource, touched]);

  const isTextType = type === "text";
  const canUploadFile = type === "video" || type === "audio";
  const useFileUpload = !isTextType && canUploadFile && source === "file";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({
      type,
      title,
      content: content.trim(),
      url: url.trim(),
      file,
    });

    setTitle("");
    setContent("");
    setUrl("");
    setFile(undefined);
    setSource("url");
    setType("text");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-2">Content Type</label>
        <select
          value={type}
          onChange={(e) => {
            setTouched(true);
            setType(e.target.value as InputType);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="text">Text</option>
          <option value="blog_url">Blog URL</option>
          <option value="video">Video URL</option>
          <option value="audio">Audio URL</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: New product launch script"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      {isTextType ? (
        <div>
          <label className="block text-sm font-medium mb-2">Text Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your raw content here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-28 dark:bg-gray-800 dark:border-gray-600"
            required
          />
        </div>
      ) : (
        <div className="space-y-4">
          {canUploadFile && (
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                value={source}
                onChange={(e) => {
                  setTouched(true);
                  setSource(e.target.value as "url" | "file");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="url">Cloud/Public URL</option>
                <option value="file">Local Device Upload</option>
              </select>
            </div>
          )}

          {useFileUpload ? (
            <div>
              <label className="block text-sm font-medium mb-2">Local File</label>
              <input
                type="file"
                accept={type === "video" ? "video/*" : "audio/*"}
                onChange={(e) => {
                  const next = e.target.files?.[0];
                  setFile(next);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Max file size: 15MB</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Cloud/Public URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                required
              />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 pt-2">
        <Button variant="primary" type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Saving..." : "Save Content"}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null) {
    const possible = err as { error?: string; message?: string };
    if (possible.error) return possible.error;
    if (possible.message) return possible.message;
  }
  return fallback;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
