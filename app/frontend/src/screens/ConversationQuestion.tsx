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
import { SidebarNav } from "../components/SidebarNav";
import {
  sendConversationMessage,
  completeConversation,
  generateWebsiteConfig,
} from "../lib/api";

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

  const [state, setstate] = useState<ConversationState | null>(null);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const speakMessage = (text: string) => {
    if (!enableVoiceOutput) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
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
        setstate(state);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || sending || !state) return;

    setSending(true);
    setError(null);

    try {
      const response = await sendConversationMessage(
        state.sessionId,
        userInput,
      );

      if (response.isComplete) {
        setstate((prev) => (prev ? { ...prev, isComplete: true } : null));
        setGenerating(true);

        // Show "Generating" screen for 2 seconds
        setTimeout(async () => {
          try {
            const config = await generateWebsiteConfig(state.sessionId);
            navigate("/dashboard", { state: { websiteConfig: config } });
          } catch (err) {
            setError("Failed to generate website config");
            setGenerating(false);
          }
        }, 2000);
      } else {
        const newState: ConversationState = {
          sessionId: response.sessionId,
          stage: response.stage,
          currentQuestion:
            response.messages[response.messages.length - 1]?.content || "",
          extracted: response.extracted || state.extracted,
          isComplete: false,
          questionNumber: state.questionNumber + 1,
          totalQuestions: state.totalQuestions,
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
      setError(err instanceof Error ? err.message : "Failed to send message");
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
      <SidebarNav currentPath="/conversation" />
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
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
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
            {/* First line - greeting (smaller) */}
            <p className="text-base sm:text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300">
              {state.currentQuestion.split("\n")[0]}
            </p>

            {/* Main question (larger) */}
            {state.currentQuestion.includes("\n") && (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {
                  state.currentQuestion
                    .split("\n")
                    .slice(1)
                    .join("\n")
                    .split("\n")[0]
                }
              </h1>
            )}
          </div>

          {/* Extracted Data Summary (optional) */}
          {Object.keys(state.extracted).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                ✓ {Object.keys(state.extracted).length} field
                {Object.keys(state.extracted).length !== 1 ? "s" : ""} captured
                so far
              </p>
            </div>
          )}
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

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {isSpeaking ? "🔊 AI is speaking..." : "Powered by SalesAPE AI"}
        </p>
      </div>
    </div>
  );
};

export default ConversationQuestion;
