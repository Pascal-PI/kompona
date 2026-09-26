import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, ShoppingCart, BookOpen, Trophy, Users, Menu, Award, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

export function UserHeader() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("kompana-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("kompana-theme", isDark ? "dark" : "light");
  }, [isDark]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const typedUser = user as UserType;
  const displayName = typedUser.username || typedUser.email || 'Player';
  const initials = typedUser.username?.[0]?.toUpperCase() || 'P';

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex min-h-[76px] items-center justify-between border-b border-[#d6cbb9] bg-[#26343d] px-4 py-3 shadow-[0_8px_24px_rgba(38,52,61,.14)] sm:px-6 kompana-header">
      <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d85b3f] text-[#fff8ec] shadow-[0_3px_0_#a8412e]">
          <span className="font-serif text-xl font-bold" aria-hidden="true">K</span>
        </div>
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[.2em] text-[#fff8ec]">Kompana</p>
          <p className="text-xs text-[#c5c4bd]">Memory, with a little more nerve.</p>
        </div>
      </Link>
      
      <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
        <Link href="/multiplayer">
          <Button
            size="sm"
            className="hidden border-0 bg-[#397c70] text-[#fff8ec] hover:bg-[#326e64] sm:flex"
            data-testid="button-multiplayer"
          >
            <Users className="w-4 h-4 mr-2" />
            Play Online
          </Button>
        </Link>
        
        <Link href="/leaderboard">
          <Button
            size="sm"
            className="hidden border-0 bg-[#e5b84c] text-[#26343d] hover:bg-[#d9aa3e] sm:flex"
            data-testid="button-leaderboard"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Rankings
          </Button>
        </Link>

        <Button
          size="icon"
          type="button"
          className="border-0 bg-white/10 text-[#fff8ec] hover:bg-white/20"
          onClick={() => setIsDark((value) => !value)}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
             className="gap-2 border-0 bg-white/10 text-[#fff8ec] hover:bg-white/20"
              data-testid="button-menu"
            >
              <Avatar className="w-6 h-6">
               <AvatarFallback className="bg-[#397c70] text-[#fff8ec] text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {displayName}
              <Menu className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setLocation('/profile')} data-testid="menu-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/store')} data-testid="menu-store">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Store
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/tournament')} data-testid="menu-tournament">
              <Award className="w-4 h-4 mr-2" />
              Tournament
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/friends')} data-testid="menu-friends">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/learn')} data-testid="menu-learn">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
       </nav>
    </header>
  );
}
