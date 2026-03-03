import { toast } from "sonner";
import React, { useState } from "react";
import { WebsiteConfig } from "../types/website-config";
import {
  ImageHeavyTemplate,
  ServiceHeavyTemplate,
  LuxuryTemplate,
} from "../templates";

interface WebsiteRendererProps {
  config: WebsiteConfig;
  templateId: string;
  businessId: string;
  onLeadSubmit?: (data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) => Promise<void>;
  onBookingClick?: () => void;
  isPreview?: boolean;
  editMode?: boolean;
  onConfigChange?: (nextConfig: WebsiteConfig) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export const WebsiteRenderer: React.FC<WebsiteRendererProps> = ({
  config,
  templateId,
  businessId,
  onLeadSubmit,
  onBookingClick,
  isPreview = false,
  editMode = false,
  onConfigChange,
  onImageUpload,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageEditor, setImageEditor] = useState<{
    currentSrc: string;
    nextSrc: string;
    uploading?: boolean;
    dragActive?: boolean;
  } | null>(null);

  const normalizeGeneratedText = (value: string): string => {
    return value
      .replace(/\\r/g, "")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\([*_`#>-])/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/^\s*[-*]\s+/gm, "• ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const normalizeConfigObject = <T,>(input: T): T => {
    if (Array.isArray(input)) {
      return input.map((item) => normalizeConfigObject(item)) as unknown as T;
    }
    if (input && typeof input === "object") {
      const entries = Object.entries(input as Record<string, unknown>).map(
        ([key, value]) => [key, normalizeConfigObject(value)],
      );
      return Object.fromEntries(entries) as T;
    }
    if (typeof input === "string") {
      return normalizeGeneratedText(input) as unknown as T;
    }
    return input;
  };

  const normalizedConfig = normalizeConfigObject(config);

  const updateFirstMatchingString = (
    input: unknown,
    matcher: (value: string) => boolean,
    replacement: string,
  ): [unknown, boolean] => {
    if (typeof input === "string") {
      if (matcher(input)) return [replacement, true];
      return [input, false];
    }
    if (Array.isArray(input)) {
      let replaced = false;
      const next = input.map((item) => {
        if (replaced) return item;
        const [updated, didReplace] = updateFirstMatchingString(
          item,
          matcher,
          replacement,
        );
        if (didReplace) replaced = true;
        return updated;
      });
      return [next, replaced];
    }
    if (input && typeof input === "object") {
      let replaced = false;
      const source = input as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(source)) {
        if (replaced) {
          out[key] = source[key];
          continue;
        }
        const [updated, didReplace] = updateFirstMatchingString(
          source[key],
          matcher,
          replacement,
        );
        out[key] = updated;
        if (didReplace) replaced = true;
      }
      return [out, replaced];
    }
    return [input, false];
  };

  const commitInlineTextEdit = (editableNode: HTMLElement) => {
    const originalText = (editableNode.dataset.originalText || "").trim();
    const nextText = (editableNode.innerText || "").trim();

    editableNode.removeAttribute("contenteditable");
    editableNode.removeAttribute("spellcheck");
    editableNode.classList.remove("outline", "outline-2", "outline-fuchsia-400");
    delete editableNode.dataset.inlineEditing;
    delete editableNode.dataset.originalText;

    if (!originalText || !nextText || nextText === originalText) return;

    const [updated, replaced] = updateFirstMatchingString(
      config,
      (v) => v.trim() === originalText,
      nextText,
    );
    if (replaced && onConfigChange) onConfigChange(updated as WebsiteConfig);
  };

  const handleInlineEditCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPreview || !editMode) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Prevent template anchors/buttons from navigating while editing.
    if (target.closest("a, button")) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Image editing by URL replacement.
    const clickedImage = target.closest("img") as HTMLImageElement | null;
    if (clickedImage) {
      event.preventDefault();
      event.stopPropagation();
      const currentSrc = clickedImage.getAttribute("src") || "";
      if (!currentSrc) return;
      setImageEditor({ currentSrc, nextSrc: currentSrc, uploading: false, dragActive: false });
      return;
    }

    // Text editing for readable content nodes.
    const editableNode = target.closest(
      "h1, h2, h3, h4, h5, h6, p, span, li, blockquote",
    ) as HTMLElement | null;
    if (!editableNode) return;
    const currentText = (editableNode.innerText || "").trim();
    if (!currentText || currentText.length < 2) return;

    event.preventDefault();
    event.stopPropagation();
    if (editableNode.dataset.inlineEditing === "true") return;

    editableNode.dataset.inlineEditing = "true";
    editableNode.dataset.originalText = currentText;
    editableNode.setAttribute("contenteditable", "true");
    editableNode.setAttribute("spellcheck", "true");
    editableNode.classList.add("outline", "outline-2", "outline-fuchsia-400");
    editableNode.focus();

    // Move cursor to end.
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(editableNode);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!isPreview || !editMode) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.dataset.inlineEditing === "true") {
      commitInlineTextEdit(target);
    }
  };

  const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isPreview || !editMode) return;
    const target = event.target as HTMLElement | null;
    if (!target || target.dataset.inlineEditing !== "true") return;
    if (event.key === "Enter") {
      event.preventDefault();
      target.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      const originalText = target.dataset.originalText || "";
      target.innerText = originalText;
      target.blur();
    }
  };

  const applyImageSrcReplacement = (currentSrc: string, nextSrc: string) => {
    const cleaned = nextSrc.trim();
    if (!cleaned || cleaned === currentSrc) return;
    const [updated, replaced] = updateFirstMatchingString(
      config,
      (v) => v === currentSrc,
      cleaned,
    );
    if (replaced && onConfigChange) onConfigChange(updated as WebsiteConfig);
  };

  const handleImageFileUpload = async (file?: File | null) => {
    if (!file || !imageEditor) return;
    if (!file.type.startsWith("image/")) {
      toast.info("Please select an image file.");
      return;
    }
    if (!onImageUpload) {
      toast.info("Image upload is not configured.");
      return;
    }

    setImageEditor((prev) => (prev ? { ...prev, uploading: true } : prev));
    try {
      const uploadedUrl = await onImageUpload(file);
      if (!uploadedUrl) throw new Error("No image URL returned");
      applyImageSrcReplacement(imageEditor.currentSrc, uploadedUrl);
      setImageEditor(null);
      toast.success("Image replaced.");
    } catch (error: any) {
      console.error(error);
      toast.info(error?.message || "Failed to upload image");
      setImageEditor((prev) => (prev ? { ...prev, uploading: false } : prev));
    }
  };

  const handleLeadSubmit = async (data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) => {
    if (isPreview) {
      // In preview mode, just show success
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      return;
    }

    if (!onLeadSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onLeadSubmit(data);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingClick = () => {
    if (isPreview) {
      toast.info("Booking would open here in the live site.");
      return;
    }
    onBookingClick?.();
  };

  // Select template based on templateId
  const renderTemplate = () => {
    const commonProps = {
      config: normalizedConfig,
      businessId,
      onLeadSubmit: handleLeadSubmit,
      onBookingClick: handleBookingClick,
    };

    switch (templateId) {
      case "image-heavy":
        return <ImageHeavyTemplate {...commonProps} />;
      case "service-heavy":
        return <ServiceHeavyTemplate {...commonProps} />;
      case "luxury":
        return <LuxuryTemplate {...commonProps} />;
      default:
        // Default to service-heavy if unknown template
        return <ServiceHeavyTemplate {...commonProps} />;
    }
  };

  return (
    <div
      className="relative"
      onClickCapture={handleInlineEditCapture}
      onBlurCapture={handleBlurCapture}
      onKeyDownCapture={handleKeyDownCapture}
      title={editMode ? "Click text or image to edit" : undefined}
    >
      {/* Status Messages */}
      {(submitSuccess || submitError || isSubmitting) && (
        <div className="fixed top-4 right-4 z-[9999]">
          {isSubmitting && (
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </div>
          )}
          {submitSuccess && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Message sent successfully!
            </div>
          )}
          {submitError && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {submitError}
            </div>
          )}
        </div>
      )}

      {/* Render the selected template */}
      {renderTemplate()}

      {isPreview && editMode && imageEditor && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[min(92vw,28rem)] rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-100">
            Replace image
          </p>
          <div
            className={`mb-2 rounded border-2 border-dashed p-3 text-center text-xs ${
              imageEditor.dragActive
                ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30"
                : "border-gray-300 dark:border-gray-600"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setImageEditor((prev) => (prev ? { ...prev, dragActive: true } : prev));
            }}
            onDragLeave={() =>
              setImageEditor((prev) => (prev ? { ...prev, dragActive: false } : prev))
            }
            onDrop={(e) => {
              e.preventDefault();
              setImageEditor((prev) => (prev ? { ...prev, dragActive: false } : prev));
              void handleImageFileUpload(e.dataTransfer.files?.[0]);
            }}
          >
            Drag and drop an image here
            <div className="mt-2">
              <label
                htmlFor="website-image-upload-input"
                className="inline-block cursor-pointer rounded px-2 py-1 text-white"
                style={{ backgroundColor: "#f724de" }}
              >
                Select image
              </label>
              <input
                id="website-image-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleImageFileUpload(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </div>
          <p className="mb-1 text-[11px] text-gray-600 dark:text-gray-300">Or paste image URL:</p>
          <input
            type="url"
            value={imageEditor.nextSrc}
            onChange={(e) =>
              setImageEditor((prev) =>
                prev ? { ...prev, nextSrc: e.target.value } : prev,
              )
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 outline-none focus:border-fuchsia-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            disabled={!!imageEditor.uploading}
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:text-gray-200"
              disabled={!!imageEditor.uploading}
              onClick={() => setImageEditor(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-white"
              style={{ backgroundColor: "#f724de" }}
              disabled={!!imageEditor.uploading}
              onClick={() => {
                const nextSrc = imageEditor.nextSrc.trim();
                if (!nextSrc || nextSrc === imageEditor.currentSrc) {
                  setImageEditor(null);
                  return;
                }
                applyImageSrcReplacement(imageEditor.currentSrc, nextSrc);
                setImageEditor(null);
              }}
            >
              {imageEditor.uploading ? "Uploading..." : "Apply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteRenderer;
