import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Meeting from "@/pages/Meeting";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      
      <Route path="/">
        {() => {
          if (isLoading) {
            return (
              <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            );
          }
          return user ? <Dashboard /> : <Home />;
        }}
      </Route>
      
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      
      <Route path="/meeting/:roomId">
        {() => <ProtectedRoute component={Meeting} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
