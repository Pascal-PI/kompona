import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, User, Clock, Users, Zap, Play, Square, Calendar, Award, ArrowLeft, Lock, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';
import type { User as UserType, TournamentSeason, TournamentRating } from '@shared/schema';

interface TournamentLeaderboardPlayer {
  rank: number;
  username: string;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: string;
}

interface MyTournamentRating extends TournamentRating {
  rank?: number;
  gamesPlayed?: number;
  gamesWon?: number;
}

interface GameCard {
  id: number;
  symbolKey: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameState {
  cards: GameCard[];
  currentPlayer: 1 | 2;
  player1Score: number;
  player2Score: number;
  flippedCards: number[];
  cardCount: number;
  theme: string;
}

interface Opponent {
  username: string;
  rating: number;
}

type QueueState = 'idle' | 'joining' | 'queued' | 'playing' | 'finished';

export default function Tournament() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [queueState, setQueueState] = useState<QueueState>('idle');
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [queueTime, setQueueTime] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const queueTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [roomId, setRoomId] = useState('');
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [canFlip, setCanFlip] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | 'draw' | null>(null);
  const [ratingChange, setRatingChange] = useState(0);

  const { data: activeSeason, isLoading: loadingSeason } = useQuery<TournamentSeason>({
    queryKey: ['/api/tournaments/active'],
    retry: false,
  });

