import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  Dumbbell, 
  BookOpen, 
  Star, 
  Trophy,
  Brain,
  Eye,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  Play,
  RotateCcw,
  Grid3X3,
  LayoutGrid,
  Hash,
  UserRound,
  History,
  Image,
  Home,
  Layers,
  Building,
  Puzzle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Cross,
  Book,
  Bird,
  Heart,
  Crown,
  Sun,
  Moon,
  Feather,
  Church,
  HandHeart,
  Sparkles,
  Flower2
} from 'lucide-react';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface Tip {
  id: string;
  title: string;
  description: string;
  level: SkillLevel;
  Icon: React.ComponentType<{ className?: string }>;
}

const tips: Tip[] = [
  {
    id: '1',
    title: 'Start from the Corners',
    description: 'Begin by revealing cards in the corners and edges. These positions are easier to remember because they have distinct locations.',
    level: 'beginner',
    Icon: Grid3X3
  },
  {
    id: '2',
    title: 'Create Mental Groups',
    description: 'Group cards by their position on the board. Think of the grid in sections (top-left, top-right, etc.) to organize your memory.',
    level: 'beginner',
    Icon: LayoutGrid
  },
  {
    id: '3',
    title: 'Focus on Unmatched Cards',
    description: 'After seeing a card, actively remember its position. When you see its pair later, you\'ll know exactly where to find the match.',
    level: 'beginner',
    Icon: Eye
  },
  {
    id: '4',
    title: 'Use the Grid Pattern',
    description: 'Assign numbers or letters to rows and columns. A card at row 2, column 3 becomes "2-3" in your mind, making it easier to recall.',
    level: 'intermediate',
    Icon: Hash
  },
  {
    id: '5',
    title: 'Watch Your Opponent',
    description: 'Pay close attention to cards revealed by the AI or other players. Their mistakes are your opportunities - remember what they reveal!',
    level: 'intermediate',
    Icon: UserRound
  },
  {
    id: '6',
    title: 'Prioritize Recent Cards',
    description: 'Recently revealed cards are easier to remember. When you see a card, quickly scan your memory for its pair among recent reveals.',
    level: 'intermediate',
    Icon: History
  },
  {
    id: '7',
    title: 'Create Visual Stories',
    description: 'Link card images to their positions using vivid imagery. For example, imagine a saint "standing" at a specific corner of the board.',
    level: 'advanced',
    Icon: Image
  },
  {
    id: '8',
    title: 'Memory Palace Technique',
    description: 'Imagine the game board as a room in your house. Place each card image at a specific location in your mental room for powerful recall.',
    level: 'advanced',
    Icon: Home
  },
  {
    id: '9',
    title: 'Chunk Information',
    description: 'Don\'t try to remember every card individually. Group 3-4 cards together and remember them as a single unit with relationships.',
    level: 'advanced',
    Icon: Layers
  }
];

