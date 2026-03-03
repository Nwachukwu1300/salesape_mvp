import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Sparkles, Chrome, Mail, X, CheckCircle, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { getAccessToken } from "../lib/supabase";
import { ThemeToggle } from "../components/ThemeToggle";

// Dynamic API URL: uses the same host as the frontend but on port 3001
const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
};

const API_URL = getApiUrl();

export function AuthScreen() {
  const navigate = useNavigate();
  const {
    signIn,
    signUp,
    resetPassword,
    loading,
    signInWithGoogle,
    signInWithApple,
  } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Check if first visit using localStorage (client-side)
  useEffect(() => {
    const hasVisitedAuthScreen = localStorage.getItem("visited-auth-screen");
    if (!hasVisitedAuthScreen) {
      setIsFirstVisit(true);
      localStorage.setItem("visited-auth-screen", "true");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError("Full name is required");
      return;
    }

    try {
      console.log("handleSubmit: Attempting", isSignUp ? "sign up" : "sign in");
      if (isSignUp) {
        await signUp(email, password, fullName);
        console.log("handleSubmit: Sign up succeeded");
      } else {
        await signIn(email, password);
        console.log("handleSubmit: Sign in succeeded");
      }

      // Verify token exists in memory before navigation
      const token = getAccessToken();
      console.log(
        "handleSubmit: Token check before navigation -",
        token ? "FOUND" : "NOT FOUND",
      );

      if (!token) {
        throw new Error("No authentication token found - sign in failed");
      }

      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.message || err?.error || "Authentication failed";
      console.error("handleSubmit: Auth error -", message);
      setError(message);
      toast.error("Authentication Failed", {
        description: message,
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail);
      setResetEmailSent(true);
      toast.success("Password reset email sent!", {
        description: `Check your inbox at ${resetEmail}`,
      });
    } catch (error) {
      toast.error("Failed to send reset email", {
        description: "Please try again later",
      });
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetEmailSent(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900"
      style={{ backgroundColor: "#f4f0e5" }}
    >
      <style>{`
        @keyframes bounce-highlight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 4px rgba(247, 36, 222, 0.45)) drop-shadow(0 0 8px rgba(247, 36, 222, 0.3));
          }
          50% { 
            filter: drop-shadow(0 0 6px rgba(247, 36, 222, 0.6)) drop-shadow(0 0 12px rgba(247, 36, 222, 0.4));
          }
        }
        .audit-button-wrapper {
          animation: glow-pulse 2s ease-in-out infinite !important;
          display: inline-block;
          will-change: filter;
        }
        .audit-button-wrapper.bounce {
          animation: bounce-highlight 0.6s ease-in-out infinite, glow-pulse 2s ease-in-out infinite !important;
        }
        .audit-button-wrapper.no-bounce {
          animation: glow-pulse 2s ease-in-out infinite !important;
        }
        
        /* Responsive layout for audit controls */
        #audit-controls {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }
        
        @media (min-width: 1024px) {
          #audit-controls {
            flex-direction: row;
            align-items: center;
            gap: 0.75rem;
          }
        }
      `}</style>

      {/* Top Right Controls - Button above Toggle on mobile, side-by-side on large screens */}
      <div
        id="audit-controls"
        className="absolute top-4 right-4 z-50 pointer-events-auto"
      >
        {/* Audit Button */}
        <div
          className={`audit-button-wrapper ${isFirstVisit ? "bounce" : "no-bounce"}`}
          key={`bounce-${isFirstVisit}`}
        >
          <Button
            onClick={() => navigate("/audit")}
            variant="outline"
            size="sm"
            className="text-[11px] px-2 sm:px-2.5 py-0.5 h-7 whitespace-nowrap"
            style={
              {
                backgroundColor: "rgba(247, 36, 222, 0.1)",
                borderColor: "rgba(247, 36, 222, 0.6)",
                boxShadow:
                  "0 0 6px rgba(247, 36, 222, 0.35), 0 0 12px rgba(247, 36, 222, 0.22)",
              } as React.CSSProperties
            }
          >
            <Search className="w-3 h-3 mr-1" />
            Free SEO Audit
          </Button>
        </div>
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Transform your business into a fully operational website with
            AI-powered lead capture and booking
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                type="text"
                name="fullName"
                label="Full name"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSignUp) handleSubmit(e as any);
                }}
                required
              />
            )}

            <Input
              type="email"
              name="email"
              label="Email address"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e as any);
              }}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e as any);
              }}
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-medium hover:underline"
                  style={{ color: "#f724de" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <Sparkles className="w-5 h-5" />
              {loading ? "Loading..." : isSignUp ? "Get Started" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWithGoogle()}
            >
              <Chrome className="w-5 h-5" />
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWithApple()}
            >
              <Mail className="w-5 h-5" />
              Apple
            </Button>
          </div>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="font-medium"
              style={{ color: "#f724de" }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div
            className="flex items-center justify-center gap-6 text-sm"
            style={{ color: "#000000" }}
          >
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" style={{ color: "#f724de" }} />
              <span>AI-Powered</span>
            </div>
            <div>•</div>
            <div>No Credit Card Required</div>
            <div>•</div>
            <div>5 min setup</div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeForgotPasswordModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {!resetEmailSent ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Reset your password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Enter your email address and we'll send you a link to
                      reset your password.
                    </p>
                  </div>
                  <button
                    onClick={closeForgotPasswordModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Input
                    type="email"
                    label="Email address"
                    placeholder="you@business.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={closeForgotPasswordModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: "rgba(247, 36, 222, 0.1)" }}
                  >
                    <CheckCircle
                      className="w-8 h-8"
                      style={{ color: "#f724de" }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Check your email
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We've sent a password reset link to{" "}
                    <span className="font-medium" style={{ color: "#f724de" }}>
                      {resetEmail}
                    </span>
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2">
                      <strong className="text-gray-900 dark:text-white">
                        Didn't receive the email?
                      </strong>
                    </p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Check your spam folder</li>
                      <li>Verify the email address is correct</li>
                      <li>Wait a few minutes and try again</li>
                    </ul>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={closeForgotPasswordModal}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
