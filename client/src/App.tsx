import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserHeader } from "@/components/UserHeader";
import { useAuth } from "@/hooks/useAuth";
import Game from "@/pages/game";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Store from "@/pages/store";
import Multiplayer from "@/pages/multiplayer";
import Learn from "@/pages/learn";
import Leaderboard from "@/pages/leaderboard";
import Tournament from "@/pages/tournament";
import Friends from "@/pages/friends";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
      return (
       <div className="kompana-app app-shell flex min-h-[100dvh] items-center justify-center">
        <div className="pascal-panel rounded-2xl px-8 py-6 text-[#d85b3f] text-xl font-semibold">Setting the table…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="kompana-app min-h-[100dvh] bg-[#f7efdf]">
        <Switch>
          <Route path="/" component={Login} />
          <Route component={Login} />
        </Switch>
      </div>
    );
  }

  return (
    <div className="kompana-app min-h-[100dvh] bg-[#f7efdf]">
      <UserHeader />
      <Switch>
        <Route path="/" component={Game} />
        <Route path="/game" component={Game} />
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        <Route path="/store" component={Store} />
        <Route path="/multiplayer" component={Multiplayer} />
        <Route path="/learn" component={Learn} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/tournament" component={Tournament} />
        <Route path="/friends" component={Friends} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