  const { data: myRating, isLoading: loadingRating, refetch: refetchRating } = useQuery<MyTournamentRating>({
    queryKey: ['/api/tournaments/my-rating'],
    enabled: !!activeSeason && !!user,
    retry: false,
  });

  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<TournamentLeaderboardPlayer[]>({
    queryKey: ['/api/tournaments/leaderboard'],
    enabled: !!activeSeason,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/tournaments/join', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({ title: 'Joined Tournament', description: 'You are now part of this tournament season!' });
      refetchRating();
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments/leaderboard'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to Join', description: err.message, variant: 'destructive' });
    }
  });

  const connectWebSocket = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/ws/token', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get connection token');
      }
      
      const { token } = await response.json();
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/multiplayer?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Tournament WebSocket connected');
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({ title: 'Connection Error', description: 'Failed to connect to game server', variant: 'destructive' });
      };

      ws.onclose = () => {
        console.log('Tournament WebSocket closed');
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        if (queueState === 'queued') {
          setQueueState('idle');
        }
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({ title: 'Connection Failed', description: 'Could not connect to game server', variant: 'destructive' });
    }
  }, [user, toast, queueState]);

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'tournament_queued':
        setQueueState('queued');
        setQueuePosition(message.position);
        setQueueTime(0);
        queueTimerRef.current = setInterval(() => {
          setQueueTime(t => t + 1);
        }, 1000);
        break;

      case 'game_start':
        if (queueTimerRef.current) {
          clearInterval(queueTimerRef.current);
        }
        setRoomId(message.roomId);
        setOpponent(message.opponent);
        setPlayerNumber(message.playerNumber);
        setGameState(message.gameState);
        setCanFlip(message.playerNumber === message.gameState.currentPlayer);
        setQueueState('playing');
        toast({
          title: "Tournament Match Started!",
          description: `Playing against ${message.opponent.username} (${message.opponent.rating} rating)`
        });
        break;

      case 'card_flipped':
        setGameState(prev => {
          if (!prev) return prev;
          const newCards = [...prev.cards];
          newCards[message.cardIndex] = {
            ...newCards[message.cardIndex],
            isFlipped: true,
            symbolKey: message.symbolKey
          };
          return { ...prev, cards: newCards };
        });
        break;

      case 'match_result':
        setTimeout(() => {
          setGameState(prev => {
            if (!prev) return prev;
            const newCards = prev.cards.map((card, idx) => {
              if (message.cards.includes(idx)) {
                return {
                  ...card,
                  isFlipped: message.matched,
                  isMatched: message.matched
                };
              }
              return card;
            });
            return {
              ...prev,
              cards: newCards,
              currentPlayer: message.currentPlayer,
              player1Score: message.scores.player1,
              player2Score: message.scores.player2,
              flippedCards: []
            };
          });
          setCanFlip(message.currentPlayer === playerNumber);
        }, 800);
        break;

      case 'game_over':
        setWinner(message.winner);
        setRatingChange(message.ratingChange);
        setQueueState('finished');
        break;

      case 'opponent_left':
        toast({
          title: "Opponent Left",
          description: "Your opponent has disconnected from the game.",
          variant: "destructive"
        });
        handleGameEnd();
        break;

      case 'error':
        toast({ title: 'Error', description: message.message, variant: 'destructive' });
        setQueueState('idle');
        break;
    }
  }, [toast, playerNumber]);

  const joinQueue = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket().then(() => {
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            setQueueState('joining');
            wsRef.current.send(JSON.stringify({ type: 'join_tournament_queue' }));
          }
        }, 500);
      });
    } else {
      setQueueState('joining');
      wsRef.current.send(JSON.stringify({ type: 'join_tournament_queue' }));
    }
  }, [connectWebSocket]);

  const leaveQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave_tournament_queue' }));
    }
    if (queueTimerRef.current) {
      clearInterval(queueTimerRef.current);
    }
    setQueueState('idle');
    setQueuePosition(0);
    setQueueTime(0);
  }, []);

  const handleGameEnd = useCallback(() => {
    setQueueState('idle');
    setGameState(null);
    setOpponent(null);
    setWinner(null);
    setRatingChange(0);
    refetchRating();
    queryClient.invalidateQueries({ queryKey: ['/api/tournaments/leaderboard'] });
  }, [refetchRating]);

  const flipCard = (cardIndex: number) => {
    if (!canFlip || !gameState) return;
    const card = gameState.cards[cardIndex];
    if (card.isFlipped || card.isMatched) return;
    
    const currentFlipped = gameState.cards.filter(c => c.isFlipped && !c.isMatched).length;
    if (currentFlipped >= 2) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'flip_card', cardIndex }));
    }
    setCanFlip(currentFlipped < 1);
  };

  const leaveGame = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave_game' }));
    }
    handleGameEnd();
  };

  const getGridCols = (count: number) => {
    if (count <= 16) return 'grid-cols-4';
    if (count <= 32) return 'grid-cols-6';
    if (count <= 48) return 'grid-cols-8';
    if (count <= 64) return 'grid-cols-8';
    if (count <= 96) return 'grid-cols-10';
    return 'grid-cols-12';
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (queueTimerRef.current) {
        clearInterval(queueTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">{rank}</span>;
    }
  };

  if ((queueState === 'playing' || queueState === 'finished') && gameState && opponent) {
    return (
      <div className="app-shell min-h-[100dvh] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              <Trophy className="w-4 h-4 mr-1" />
              Tournament Match
            </Badge>
            {queueState !== 'finished' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={leaveGame}
                className="text-red-400 hover:text-red-300"
                data-testid="button-leave-game"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Leave
              </Button>
            )}
          </div>

          <div className="flex justify-center gap-8 mb-6">
            <div className={`text-center p-4 rounded-lg ${playerNumber === 1 && canFlip ? 'bg-green-500/20 ring-2 ring-green-500' : 'bg-gray-800'}`}>
              <div className="text-sm text-gray-400">You</div>
              <div className="text-2xl font-bold text-white">{playerNumber === 1 ? gameState.player1Score : gameState.player2Score}</div>
            </div>
            <div className="flex items-center text-gray-500">vs</div>
            <div className={`text-center p-4 rounded-lg ${playerNumber === 2 && canFlip ? 'bg-gray-800' : (gameState.currentPlayer !== playerNumber && queueState === 'playing') ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-gray-800'}`}>
              <div className="text-sm text-gray-400">{opponent.username}</div>
              <div className="text-2xl font-bold text-white">{playerNumber === 1 ? gameState.player2Score : gameState.player1Score}</div>
            </div>
          </div>

          {queueState === 'finished' ? (
            <Card className="mb-6 bg-gray-800 border-gray-700">
              <CardContent className="py-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {winner === 'draw' ? (
                    <span className="text-yellow-400">Draw!</span>
                  ) : winner === playerNumber ? (
                    <span className="text-green-400">You Won!</span>
                  ) : (
                    <span className="text-red-400">You Lost</span>
                  )}
                </h2>
                <p className={`text-xl ${ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Rating: {ratingChange >= 0 ? '+' : ''}{ratingChange}
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <Button onClick={handleGameEnd} data-testid="button-back-to-tournament">
                    Back to Tournament
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center mb-4">
              <p className={`text-lg ${canFlip ? 'text-green-400' : 'text-gray-400'}`}>
                {canFlip ? 'Your turn - pick a card!' : `Waiting for ${opponent.username}...`}
              </p>
            </div>
          )}

          <div className={`grid ${getGridCols(gameState.cardCount)} gap-2`}>
            {gameState.cards.map((card, index) => (
              <button
                key={index}
                onClick={() => flipCard(index)}
                disabled={!canFlip || card.isFlipped || card.isMatched || queueState === 'finished'}
                className={`aspect-square rounded-lg transition-all transform ${
                  card.isMatched 
                    ? 'bg-green-600/50 scale-95' 
                    : card.isFlipped 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                } ${canFlip && !card.isFlipped && !card.isMatched ? 'cursor-pointer hover:scale-105' : ''}`}
                data-testid={`card-${index}`}
              >
                {(card.isFlipped || card.isMatched) && card.symbolKey && (
                  <i className={`${card.symbolKey} text-2xl md:text-3xl text-white`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loadingSeason) {
    return (
      <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const typedUser = user as UserType | null;
  const isPlatinum = typedUser?.membershipTier === 'platinum';

  if (!isPlatinum && user) {
    return (
      <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-chess-secondary flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Tournament
            </h1>
            <p className="text-gray-300 font-roboto">Compete for seasonal glory!</p>
          </header>

          <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/50 mb-6">
            <CardContent className="py-12 text-center">
              <div className="mb-6">
                <div className="relative inline-block">
                  <Crown className="w-20 h-20 text-purple-400" />
                  <Lock className="w-8 h-8 absolute -bottom-1 -right-1 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Platinum Exclusive</h2>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Tournament mode is exclusively available to Platinum members. 
                Compete in ranked seasons, climb the leaderboard, and prove your mastery!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="p-4 bg-purple-800/20 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm text-gray-300">Seasonal Competitions</div>
                </div>
                <div className="p-4 bg-purple-800/20 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <div className="text-sm text-gray-300">Ranked Matchmaking</div>
                </div>
                <div className="p-4 bg-purple-800/20 rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <div className="text-sm text-gray-300">Exclusive Rewards</div>
                </div>
              </div>
              <Link href="/store">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-lg px-8 py-6">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upgrade to Platinum - $4.99/month
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!activeSeason) {
    return (
      <div className="min-h-screen bg-chess-bg font-nunito text-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-chess-secondary flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Tournament
            </h1>
          </header>

          <Card className="bg-chess-secondary/20 border-chess-secondary/30">
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h2 className="text-2xl font-bold text-gray-300 mb-2">No Active Tournament</h2>
              <p className="text-gray-400">Check back later for the next tournament season!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isJoined = !!myRating;
  const daysRemaining = Math.ceil((new Date(activeSeason.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-chess-secondary flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Tournament
          </h1>
          <p className="text-gray-300 font-roboto">Compete for seasonal glory!</p>
        </header>

        <Card className="bg-gradient-to-br from-chess-primary/20 to-chess-secondary/10 border-chess-primary/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                {activeSeason.name}
              </span>
              <Badge variant="outline" className="border-green-500 text-green-400">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="text-sm text-gray-400">Ends</div>
                <div className="font-bold text-white">{formatDate(String(activeSeason.endsAt))}</div>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="text-sm text-gray-400">Days Left</div>
                <div className="font-bold text-chess-primary">{daysRemaining}</div>
              </div>
              <div className="text-center">
                <Zap className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="text-sm text-gray-400">Board Size</div>
                <div className="font-bold text-white">{activeSeason.boardSize} cards</div>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="text-sm text-gray-400">Theme</div>
                <div className="font-bold text-white capitalize">{activeSeason.theme}</div>
              </div>
            </div>

            {!user ? (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-2">Log in to join this tournament</p>
              </div>
            ) : !isJoined ? (
              <div className="text-center">
                <p className="text-gray-400 mb-4">Join this tournament to compete for the top spot!</p>
                <Button 
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                  className="bg-chess-primary hover:bg-chess-primary/80"
                  data-testid="button-join-tournament"
                >
                  {joinMutation.isPending ? 'Joining...' : 'Join Tournament'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-chess-bg/50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-400">Your Rating</div>
                    <div className="text-2xl font-bold text-chess-primary">{myRating.rating}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Games Played</div>
                    <div className="text-xl font-bold text-white">{myRating.gamesPlayed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Wins</div>
                    <div className="text-xl font-bold text-green-500">{myRating.gamesWon}</div>
                  </div>
                  {myRating.rank && (
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Rank</div>
                      <div className="text-xl font-bold text-yellow-500">#{myRating.rank}</div>
                    </div>
                  )}
                </div>

                {queueState === 'idle' && (
                  <Button 
                    onClick={joinQueue}
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                    data-testid="button-find-match"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Find Tournament Match
                  </Button>
                )}

                {(queueState === 'joining' || queueState === 'queued') && (
                  <div className="bg-chess-bg/50 p-6 rounded-lg text-center">
                    <div className="animate-pulse mb-4">
                      <Users className="w-12 h-12 mx-auto text-chess-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {queueState === 'joining' ? 'Connecting...' : 'Finding Opponent...'}
                    </h3>
                    {queueState === 'queued' && (
                      <>
                        <p className="text-gray-400 mb-2">Time in queue: {formatTime(queueTime)}</p>
                        <p className="text-sm text-gray-500">Position: {queuePosition}</p>
                      </>
                    )}
                    <Button 
                      onClick={leaveQueue}
                      variant="outline"
                      className="mt-4 border-red-500 text-red-500 hover:bg-red-500/10"
                      data-testid="button-leave-queue"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-chess-secondary/20 border-chess-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Season Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLeaderboard ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-sm text-gray-400 font-medium px-3 pb-2 border-b border-chess-secondary/30">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Player</div>
                  <div className="col-span-2 text-center">Rating</div>
                  <div className="col-span-2 text-center">Games</div>
                  <div className="col-span-2 text-center">Win%</div>
                </div>
                {leaderboard.map((player) => {
                  const isCurrentUser = typedUser && typedUser.username === player.username;
                  return (
                    <div
                      key={player.username}
                      className={`grid grid-cols-12 items-center p-3 rounded-lg transition-all ${
                        player.rank === 1 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                        player.rank === 2 ? 'bg-gray-400/10 border border-gray-400/30' :
                        player.rank === 3 ? 'bg-orange-500/10 border border-orange-500/30' :
                        'bg-chess-bg/30'
                      } ${isCurrentUser ? 'ring-2 ring-chess-primary' : ''}`}
                      data-testid={`tournament-leaderboard-row-${player.rank}`}
                    >
                      <div className="col-span-1 flex items-center justify-center">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-chess-primary/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-chess-primary" />
                        </div>
                        <span className={`font-medium ${isCurrentUser ? 'text-chess-primary' : 'text-white'}`}>
                          {player.username}
                          {isCurrentUser && <span className="text-xs text-chess-primary ml-1">(You)</span>}
                        </span>
                      </div>
                      <div className="col-span-2 text-center font-bold text-chess-primary">
                        {player.rating}
                      </div>
                      <div className="col-span-2 text-center text-gray-300">
                        {player.gamesPlayed}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`font-medium ${
                          parseFloat(player.winRate) >= 60 ? 'text-green-500' :
                          parseFloat(player.winRate) >= 40 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {player.winRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No participants yet. Be the first to join!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
