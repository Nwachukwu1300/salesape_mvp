import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  Loader,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  completeConversation,
  createBusiness,
  generateWebsiteConfig,
  API_BASE,
} from "../lib/api";
import { getAccessToken } from "../lib/supabase";

interface ConversationState {
  sessionId: string;
  stage: string;
  currentQuestion: string;
  extracted: any;
  isComplete: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const ConversationQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioControllerRef = useRef<AbortController | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const [state, setstate] = useState<ConversationState | null>(null);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runGeneration = async (extracted: any, sessionIdValue: string) => {
    setGenerating(true);
    try {
      const baseName = String(extracted.name || "my-business")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "my-business";

      const business = await createBusiness({
        name: extracted.name || "My Business",
        description:
          extracted.valueProposition ||
          "Business created from onboarding conversation",
        url: `https://${baseName}.example.com`,
      });

      const businessId = business?.id;
      if (!businessId) {
        throw new Error("Failed to create business from conversation");
      }

      await completeConversation(sessionIdValue, businessId);

      let config: any = null;
      try {
        config = await generateWebsiteConfig(businessId);
      } catch (genErr) {
        console.error("Failed to generate website config:", genErr);
      }
      navigate(`/website-preview/${businessId}`, {
        state: { websiteConfig: config, businessId },
      });
    } catch (err) {
      setError("Failed to generate website config");
      setGenerating(false);
    }
  };

  // Voice feature states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [enableVoiceInput, setEnableVoiceInput] = useState(true);
  const [enableVoiceOutput, setEnableVoiceOutput] = useState(true);

