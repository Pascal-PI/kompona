import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameMode } from "@/hooks/use-pexeso-game";
import { Grid, Zap, Clock, Target } from "lucide-react";

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeSelect: (mode: GameMode) => void;
  onStartGame: () => void;
}

const GAME_MODES: Array<{
  cards: GameMode;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Master';
  icon: React.ReactNode;
  gridSize: string;
  estimatedTime: string;
}> = [
  {
    cards: 8,
    title: "Quick Match",
    description: "Perfect for warming up",
    difficulty: 'Beginner',
    icon: <Zap className="w-5 h-5" />,
    gridSize: "2×4",
    estimatedTime: "1-2 min"
  },
  {
    cards: 16,
    title: "Classic",
    description: "Traditional Kompana experience",
    difficulty: 'Easy',
    icon: <Target className="w-5 h-5" />,
    gridSize: "4×4",
    estimatedTime: "3-5 min"
  },
  {
    cards: 32,
    title: "Standard",
    description: "Good challenge for regular players",
    difficulty: 'Medium',
    icon: <Grid className="w-5 h-5" />,
    gridSize: "4×8",
    estimatedTime: "5-8 min"
  },
  {
    cards: 48,
    title: "Extended",
    description: "Test your memory skills",
    difficulty: 'Hard',
    icon: <Clock className="w-5 h-5" />,
    gridSize: "6×8",
    estimatedTime: "8-12 min"
  },
  {
    cards: 64,
    title: "Challenge",
    description: "For experienced players",
    difficulty: 'Expert',
    icon: <Grid className="w-5 h-5" />,
    gridSize: "8×8",
    estimatedTime: "12-18 min"
  },
  {
    cards: 96,
    title: "Marathon",
    description: "Ultimate memory challenge",
    difficulty: 'Master',
    icon: <Target className="w-5 h-5" />,
    gridSize: "8×12",
    estimatedTime: "20-30 min"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Easy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Hard': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Master': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

export function GameModeSelector({ currentMode, onModeSelect, onStartGame }: GameModeSelectorProps) {
  return (
    <div className="min-h-screen bg-[#EEEED2] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#769656] mb-2">Choose Your Challenge</h1>
          <p className="text-[#769656]/70 text-lg">Select a game mode and test your memory against our AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {GAME_MODES.map((mode) => (
            <Card 
              key={mode.cards}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                currentMode === mode.cards 
                  ? 'ring-2 ring-[#769656] bg-[#769656]/5' 
                  : 'hover:scale-105'
              }`}
              onClick={() => onModeSelect(mode.cards)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {mode.icon}
                    <CardTitle className="text-lg text-[#769656]">{mode.title}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(mode.difficulty)}>
                    {mode.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-[#769656]/70">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-[#769656]/80">
                  <div className="flex justify-between">
                    <span>Cards:</span>
                    <span className="font-medium">{mode.cards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grid:</span>
                    <span className="font-medium">{mode.gridSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{mode.estimatedTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={onStartGame}
            size="lg"
            className="bg-[#769656] hover:bg-[#B58863] text-white px-8 py-3 text-lg"
          >
            Start Game ({currentMode} Cards)
          </Button>
        </div>
      </div>
    </div>
  );
}