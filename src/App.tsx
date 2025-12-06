import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Tools from "./pages/Tools";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}


function RequireToolActivation({ toolId, children }: { toolId: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (!user) {
        setAllowed(false);
        return;
      }
      const { data, error } = await supabase
        .from("tool_activations")
        .select("tool_id")
        .eq("user_id", user.id)
        .eq("tool_id", toolId)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        setAllowed(false);
      } else {
        setAllowed(!!data);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [user, toolId]);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to={`/tools/activate/${toolId}`} replace />;
  return <>{children}</>;
}

function RequireWhitelist({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (!user) {
        setAllowed(false);
        return;
      }
      const { data, error } = await supabase
        .from("app_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (error || !data) {
        setAllowed(false);
      } else {
        setAllowed(true);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function ToolActivationPage() {
  const { toolId } = useParams();
  const [key, setKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || key.trim().length < 8) {
      toast({ title: "Invalid key", description: "Enter a valid activation key.", variant: "destructive" });
      return;
    }
    if (!user || !toolId) {
      toast({ title: "Error", description: "You must be signed in.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("activate_tool", {
        p_user_id: user.id,
        p_tool_id: toolId,
        p_key: key.trim(),
      });
      if (error) {
        toast({ title: "Activation failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Tool activated", description: `${toolId} is now unlocked.` });
        navigate(`/tools/${toolId}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">Activate Tool</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <Input
              placeholder="Paste activation key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Activating..." : "Activate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/tools" element={<Navigate to="/tools/renumber" replace />} />
            <Route path="/tools/activate/:toolId" element={<ToolActivationPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <RequireWhitelist>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </RequireWhitelist>
                </RequireAuth>
              }
            />
            <Route
              path="/tools/renumber"
              element={
                <RequireAuth>
                  <RequireWhitelist>
                    <RequireToolActivation toolId="renumber">
                      <DashboardLayout>
                        <Tools />
                      </DashboardLayout>
                    </RequireToolActivation>
                  </RequireWhitelist>
                </RequireAuth>
              }
            />
            <Route
              path="/tools/formatter"
              element={
                <RequireAuth>
                  <RequireWhitelist>
                    <RequireToolActivation toolId="formatter">
                      <DashboardLayout>
                        <div className="text-muted-foreground">XML Formatter is coming soon.</div>
                      </DashboardLayout>
                    </RequireToolActivation>
                  </RequireWhitelist>
                </RequireAuth>
              }
            />
            <Route
              path="/tools/merge"
              element={
                <RequireAuth>
                  <RequireWhitelist>
                    <RequireToolActivation toolId="merge">
                      <DashboardLayout>
                        <div className="text-muted-foreground">XML Merge is coming soon.</div>
                      </DashboardLayout>
                    </RequireToolActivation>
                  </RequireWhitelist>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