  // Initialize voice recognition and synthesis
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        setError(`Voice error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setUserInput("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopAudio = () => {
    if (audioControllerRef.current) {
      audioControllerRef.current.abort();
      audioControllerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setIsSpeaking(false);
  };

  const speakMessage = async (text: string) => {
    if (!enableVoiceOutput) return;
    if (!text.trim()) return;

    stopAudio();

    const token = getAccessToken();
    if (!token) {
      setError("Voice output requires a signed-in session");
      return;
    }

    const controller = new AbortController();
    audioControllerRef.current = controller;

    const url = API_BASE ? `${API_BASE}/api/tts` : "/api/tts";

    try {
      setIsSpeaking(true);

      // Start local speech immediately
      let localSpeaking = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.onstart = () => {
            localSpeaking = true;
            setIsSpeaking(true);
          };
          utterance.onend = () => {
            localSpeaking = false;
          };
          utterance.onerror = () => {
            localSpeaking = false;
          };
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, voice: "nova" }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = "";
        try {
          const err = await response.json();
          detail = err?.error || err?.details || err?.message || "";
        } catch {
          detail = await response.text();
        }
        throw new Error(detail || "Failed to generate audio");
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      const canStream =
        typeof MediaSource !== "undefined" &&
        MediaSource.isTypeSupported("audio/mpeg");

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (canStream && response.body) {
        const mediaSource = new MediaSource();
        const mediaUrl = URL.createObjectURL(mediaSource);
        audioUrlRef.current = mediaUrl;
        audio.src = mediaUrl;

        await new Promise<void>((resolve) => {
          mediaSource.addEventListener(
            "sourceopen",
            () => {
              const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
              sourceBuffer.mode = "sequence";

              const queue: Uint8Array[] = [];
              let done = false;

              const appendNext = () => {
                if (sourceBuffer.updating) return;
                if (queue.length) {
                  sourceBuffer.appendBuffer(queue.shift()!);
                } else if (done) {
                  mediaSource.endOfStream();
                }
              };

              sourceBuffer.addEventListener("updateend", appendNext);

              const reader = response.body!.getReader();
              const pump = async () => {
                while (true) {
                  const { value, done: streamDone } = await reader.read();
                  if (streamDone) {
                    done = true;
                    appendNext();
                    break;
                  }
                  if (value && value.length) {
                    queue.push(value);
                    appendNext();
                  }
                }
              };

              pump().catch(() => {
                try {
                  mediaSource.endOfStream();
                } catch {}
              });

              resolve();
            },
            { once: true },
          );
        });

        await audio.play();
      } else {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        audioUrlRef.current = blobUrl;
        audio.src = blobUrl;
        await audio.play();
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") return;
      stopAudio();
      const message = err instanceof Error ? err.message : "Failed to play audio";
      setError(message);
      // Keep local TTS if it already started; no extra fallback here.
    }
  };

  // Load conversation state
  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const savedState = sessionStorage.getItem(`conv_${sessionId}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        const fixedTotal = state.totalQuestions || 7;
        const fixedState = {
          ...state,
          totalQuestions: fixedTotal,
          questionNumber: Math.min(state.questionNumber || 1, fixedTotal),
        };
        setstate(fixedState);
        sessionStorage.setItem(`conv_${sessionId}`, JSON.stringify(fixedState));

        // Speak the question if voice output enabled
        if (enableVoiceOutput) {
          speakMessage(state.currentQuestion);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load conversation state");
        setLoading(false);
      }
    } else {
      setError("Conversation session not found");
      setLoading(false);
    }
  }, [sessionId, enableVoiceOutput]);

  useEffect(() => {
    if (!enableVoiceOutput) {
      stopAudio();
    }
  }, [enableVoiceOutput]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || sending || !state) return;

    setSending(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const response = await new Promise<any>((resolve, reject) => {
        const controller = new AbortController();
        const body = JSON.stringify({
          sessionId: state.sessionId,
          message: userInput,
        });

        fetch(`${API_BASE}/conversation/message`, {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
          signal: controller.signal,
        })
          .then(async (res) => {
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("text/event-stream")) {
              const fallback = await res.json();
              return resolve(fallback);
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No stream body");
            const decoder = new TextDecoder();
            let buf = "";
            let assistantText = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              const lines = buf.split(/\r?\n/);
              buf = lines.pop() || "";
              for (const line of lines) {
                if (!line.startsWith("data:")) continue;
                const payload = line.replace(/^data:\s?/, "");
                try {
                  const obj = JSON.parse(payload);
                  if (obj.delta) {
                    assistantText += obj.delta;
                    setstate((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentQuestion: assistantText,
                          }
                        : prev,
                    );
                  }
                  if (obj.done && obj.payload) {
                    resolve({
                      ...obj.payload,
                      messages: [
                        ...(state ? [{ role: "assistant", content: assistantText }] : []),
                      ],
                    });
                    return;
                  }
                } catch {
                  assistantText += payload;
                  setstate((prev) =>
                    prev
                      ? {
                          ...prev,
                          currentQuestion: assistantText,
                        }
                      : prev,
                  );
                }
              }
            }
            resolve({});
          })
          .catch(reject);
      });

      if (response.isComplete) {
        const newState: ConversationState = {
          sessionId: response.sessionId,
          stage: response.stage,
          currentQuestion:
            response.messages[response.messages.length - 1]?.content || "",
          extracted: response.extracted || state.extracted,
          isComplete: true,
          questionNumber: Math.min(state.questionNumber, response.totalQuestions || 7),
          totalQuestions: response.totalQuestions || 7,
        };

        setstate(newState);
        sessionStorage.setItem(
          `conv_${state.sessionId}`,
          JSON.stringify(newState),
        );
        setUserInput("");

        if (enableVoiceOutput) {
          speakMessage(newState.currentQuestion);
        }

        // Auto-generate when user confirms "Yes"
        const yes = userInput.trim().toLowerCase();
        const confirmations = new Set([
          "yes",
          "y",
          "yep",
          "yeah",
          "ok",
          "okay",
          "sure",
          "go ahead",
          "goahead",
          "proceed",
          "continue",
          "sounds good",
        ]);
        if (confirmations.has(yes)) {
          runGeneration(newState.extracted || {}, newState.sessionId);
        }
      } else {
        const newState: ConversationState = {
          sessionId: response.sessionId,
          stage: response.stage,
          currentQuestion:
            response.messages[response.messages.length - 1]?.content || "",
          extracted: response.extracted || state.extracted,
          isComplete: false,
          questionNumber: Math.min(
            state.questionNumber + 1,
            response.totalQuestions || 7,
          ),
          totalQuestions: response.totalQuestions || 7,
        };

        setstate(newState);
        sessionStorage.setItem(
          `conv_${state.sessionId}`,
          JSON.stringify(newState),
        );
        setUserInput("");

        // Speak the new question
        if (enableVoiceOutput) {
          speakMessage(newState.currentQuestion);
        }

        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err) {
      if (typeof err === "object" && err) {
        const possible = err as { error?: string; message?: string; details?: { message?: string } };
        setError(possible.error || possible.message || possible.details?.message || "Failed to send message");
      } else {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    } finally {
      setSending(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (generating) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Generating your website...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This may take a moment
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading question...
          </p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 flex flex-col overflow-hidden">
      {/* Header with Progress */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="flex-1 text-center mx-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Question {state.questionNumber} of {state.totalQuestions}
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "#F724DE",
                width: `${(state.questionNumber / state.totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Question Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 md:py-10">
        <div className="max-w-3xl w-full space-y-6">
          {/* Greeting or Question Text */}
          <div className="space-y-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight whitespace-pre-wrap">
              {state.currentQuestion}
            </div>
          </div>

          
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 sm:px-6 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mx-4 rounded-lg mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Sticky Bottom Input */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 md:p-6 space-y-3 shadow-lg">
        <audio
          ref={audioRef}
          className="hidden"
          onEnded={() => setIsSpeaking(false)}
          onPause={() => setIsSpeaking(false)}
          onError={() => setIsSpeaking(false)}
        />
        {/* Voice controls */}
        {voiceSupported && (
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => setEnableVoiceInput(!enableVoiceInput)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                enableVoiceInput
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
              title="Toggle voice input"
            >
              {enableVoiceInput ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Voice On</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Voice Off</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEnableVoiceOutput(!enableVoiceOutput)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                enableVoiceOutput
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
              title="Toggle voice output"
            >
              {enableVoiceOutput ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Audio Off</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Input Form */}
        {!state.isComplete && (
          <form
          onSubmit={handleSendMessage}
          className="flex flex-col sm:flex-row gap-2 w-full"
          >
          <Input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={
              isListening ? "🎤 Listening..." : "Type or speak your answer..."
            }
            disabled={sending}
            className="flex-1 text-sm w-full sm:w-auto"
            autoComplete="off"
            autoFocus
          />
          <div className="flex gap-2 w-full sm:w-auto">
            {voiceSupported && enableVoiceInput && (
              <Button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={sending}
                className={`px-3 py-2 flex-shrink-0 ${isListening ? "bg-red-600 hover:bg-red-700" : ""}`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                <Mic
                  className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`}
                />
              </Button>
            )}
            <Button
              type="submit"
              disabled={sending || !userInput.trim()}
              className="px-4 py-2 flex-1 sm:flex-none"
            >
              {sending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : state.isComplete ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          </form>
        )}

        {state.isComplete && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              disabled={generating}
              onClick={() =>
                runGeneration(state.extracted || {}, state.sessionId)
              }
            >
              {generating ? "Generating..." : "Generate Website"}
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {isSpeaking ? "🔊 AI is speaking..." : "Powered by SalesAPE AI"}
        </p>
      </div>
    </div>
  );
};

export default ConversationQuestion;
