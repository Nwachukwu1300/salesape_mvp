import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { startConversation } from "../lib/api";
import { Button } from "../components/Button";

export function CreateWebsite() {
  const navigate = useNavigate();
  const { user, loading: authLoading, getToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const startedRef = useRef(false);
  const [lastBackendError, setLastBackendError] = useState<string>("");

  useEffect(() => {
    // If auth is still loading, don't do anything yet
    if (authLoading) {
      console.log("Auth is loading, waiting...");
      return;
    }

    // If no user and auth is done loading, redirect to login
    if (!user && !authLoading) {
      console.log("No user found and auth loaded - redirecting to login");
      setError("You must be logged in to create a website.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Auth is ready and we have a user - start conversation
    if (user && !startedRef.current) {
      startedRef.current = true;
      initConversation();
    }
  }, [user, authLoading]);

  const initConversation = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      setLastBackendError("");

      const token = getToken();
      if (!token) {
        console.warn("Authentication token missing; attempting conversation anyway.");
      }

      // use shared API client; it applies baseURL/proxy and adds auth header
      const data = await startConversation();
      console.log("Conversation started:", data);

      if (data?.sessionId) {
        // Save conversation state to sessionStorage
        const conversationState = {
          sessionId: data.sessionId,
          stage: data.stage || "initial",
          currentQuestion:
            data.currentQuestion || "What is your business name?",
          extracted: data.extracted || {},
          isComplete: data.isComplete || false,
          questionNumber: data.questionNumber || 1,
          totalQuestions: data.totalQuestions || 7,
        };
        sessionStorage.setItem(
          `conv_${data.sessionId}`,
          JSON.stringify(conversationState),
        );

        // Navigate to conversation page
        navigate(`/conversation/${data.sessionId}/question`);
      } else {
        throw new Error("No session ID received from server");
      }
    } catch (err: any) {
      console.error("Error starting conversation:", err);
      let backendMsg = "";
      let errorMsg = "Failed to start conversation";

      if (typeof err === "string") {
        backendMsg = err.trim();
      } else if (err && typeof err === "object" && typeof err.toString === "function") {
        const raw = err.toString();
        if (raw && raw !== "[object Object]" && !raw.startsWith("Error:")) {
          backendMsg = raw;
        }
      }

      if (err.name === "AbortError") {
        errorMsg =
          "Request timeout - server took too long to respond. Please try again.";
      } else if (!backendMsg && typeof err?.message === "string" && err.message.trim()) {
        backendMsg = err.message.trim();
      } else if (!backendMsg && typeof err?.error === "string" && err.error.trim()) {
        backendMsg = err.error.trim();
      } else if (!backendMsg && typeof err?.details === "string" && err.details.trim()) {
        backendMsg = err.details.trim();
      } else if (!backendMsg && err?.response?.data?.message) {
        backendMsg = String(err.response.data.message);
      } else if (!backendMsg && err?.response?.data?.error) {
        backendMsg = String(err.response.data.error);
      } else if (!backendMsg && err?.message) {
        backendMsg = String(err.message);
      }

      if (backendMsg) {
        setLastBackendError(backendMsg);
        setError(`Could not start your conversation. ${backendMsg}`);
      } else {
        setError(`Could not start your conversation. ${errorMsg}`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show initialization state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Starting website creation wizard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <div className="max-w-md">
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                {lastBackendError ? (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Backend: {lastBackendError}
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => {
                      startedRef.current = false;
                      initConversation();
                    }}
                    size="sm"
                  >
                    Retry
                  </Button>
                  <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm">
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Starting conversation...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Initializing AI conversation for your website
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateWebsite;