interface Technique {
  id: string;
  title: string;
  description: string;
  content: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const techniques: Technique[] = [
  {
    id: '1',
    title: 'The Method of Loci (Memory Palace)',
    description: 'One of the oldest and most powerful memory techniques, dating back to ancient Greece.',
    content: `The Method of Loci, also known as the Memory Palace technique, involves visualizing a familiar place (like your home) and "placing" items you want to remember at specific locations along a mental journey through that space.

**How to apply it to Kompana:**
1. Imagine the game board as a familiar room
2. Assign each grid position to a piece of furniture or feature
3. When you see a card, visualize the saint image interacting with that furniture
4. To recall, mentally "walk" through the room

**Example:** If St. Francis appears in the top-left corner, imagine him feeding birds by your front door. When you need to find St. Francis again, mentally walk to your door.

This technique is incredibly powerful for larger board sizes (48+ cards) where simple memorization fails.`,
    Icon: Building
  },
  {
    id: '2',
    title: 'Chunking',
    description: 'Break down large amounts of information into smaller, manageable groups.',
    content: `Chunking is the process of grouping individual pieces of information into larger, meaningful units. Your brain can typically hold 4-7 items in working memory, so chunking helps you remember more.

**How to apply it to Kompana:**
1. Divide the board into 4 or 6 sections mentally
2. Focus on one section at a time
3. Remember cards within each section as a group
4. Link sections together progressively

**Example:** On a 32-card board, think of it as four 8-card quadrants. Master one quadrant before moving to the next.

**Pro tip:** Look for natural groupings - cards of similar colors, saints with similar attributes, or cards revealed in sequence.`,
    Icon: Puzzle
  },
  {
    id: '3',
    title: 'Association & Visualization',
    description: 'Create vivid mental connections between card images and their positions.',
    content: `Your brain remembers vivid, unusual, or emotionally engaging images far better than abstract facts. By creating strong visual associations, you transform position memory into memorable scenes.

**How to apply it to Kompana:**
1. For each card position, create a vivid image
2. Make the association unusual or funny
3. Include action and emotion in your mental picture
4. The more absurd, the more memorable

**Example:** If St. Patrick (known for driving out snakes) appears in the center, imagine snakes slithering away from the center of the board in all directions.

**Key principles:**
- Use exaggeration (make things huge or tiny)
- Add movement and action
- Include sounds and emotions
- Make it personal to you`,
    Icon: Lightbulb
  },
  {
    id: '4',
    title: 'Spaced Repetition',
    description: 'Review information at increasing intervals for long-term retention.',
    content: `While spaced repetition is typically used for long-term learning, its principles can improve your game session memory.

**How to apply it to Kompana:**
1. After seeing a card, mentally review its position after 2-3 turns
2. If you remember correctly, extend the review interval
3. If you forget, shorten the interval
4. Prioritize reviewing cards you've struggled with

**In-game strategy:**
- After revealing a new card, count 3 turns, then mentally quiz yourself
- Use the waiting time during opponent's turn to review
- Focus extra attention on cards you've forgotten before

**Why it works:** Each successful recall strengthens the memory trace, making future recalls easier and faster.`,
    Icon: RefreshCw
  }
];

interface ExerciseCard {
  id: number;
  Icon: React.ComponentType<{ className?: string }>;
  isFlipped: boolean;
  isMatched: boolean;
}

interface ExerciseState {
  isActive: boolean;
  score: number;
  total: number;
  currentRound: number;
  cards: ExerciseCard[];
  firstCard: number | null;
  canFlip: boolean;
  startTime: number | null;
  timeElapsed: number;
}

const cardIcons = [
  Cross, Book, Bird, Heart, Crown, Sun, Moon, Feather, Church, HandHeart, Sparkles, Flower2
];

export default function Learn() {
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | 'all'>('all');
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);
  const [exercise, setExercise] = useState<ExerciseState>({
    isActive: false,
    score: 0,
    total: 0,
    currentRound: 1,
    cards: [],
    firstCard: null,
    canFlip: true,
    startTime: null,
    timeElapsed: 0
  });

  const filteredTips = selectedLevel === 'all' 
    ? tips 
    : tips.filter(tip => tip.level === selectedLevel);

