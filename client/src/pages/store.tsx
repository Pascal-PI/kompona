import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Crown, Check, ArrowLeft, Sparkles, Gift, Snowflake } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { getActiveBundles } from "@/constants/bundles";

type Entitlements = {
  ownedThemes: string[];
  membershipTier: string;
  membershipExpiresAt: string | null;
  allThemesUnlocked: boolean;
  hasTournamentAccess: boolean;
};

export default function Store() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  const { data: entitlements, isLoading: entitlementsLoading } = useQuery<Entitlements>({
    queryKey: ["/api/user/entitlements"],
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const canceled = params.get("canceled");
    if (canceled === "true") {
      toast({
        title: "Checkout Canceled",
        description: "Your purchase was canceled. No charges were made.",
      });
      setLocation("/store");
    }
  }, [searchParams]);

  const isThemeOwned = (theme: string) => {
    if (entitlements?.allThemesUnlocked) return true;
    return entitlements?.ownedThemes?.includes(theme) || false;
  };

  const hasMembership = entitlements?.membershipTier === 'premium' || entitlements?.membershipTier === 'platinum';
  const activeBundles = getActiveBundles();

  if (entitlementsLoading) {
    return (
      <div className="app-shell min-h-[100dvh] flex items-center justify-center">
        <div className="text-[#769656] text-xl">Loading store...</div>
      </div>
    );
  }

  return (
    <div className="app-shell store-page min-h-[100dvh] p-4">
      <div className="max-w-4xl mx-auto">
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

        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-[#769656]" />
          <h1 className="text-3xl font-bold text-[#769656]">Theme Store</h1>
        </div>

        {(entitlements?.membershipTier === 'premium' || entitlements?.membershipTier === 'platinum') && (
          <Card className={`mb-8 bg-gradient-to-r ${entitlements?.membershipTier === 'platinum' ? 'from-purple-100 to-indigo-100 border-purple-300' : 'from-amber-100 to-yellow-100 border-amber-300'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className={`w-6 h-6 ${entitlements?.membershipTier === 'platinum' ? 'text-purple-600' : 'text-amber-600'}`} />
                <div>
                  <p className={`font-semibold ${entitlements?.membershipTier === 'platinum' ? 'text-purple-800' : 'text-amber-800'}`}>
                    {entitlements?.membershipTier === 'platinum' ? 'Platinum Member' : 'Premium Member'}
                  </p>
                  <p className={`text-sm ${entitlements?.membershipTier === 'platinum' ? 'text-purple-700' : 'text-amber-700'}`}>
                    {entitlements?.membershipTier === 'platinum'
                      ? 'All themes + Tournament access unlocked! Thank you for your support.'
                      : 'All themes unlocked! Thank you for your support.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bundle Banners */}
        {activeBundles.map((bundle) => {
          const isBundleOwned = isThemeOwned(bundle.theme);

          if (isBundleOwned) {
            return (
              <Card key={bundle.id} className="mb-8 bg-gradient-to-r from-green-100 to-red-100 border-green-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Gift className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">{bundle.name} Active!</p>
                      <p className="text-sm text-green-700">You own this theme. Enjoy!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={bundle.id} className={`mb-8 bg-gradient-to-r ${bundle.gradientFrom} ${bundle.gradientVia || ''} ${bundle.gradientTo} ${bundle.borderColor} shadow-lg overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-2 left-4"><Snowflake className="w-8 h-8 text-blue-400" /></div>
                <div className="absolute top-8 right-8"><Snowflake className="w-6 h-6 text-blue-300" /></div>
                <div className="absolute bottom-4 left-12"><Snowflake className="w-5 h-5 text-blue-400" /></div>
                <div className="absolute bottom-6 right-16"><Snowflake className="w-7 h-7 text-blue-300" /></div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`${bundle.iconBgColor} text-white p-2 rounded-full`}>
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className={`${bundle.textColor} text-xl`}>
                        {bundle.name}
                      </CardTitle>
                      {bundle.badgeText && <Badge className={bundle.iconBgColor}>{bundle.badgeText}</Badge>}
                    </div>
                    <CardDescription className={bundle.accentColor}>
                      {bundle.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-2 flex-wrap">
                  {bundle.previewImages.map((img, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded-lg overflow-hidden border-2 border-red-200 shadow-md transform hover:scale-110 transition-transform"
                    >
                      <img src={img} alt="Card preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {bundle.extraCardCount > 0 && (
                    <div className="w-16 h-16 rounded-lg bg-red-200 border-2 border-red-300 flex items-center justify-center text-red-600 font-bold text-sm">
                      +{bundle.extraCardCount}
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {bundle.features.map((feature, i) => (
                    <div key={i} className={`flex items-center gap-2 ${bundle.accentColor}`}>
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2">
                <div className={`text-2xl font-bold ${bundle.textColor}`}>
                  ${bundle.price.toFixed(2)}
                </div>
                <Button
                  disabled
                  className="bg-gray-400 text-white cursor-not-allowed"
                  data-testid={`button-buy-${bundle.id}-disabled`}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {/* Subscription Plans */}
        {!hasMembership && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#769656] mb-4">Subscription Plans</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Premium Plan */}
              <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-600" />
                    <CardTitle className="text-amber-800">Premium</CardTitle>
                  </div>
                  <CardDescription className="text-amber-700">
                    Unlock all themes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      All 4 themes unlocked
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Future themes included
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Support game development
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-amber-800">$2.99/mo</div>
                  <Button
                    disabled
                    className="bg-gray-400 text-white cursor-not-allowed"
                    data-testid="button-buy-premium"
                  >
                    Coming Soon
                  </Button>
                </CardFooter>
              </Card>

              {/* Platinum Plan */}
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 shadow-lg ring-2 ring-purple-400">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <CardTitle className="text-purple-800">Platinum</CardTitle>
                    <Badge className="bg-purple-600">Best Value</Badge>
                  </div>
                  <CardDescription className="text-purple-700">
                    All themes + Tournament access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      All 4 themes unlocked
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Tournament Mode access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Exclusive AI difficulty levels
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Future premium features
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-purple-800">$4.99/mo</div>
                  <Button
                    disabled
                    className="bg-gray-400 text-white cursor-not-allowed"
                    data-testid="button-buy-platinum"
                  >
                    Coming Soon
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold text-[#769656] mb-4">Theme Packs</h2>

        <div className="grid md:grid-cols-3 gap-4">
           <Card className="store-theme-card bg-white/80 border-[#769656]/20">
             <div className="store-art theme-art-saints"><span>K</span></div>
            <CardHeader>
              <CardTitle className="text-[#769656] flex items-center justify-between">
                Catholic Saints
                <Badge variant="secondary" className="bg-green-100 text-green-700">Free</Badge>
              </CardTitle>
              <CardDescription>
                Beautiful portraits of Catholic saints and religious figures.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button disabled className="w-full bg-green-600">
                <Check className="w-4 h-4 mr-2" />
                Included Free
              </Button>
            </CardFooter>
          </Card>

          {['Animals', 'Barbie', 'Puppies'].map((themeName) => {
            const themeKey = themeName.toLowerCase();
            const owned = isThemeOwned(themeKey);
            return (
               <Card key={themeKey} className="store-theme-card bg-white/80 border-[#769656]/20">
                 <div className={`store-art theme-art-${themeKey}`}><span>K</span></div>
                <CardHeader>
                  <CardTitle className="text-[#769656] flex items-center justify-between">
                    {themeName}
                    {owned ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Owned</Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-300 text-orange-600">$0.99</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{themeName} themed card pack</CardDescription>
                </CardHeader>
                <CardFooter>
                  {owned ? (
                    <Button disabled className="w-full bg-green-600">
                      <Check className="w-4 h-4 mr-2" />
                      Owned
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-gray-400 text-white cursor-not-allowed"
                      data-testid={`button-buy-${themeKey}`}
                    >
                      Coming Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-[#769656]/5 border-[#769656]/20">
          <CardContent className="pt-6">
            <p className="text-sm text-[#769656]/70 text-center">
              Payments coming soon. Your purchased themes will be permanently linked to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
