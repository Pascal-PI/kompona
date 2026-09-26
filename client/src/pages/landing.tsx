import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Zap, Trophy, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#769656] to-[#B58863]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-16">
          <h1 className="text-6xl font-bold mb-4">Kompana</h1>
          <p className="text-xl opacity-90 mb-8">
            Challenge yourself with the ultimate Catholic saints memory game
          </p>
          <Button 
            size="lg" 
            className="bg-[#EEEED2] text-[#769656] hover:bg-white text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Playing
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardHeader className="text-center">
              <Crown className="w-12 h-12 mx-auto mb-4 text-[#EEEED2]" />
              <CardTitle>6 Difficulty Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                From Beginner (100) to Master (2500+) - each with unique AI forgetting patterns
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardHeader className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-[#EEEED2]" />
              <CardTitle>Smart AI Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                AI learns from every card revealed and forgets at difficulty-based rates
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-[#EEEED2]" />
              <CardTitle>Catholic Saints Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Beautiful portraits of Catholic saints as your memory cards
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#EEEED2]" />
              <CardTitle>Chess.com Style</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Familiar rating system and polished UI inspired by Chess.com
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How to Play */}
        <Card className="bg-white/10 backdrop-blur border-white/20 text-white max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-[#EEEED2] mb-2">1</div>
                <h3 className="font-semibold mb-2">Choose Difficulty</h3>
                <p className="text-white/80">Select from 6 AI difficulty levels</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#EEEED2] mb-2">2</div>
                <h3 className="font-semibold mb-2">Match Saints</h3>
                <p className="text-white/80">Flip cards to find matching saint pairs</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#EEEED2] mb-2">3</div>
                <h3 className="font-semibold mb-2">Beat the AI</h3>
                <p className="text-white/80">Get more pairs than your AI opponent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/60 mt-16">
          <p>Sign in to start your journey and track your progress!</p>
        </div>
      </div>
    </div>
  );
}