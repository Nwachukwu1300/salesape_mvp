import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { startConversation } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface ConversationState {
  sessionId: string;
  stage: string;
  currentQuestion: string;
  extracted: any;
  isComplete: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const ConversationUI: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initConversation = async () => {
      if (authLoading) return; // wait for auth to hydrate
      if (!user) {
        // not signed in
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const response = await startConversation();

        // Prepare an introductory message from the conversation AI (APE)
        const intro = `Hi, I'm APE. I will ask a few quick questions to understand your business and generate your website.`;

        // Save conversation state to sessionStorage for persistence
        const conversationState: ConversationState = {
          sessionId: response.sessionId,
          stage: response.stage,
          currentQuestion: (response.messages[0]?.content
            ? intro + "\n\n" + response.messages[0].content
            : intro),
          extracted: {},
          isComplete: false,
          questionNumber: 1,
          totalQuestions: response.totalQuestions || 11,
        };

        sessionStorage.setItem(
          `conv_${response.sessionId}`,
          JSON.stringify(conversationState),
        );

        setError(null);

        // Navigate to the first question page
        navigate(`/conversation/${response.sessionId}/question`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start conversation",
        );
        console.error("Conversation init error", err);
      } finally {
        setLoading(false);
      }
    };

    initConversation();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">
          Starting conversation...
        </p>
      </div>
    </div>
  );
};

export default ConversationUI;
