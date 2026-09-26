import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Settings as SettingsType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Palette, ArrowLeft, Lock, ShoppingCart, Crown, Check } from "lucide-react";
import { useLocation } from "wouter";

type Entitlements = {
  ownedThemes: string[];
  isPremium: boolean;
  premiumExpiresAt: string | null;
  allThemesUnlocked: boolean;
};

const themes = [
  {
    id: "saints",
    name: "Catholic Saints",
    description: "Beautiful portraits of Catholic saints and religious figures. Perfect for a spiritual and contemplative gaming experience.",
    free: true,
  },
  {
    id: "animals",
    name: "Animals",
    description: "Stunning wildlife portraits featuring diverse animals from around the world. Great for nature lovers and families.",
    free: false,
  },
  {
    id: "barbie",
    name: "Barbie Characters",
    description: "Inspiring Barbie dolls representing diverse careers and adventures. Empowering theme for all ages showcasing limitless possibilities.",
    free: false,
  },
  {
    id: "puppy",
    name: "Adorable Puppies",
    description: "Cute and cuddly puppy portraits featuring 30 different dog breeds. A heartwarming theme perfect for dog lovers of all ages!",
    free: false,
  },
  {
    id: "santa",
    name: "Christmas Special",
    description: "Festive holiday fun with Santa, reindeer, snowmen, and more! Limited time Christmas theme with 38 unique holiday characters.",
    free: false,
  },
  {
    id: "space",
    name: "Space Explorer",
    description: "Blast off with planets, rockets, astronauts, galaxies and more! 32 cosmic cards for stargazers and future astronauts. Free for all players!",
    free: true,
  },
  {
    id: "minecraft",
    name: "Minecraft Legends",
    description: "32 of Minecraft's most famous players and creators — Technoblade, Dream, TommyInnit, Notch, jeb_ and more — rendered as their iconic in-game skin heads.",
    free: false,
  },
];

export default function Settings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: settings, isLoading: settingsLoading } = useQuery<SettingsType>({
    queryKey: ["/api/user/settings"],
  });

  const { data: entitlements, isLoading: entitlementsLoading } = useQuery<Entitlements>({
    queryKey: ["/api/user/entitlements"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (theme: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft") => {
      return apiRequest("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify({ theme }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your theme preference has been saved successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isThemeOwned = (themeId: string): boolean => {
    if (themeId === "saints" || themeId === "space") return true;
    if (entitlements?.allThemesUnlocked) return true;
    return entitlements?.ownedThemes?.includes(themeId) || false;
  };

  const handleThemeChange = (theme: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft") => {
    if (!isThemeOwned(theme)) {
      toast({
        title: "Theme Locked",
        description: "Visit the Store to unlock this theme!",
      });
      return;
    }
    updateSettingsMutation.mutate(theme);
  };

  if (settingsLoading || entitlementsLoading) {
    return (
      <div className="app-shell min-h-[100dvh] flex items-center justify-center">
        <div className="text-[#769656] text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-[100dvh] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-[#769656] hover:bg-[#769656]/10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-[#769656]" />
            <h1 className="text-3xl font-bold text-[#769656]">Settings</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/store")}
            className="border-[#769656] text-[#769656] hover:bg-[#769656]/10"
            data-testid="button-store"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Theme Store
          </Button>
        </div>

        {entitlements?.isPremium && (
          <Card className="mb-6 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">Premium Member</p>
                  <p className="text-sm text-amber-700">All themes unlocked!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/80 border-[#769656]/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#769656]">
              <Palette className="w-5 h-5" />
              Card Theme
            </CardTitle>
            <CardDescription className="text-[#769656]/70">
              Choose which images to display on the memory cards during gameplay.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={settings?.theme || "saints"}
              onValueChange={handleThemeChange}
              disabled={updateSettingsMutation.isPending}
              data-testid="radio-theme-selection"
            >
              <div className="space-y-4">
                {themes.map((theme) => {
                  const owned = isThemeOwned(theme.id);
                  const isSelected = settings?.theme === theme.id;

                  return (
                    <div
                      key={theme.id}
                      className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${
                        owned
                          ? "border-[#769656]/20 hover:bg-[#769656]/5 cursor-pointer"
                          : "border-gray-200 bg-gray-50/50 opacity-75"
                      }`}
                    >
                      <RadioGroupItem
                        value={theme.id}
                        id={theme.id}
                        disabled={!owned}
                        data-testid={`radio-${theme.id}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={theme.id}
                            className={`text-base font-medium cursor-pointer ${
                              owned ? "text-[#769656]" : "text-gray-500"
                            }`}
                          >
                            {theme.name}
                          </Label>
                          {theme.free ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              Free
                            </Badge>
                          ) : owned ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Owned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              $0.99
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${owned ? "text-[#769656]/70" : "text-gray-400"}`}>
                          {theme.description}
                        </p>
                        {!owned && !theme.free && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-2 text-orange-600"
                            onClick={(e) => {
                              e.preventDefault();
                              setLocation("/store");
                            }}
                            data-testid={`link-unlock-${theme.id}`}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Unlock in Store
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            {updateSettingsMutation.isPending && (
              <div className="text-center py-2">
                <div className="text-sm text-[#769656]/70">Saving your preference...</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-[#769656]/5 border-[#769656]/20">
          <CardContent className="pt-6">
            <p className="text-sm text-[#769656]/70 text-center">
              Your theme preference is saved automatically and will apply to all future games. 
              Visit the <button onClick={() => setLocation("/store")} className="underline text-[#769656] font-medium">Theme Store</button> to unlock more themes!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
