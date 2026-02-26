import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";

export function ProtectedLayout() {
  const { user, loading } = useAuth();

  // Wait for auth to initialize
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → render full app layout
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}