  const getLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
    }
  };

  const getLevelLabel = (level: SkillLevel) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
    }
  };

  const startExercise = () => {
    const numPairs = 6;
    const selectedIcons = cardIcons.slice(0, numPairs);
    const cardPairs = [...selectedIcons, ...selectedIcons];
    
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    const cards: ExerciseCard[] = cardPairs.map((Icon, index) => ({
      id: index,
      Icon,
      isFlipped: false,
      isMatched: false
    }));

    setExercise({
      isActive: true,
      score: 0,
      total: 0,
      currentRound: exercise.currentRound,
      cards,
      firstCard: null,
      canFlip: true,
      startTime: Date.now(),
      timeElapsed: 0
    });
  };

  const handleCardClick = (cardId: number) => {
    if (!exercise.canFlip) return;
    
    const card = exercise.cards[cardId];
    if (card.isFlipped || card.isMatched) return;

    const newCards = [...exercise.cards];
    newCards[cardId] = { ...newCards[cardId], isFlipped: true };

    if (exercise.firstCard === null) {
      setExercise(prev => ({
        ...prev,
        cards: newCards,
        firstCard: cardId
      }));
    } else {
      const firstCardData = exercise.cards[exercise.firstCard];
      
      setExercise(prev => ({
        ...prev,
        cards: newCards,
        canFlip: false,
        total: prev.total + 1
      }));

      setTimeout(() => {
        if (firstCardData.Icon === card.Icon) {
          const matchedCards = newCards.map((c, i) => 
            i === exercise.firstCard || i === cardId 
              ? { ...c, isMatched: true }
              : c
          );
          
          const allMatched = matchedCards.every(c => c.isMatched);
          
          setExercise(prev => ({
            ...prev,
            cards: matchedCards,
            firstCard: null,
            canFlip: true,
            score: prev.score + 1,
            isActive: !allMatched,
            timeElapsed: allMatched && prev.startTime ? Math.floor((Date.now() - prev.startTime) / 1000) : prev.timeElapsed
          }));
        } else {
          const resetCards = newCards.map((c, i) => 
            i === exercise.firstCard || i === cardId 
              ? { ...c, isFlipped: false }
              : c
          );
          
          setExercise(prev => ({
            ...prev,
            cards: resetCards,
            firstCard: null,
            canFlip: true
          }));
        }
      }, 1000);
    }
  };

  return (
    <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-chess-secondary flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-chess-primary" />
            Learn & Improve
          </h1>
          <p className="text-gray-300 font-roboto">Master memory techniques and become a Kompana champion</p>
        </header>

        <Tabs defaultValue="tips" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-chess-secondary/20">
            <TabsTrigger 
              value="tips" 
              className="data-[state=active]:bg-chess-primary data-[state=active]:text-white"
              data-testid="tab-tips"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Tips & Strategies
            </TabsTrigger>
            <TabsTrigger 
              value="practice" 
              className="data-[state=active]:bg-chess-primary data-[state=active]:text-white"
              data-testid="tab-practice"
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Practice Lab
            </TabsTrigger>
            <TabsTrigger 
              value="techniques" 
              className="data-[state=active]:bg-chess-primary data-[state=active]:text-white"
              data-testid="tab-techniques"
            >
              <Brain className="w-4 h-4 mr-2" />
              Memory Techniques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips">
            <div className="mb-4 flex gap-2 flex-wrap">
              <Button
                variant={selectedLevel === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel('all')}
                className={selectedLevel === 'all' ? 'bg-chess-primary' : 'border-chess-secondary text-chess-secondary'}
                data-testid="filter-all"
              >
                All Levels
              </Button>
              <Button
                variant={selectedLevel === 'beginner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel('beginner')}
                className={selectedLevel === 'beginner' ? 'bg-green-500' : 'border-green-500 text-green-500'}
                data-testid="filter-beginner"
              >
                <Star className="w-4 h-4 mr-1" />
                Beginner
              </Button>
              <Button
                variant={selectedLevel === 'intermediate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel('intermediate')}
                className={selectedLevel === 'intermediate' ? 'bg-yellow-500' : 'border-yellow-500 text-yellow-500'}
                data-testid="filter-intermediate"
              >
                <Trophy className="w-4 h-4 mr-1" />
                Intermediate
              </Button>
              <Button
                variant={selectedLevel === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel('advanced')}
                className={selectedLevel === 'advanced' ? 'bg-red-500' : 'border-red-500 text-red-500'}
                data-testid="filter-advanced"
              >
                <Zap className="w-4 h-4 mr-1" />
                Advanced
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTips.map((tip) => (
                <Card 
                  key={tip.id} 
                  className="bg-chess-secondary/20 border-chess-secondary/30 hover:border-chess-primary/50 transition-colors"
                  data-testid={`card-tip-${tip.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-chess-primary/20 flex items-center justify-center">
                          <tip.Icon className="w-5 h-5 text-chess-primary" />
                        </div>
                        <CardTitle className="text-lg text-chess-secondary">{tip.title}</CardTitle>
                      </div>
                      <Badge className={`${getLevelColor(tip.level)} text-white text-xs`}>
                        {getLevelLabel(tip.level)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm leading-relaxed">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="practice">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-chess-secondary/20 border-chess-secondary/30">
                <CardHeader>
                  <CardTitle className="text-xl text-chess-secondary flex items-center gap-2">
                    <Target className="w-5 h-5 text-chess-primary" />
                    Quick Match Exercise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Practice your memory with a quick 12-card matching exercise. 
                    Try to find all pairs with as few moves as possible!
                  </p>

                  {!exercise.isActive && exercise.cards.length === 0 && (
                    <Button 
                      onClick={startExercise}
                      className="w-full bg-chess-primary hover:bg-chess-primary/80"
                      data-testid="button-start-exercise"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Exercise
                    </Button>
                  )}

                  {exercise.isActive && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Matches: {exercise.score}/6</span>
                        <span className="text-gray-400">Attempts: {exercise.total}</span>
                      </div>
                      <Progress value={(exercise.score / 6) * 100} className="h-2" />
                      
                      <div className="grid grid-cols-4 gap-2">
                        {exercise.cards.map((card) => {
                          const CardIcon = card.Icon;
                          return (
                            <button
                              key={card.id}
                              onClick={() => handleCardClick(card.id)}
                              className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${
                                card.isMatched
                                  ? 'bg-green-500/30 border-2 border-green-500'
                                  : card.isFlipped
                                  ? 'bg-chess-primary text-white'
                                  : 'bg-chess-secondary/40 hover:bg-chess-secondary/60 cursor-pointer'
                              }`}
                              disabled={card.isMatched || !exercise.canFlip}
                              data-testid={`exercise-card-${card.id}`}
                            >
                              {(card.isFlipped || card.isMatched) && (
                                <CardIcon className="w-6 h-6" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!exercise.isActive && exercise.cards.length > 0 && (
                    <div className="space-y-4 text-center">
                      <div className="py-6">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-chess-secondary mb-2">Excellent!</h3>
                        <p className="text-gray-300">
                          You completed the exercise in {exercise.total} attempts!
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Time: {exercise.timeElapsed} seconds
                        </p>
                        <div className="mt-4">
                          <Badge className={`${
                            exercise.total <= 8 ? 'bg-yellow-500' : 
                            exercise.total <= 12 ? 'bg-gray-400' : 'bg-orange-500'
                          } text-white`}>
                            {exercise.total <= 8 ? 'Perfect Memory!' : 
                             exercise.total <= 12 ? 'Great Job!' : 'Keep Practicing!'}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={startExercise}
                        className="bg-chess-primary hover:bg-chess-primary/80"
                        data-testid="button-restart-exercise"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-chess-secondary/20 border-chess-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
                      <Eye className="w-5 h-5 text-chess-primary" />
                      Observation Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Before clicking, take a moment to scan the entire board</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Say the symbol name and position out loud to reinforce memory</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Look for patterns in card positions</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-chess-secondary/20 border-chess-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
                      <Clock className="w-5 h-5 text-chess-primary" />
                      Practice Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Perfect Score (6-8 attempts)</span>
                        <Badge className="bg-yellow-500 text-white">Gold</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Great Score (9-12 attempts)</span>
                        <Badge className="bg-gray-400 text-white">Silver</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Good Score (13+ attempts)</span>
                        <Badge className="bg-orange-500 text-white">Bronze</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="techniques">
            <div className="space-y-4">
              {techniques.map((technique) => (
                <Card 
                  key={technique.id}
                  className="bg-chess-secondary/20 border-chess-secondary/30"
                  data-testid={`card-technique-${technique.id}`}
                >
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setExpandedTechnique(
                      expandedTechnique === technique.id ? null : technique.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-chess-primary/20 flex items-center justify-center">
                          <technique.Icon className="w-6 h-6 text-chess-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-chess-secondary">{technique.title}</CardTitle>
                          <p className="text-gray-400 text-sm mt-1">{technique.description}</p>
                        </div>
                      </div>
                      {expandedTechnique === technique.id ? (
                        <ChevronUp className="w-5 h-5 text-chess-primary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-chess-primary" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedTechnique === technique.id && (
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        {technique.content.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return (
                              <h4 key={idx} className="text-chess-secondary font-bold mt-4 mb-2">
                                {paragraph.replace(/\*\*/g, '')}
                              </h4>
                            );
                          }
                          if (paragraph.startsWith('**')) {
                            const parts = paragraph.split('**');
                            return (
                              <p key={idx} className="text-gray-300 mb-3">
                                <strong className="text-chess-secondary">{parts[1]}</strong>
                                {parts[2]}
                              </p>
                            );
                          }
                          if (paragraph.match(/^\d\./)) {
                            const lines = paragraph.split('\n');
                            return (
                              <ol key={idx} className="list-decimal list-inside text-gray-300 space-y-1 mb-3">
                                {lines.map((line, lineIdx) => (
                                  <li key={lineIdx}>{line.replace(/^\d\.\s*/, '')}</li>
                                ))}
                              </ol>
                            );
                          }
                          if (paragraph.startsWith('-')) {
                            const lines = paragraph.split('\n');
                            return (
                              <ul key={idx} className="list-disc list-inside text-gray-300 space-y-1 mb-3">
                                {lines.map((line, lineIdx) => (
                                  <li key={lineIdx}>{line.replace(/^-\s*/, '')}</li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={idx} className="text-gray-300 mb-3 leading-relaxed">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
