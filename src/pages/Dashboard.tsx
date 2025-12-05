import { FileText, Wrench, Activity, Clock, Trash2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProcessingHistory } from "@/hooks/useProcessingHistory";
import { format } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const { history, loading, deleteFromHistory } = useProcessingHistory();

  const totalRefsProcessed = history.reduce((sum, item) => sum + item.references_found, 0);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {user ? `Welcome back${user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!` : 'Welcome!'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {user 
            ? "Here's an overview of your XML processing toolkit."
            : "Sign in to save your processing history."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tools Available"
          value={1}
          icon={Wrench}
        />
        <StatCard
          title="Documents Processed"
          value={history.length}
          icon={FileText}
          trend={history.length === 0 ? "Start processing" : undefined}
        />
        <StatCard
          title="References Processed"
          value={totalRefsProcessed}
          icon={Clock}
        />
        <StatCard
          title="Active Sessions"
          value={user ? 1 : 0}
          icon={Activity}
          trend={user ? "Online" : "Sign in"}
          trendUp={!!user}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/tools">
            <div className="group p-4 rounded-lg border border-border bg-background hover:border-primary/50 hover:shadow-soft transition-all cursor-pointer">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">XML Renumbering Tool</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically renumber bibliography references and update cross-references.
              </p>
              <Button variant="link" className="px-0 mt-2 text-primary">
                Open Tool →
              </Button>
            </div>
          </Link>

          <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-center min-h-[180px]">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <span className="text-muted-foreground text-xl">+</span>
            </div>
            <h3 className="font-medium text-muted-foreground">More Tools Coming Soon</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Additional XML processing utilities will be added here.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Processing History */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Processing History</h2>
        
        {!user ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Sign in to save your history</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Create an account to save and view your processing history.
            </p>
            <Button asChild className="mt-4">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No processing history yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Start using tools to see your history here.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/tools">Go to Tools</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {item.references_found} references processed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')} • 
                      Prefix: {item.prefix || '['} • Suffix: {item.suffix || ']'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFromHistory(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {history.length > 10 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                Showing 10 of {history.length} entries
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
