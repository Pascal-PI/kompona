import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Users, Wifi, WifiOff, Copy, ArrowLeft, Trophy, Target } from "lucide-react";

type GameMode = 8 | 16 | 32 | 48 | 64 | 96 | 128;

const multiplayerSymbols: Record<string, string> = {
  "fa-cross": "✝️",
  "fa-bible": "📖",
  "fa-dove": "🕊️",
  "fa-church": "⛪",
  "fa-praying-hands": "🙏",
  "fa-hands-praying": "🤲",
  "fa-heart": "❤️",
  "fa-star": "⭐",
  "fa-crown": "👑",
  "fa-book": "📚",
  "fa-candle-holder": "🕯️",
  "fa-scroll": "📜",
  "fa-feather": "🪶",
  "fa-fish": "🐟",
  "fa-bread-slice": "🍞",
  "fa-wine-glass": "🍷",
  "fa-key": "🗝️",
  "fa-bell": "🔔",
  "fa-anchor": "⚓",
  "fa-shield": "🛡️",
  "fa-sword": "⚔️",
  "fa-staff": "🦯",
  "fa-sun": "☀️",
  "fa-moon": "🌙",
  "fa-mountain": "⛰️",
  "fa-tree": "🌳",
  "fa-flower": "🌼",
  "fa-lamb": "🐑",
  "fa-angel": "👼",
  "fa-halo": "😇",
  "fa-rosary": "📿",
  "fa-chalice": "🏆",
  "fa-monstrance": "🔆",
  "fa-mitre": "🔺",
  "fa-crosier": "🪄",
  "fa-thurible": "🏮",
  "fa-holy-water": "💧",
  "fa-palm": "🌴",
  "fa-olive-branch": "🫒",
  "fa-lily": "🪷",
  "fa-rose": "🌹",
  "fa-wheat": "🌾",
  "fa-grapes": "🍇",
  "fa-fire": "🔥",
  "fa-cloud": "☁️",
  "fa-rainbow": "🌈",
  "fa-shell": "🐚",
  "fa-rock": "🪨",
  "fa-gate": "🚪",
  "fa-ladder": "🪜",
  "fa-trumpet": "🎺",
  "fa-harp": "🎵",
  "fa-lantern": "🏮",
  "fa-ring": "💍",
  "fa-orb": "🔮",
  "fa-scepter": "🔱",
  "fa-banner": "🚩",
  "fa-torch": "🔦",
  "fa-oil-lamp": "🪔",
  "fa-sandals": "🩴",
  "fa-robe": "🥋",
  "fa-cloak": "🧥",
  "fa-chain": "⛓️",
  "fa-rope": "🪢",
};

const getMultiplayerSymbol = (symbolKey: string) =>
  multiplayerSymbols[symbolKey] ?? symbolKey.replace(/^fa-/, "").slice(0, 2).toUpperCase();

const getMultiplayerSymbolName = (symbolKey: string) =>
  symbolKey.replace(/^fa-/, "").replaceAll("-", " ");

interface Card {
  id: number;
  symbolKey: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameState {
  cards: Card[];
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

type ScreenState = 'lobby' | 'waiting' | 'playing' | 'finished';

export default function Multiplayer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  
  const [screenState, setScreenState] = useState<ScreenState>('lobby');
  const [isConnected, setIsConnected] = useState(false);
  const [cardCount, setCardCount] = useState<GameMode>(16);
  const [inviteCode, setInviteCode] = useState('');
  const [createdInviteCode, setCreatedInviteCode] = useState('');
  const [queuePosition, setQueuePosition] = useState(0);
  
  const [roomId, setRoomId] = useState('');
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [canFlip, setCanFlip] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | 'draw' | null>(null);
  const [ratingChange, setRatingChange] = useState(0);

  const { data: user } = useQuery<{ id: string; username: string; rating: number }>({
    queryKey: ['/api/auth/user']
  });

  const connectWebSocket = useCallback(async () => {
    if (!user?.id) return;

    try {
      const tokenResponse = await fetch('/api/ws/token');
      if (!tokenResponse.ok) {
        console.error('Failed to get WebSocket token');
        return;
      }
      const { token } = await tokenResponse.json();

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/multiplayer?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      };

      return ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [user?.id]);

  const handleServerMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'pong':
        break;
      case 'queued':
        setQueuePosition(message.position);
        setScreenState('waiting');
        break;
      case 'room_created':
        setRoomId(message.roomId);
        setCreatedInviteCode(message.inviteCode);
        setScreenState('waiting');
        break;
      case 'game_start':
        setRoomId(message.roomId);
        setOpponent(message.opponent);
        setPlayerNumber(message.playerNumber);
        setGameState(message.gameState);
        setCanFlip(message.playerNumber === message.gameState.currentPlayer);
        setScreenState('playing');
        toast({
          title: "Game Started!",
          description: `You're playing against ${message.opponent.username} (${message.opponent.rating} rating)`
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
        setScreenState('finished');
        break;
      case 'opponent_left':
        toast({
          title: "Opponent Left",
          description: "Your opponent has disconnected from the game.",
          variant: "destructive"
        });
        setScreenState('lobby');
        break;
      case 'rematch_request':
        toast({
          title: "Rematch Request",
          description: "Your opponent wants a rematch!"
        });
        break;
      case 'error':
        toast({
          title: "Error",
          description: message.message,
          variant: "destructive"
        });
        break;
    }
  }, [playerNumber, toast]);

  useEffect(() => {
    if (user?.id && !wsRef.current) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user?.id, connectWebSocket]);

  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, []);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const joinQueue = () => {
    sendMessage({ type: 'join_queue', cardCount, theme: 'saints' });
  };

  const leaveQueue = () => {
    sendMessage({ type: 'leave_queue' });
    setScreenState('lobby');
    setCreatedInviteCode('');
  };

  const createRoom = () => {
    sendMessage({ type: 'create_room', cardCount, theme: 'saints' });
  };

  const joinRoom = () => {
    if (inviteCode.trim()) {
      sendMessage({ type: 'join_room', inviteCode: inviteCode.trim().toUpperCase() });
    }
  };

  const flipCard = (cardIndex: number) => {
    if (!canFlip || !gameState) return;
    const card = gameState.cards[cardIndex];
    if (card.isFlipped || card.isMatched) return;
    
    const currentFlipped = gameState.cards.filter(c => c.isFlipped && !c.isMatched).length;
    if (currentFlipped >= 2) return;

    sendMessage({ type: 'flip_card', cardIndex });
    setCanFlip(currentFlipped < 1);
  };

  const leaveGame = () => {
    sendMessage({ type: 'leave_game' });
    setScreenState('lobby');
    setGameState(null);
    setOpponent(null);
    setWinner(null);
    setCreatedInviteCode('');
  };

  const requestRematch = () => {
    sendMessage({ type: 'rematch' });
    toast({
      title: "Rematch Requested",
      description: "Waiting for opponent to accept..."
    });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(createdInviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard"
    });
  };

  const getGridCols = (count: number) => {
    if (count <= 16) return 'grid-cols-4';
    if (count <= 32) return 'grid-cols-6';
    if (count <= 48) return 'grid-cols-8';
    if (count <= 64) return 'grid-cols-8';
    if (count <= 96) return 'grid-cols-10';
    return 'grid-cols-12';
  };

  if (!user) {
    return (
      <div className="app-shell min-h-[100dvh] flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">Please log in to play online multiplayer</p>
            <Button onClick={() => setLocation('/login')} data-testid="button-login">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-[100dvh] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="text-green-500 border-green-500">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-500 border-red-500">
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>

        {screenState === 'lobby' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center text-white mb-8">
              <Users className="w-8 h-8 inline-block mr-2" />
              Online Multiplayer
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Quick Match
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Card Count</label>
                    <Select value={String(cardCount)} onValueChange={(v) => setCardCount(Number(v) as GameMode)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600" data-testid="select-card-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 Cards (4 pairs)</SelectItem>
                        <SelectItem value="16">16 Cards (8 pairs)</SelectItem>
                        <SelectItem value="32">32 Cards (16 pairs)</SelectItem>
                        <SelectItem value="48">48 Cards (24 pairs)</SelectItem>
                        <SelectItem value="64">64 Cards (32 pairs)</SelectItem>
                        <SelectItem value="96">96 Cards (48 pairs)</SelectItem>
                        <SelectItem value="128">128 Cards (64 pairs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={joinQueue} 
                    disabled={!isConnected}
                    className="w-full"
                    data-testid="button-quick-match"
                  >
                    Find Match
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    You'll be matched with a player of similar rating
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Play with Friend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Join Room</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        className="bg-gray-700 border-gray-600"
                        maxLength={6}
                        data-testid="input-invite-code"
                      />
                      <Button onClick={joinRoom} disabled={!isConnected || !inviteCode.trim()} data-testid="button-join-room">
                        Join
                      </Button>
                    </div>
                  </div>
                  <div className="text-center text-gray-500">- or -</div>
                  <Button 
                    onClick={createRoom} 
                    variant="secondary" 
                    disabled={!isConnected}
                    className="w-full"
                    data-testid="button-create-room"
                  >
                    Create Private Room
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{user.rating || 1200}</p>
                    <p className="text-sm text-gray-400">Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{user.username}</p>
                    <p className="text-sm text-gray-400">Username</p>
                  </div>
                  <div>
                    <Badge className="text-lg">Online</Badge>
                    <p className="text-sm text-gray-400 mt-1">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {screenState === 'waiting' && (
          <div className="text-center space-y-6">
            <div className="animate-pulse">
              <Users className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">
                {createdInviteCode ? 'Waiting for Friend...' : 'Finding Match...'}
              </h2>
            </div>

            {createdInviteCode && (
              <Card className="bg-gray-800 border-gray-700 max-w-sm mx-auto">
                <CardContent className="pt-6">
                  <p className="text-gray-400 mb-2">Share this code with your friend:</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-mono font-bold text-white tracking-wider">
                      {createdInviteCode}
                    </span>
                    <Button variant="ghost" size="icon" onClick={copyInviteCode} data-testid="button-copy-code">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!createdInviteCode && queuePosition > 0 && (
              <p className="text-gray-400">Players in queue: {queuePosition}</p>
            )}

            <Button variant="destructive" onClick={leaveQueue} data-testid="button-cancel">
              Cancel
            </Button>
          </div>
        )}

        {screenState === 'playing' && gameState && opponent && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800 rounded-lg p-4">
              <div className={`flex-1 text-center ${gameState.currentPlayer === 1 ? 'ring-2 ring-blue-500 rounded-lg p-2' : ''}`}>
                <p className="text-lg font-bold text-white">
                  {playerNumber === 1 ? 'You' : opponent.username}
                </p>
                <p className="text-3xl font-bold text-blue-500">{gameState.player1Score}</p>
              </div>
              <div className="px-4">
                <p className="text-gray-400">VS</p>
              </div>
              <div className={`flex-1 text-center ${gameState.currentPlayer === 2 ? 'ring-2 ring-red-500 rounded-lg p-2' : ''}`}>
                <p className="text-lg font-bold text-white">
                  {playerNumber === 2 ? 'You' : opponent.username}
                </p>
                <p className="text-3xl font-bold text-red-500">{gameState.player2Score}</p>
              </div>
            </div>

            <div className="text-center">
              <Badge variant={canFlip ? 'default' : 'secondary'} className="text-lg py-2 px-4">
                {canFlip ? "Your Turn!" : "Opponent's Turn"}
              </Badge>
            </div>

            <div className={`grid ${getGridCols(gameState.cardCount)} gap-2`}>
              {gameState.cards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => flipCard(idx)}
                  disabled={!canFlip || card.isFlipped || card.isMatched}
                  aria-label={
                    card.isFlipped || card.isMatched
                      ? `${getMultiplayerSymbolName(card.symbolKey)} card`
                      : `Hidden card ${idx + 1}`
                  }
                  className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-[14px] border-2 transition-all duration-300
                    ${card.isMatched 
                      ? 'border-[#e5b84c] bg-[#397c70] shadow-[0_5px_0_#24594f]'
                      : card.isFlipped 
                        ? 'border-[#e5b84c] bg-[#fffaf1] shadow-[0_5px_0_#cbbd9f]'
                        : 'border-[#e5b84c]/70 bg-[#192434] shadow-[0_5px_0_#101822] hover:-translate-y-1 hover:shadow-[0_9px_0_#101822]'}
                    ${canFlip && !card.isFlipped && !card.isMatched ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  data-testid={`card-${idx}`}
                >
                  {card.isFlipped || card.isMatched ? (
                    card.symbolKey ? (
                      <span
                        className="select-none text-[clamp(1.15rem,3vw,2.25rem)] leading-none"
                        role="img"
                        aria-label={getMultiplayerSymbolName(card.symbolKey)}
                      >
                        {getMultiplayerSymbol(card.symbolKey)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#26343d]">?</span>
                    )
                  ) : (
                    <span className="flex h-[44%] w-[44%] rotate-45 items-center justify-center rounded-md border-2 border-[#e5b84c]/80" aria-hidden="true">
                      <span className="-rotate-45 font-serif text-[clamp(.65rem,1.5vw,1rem)] font-bold text-[#fff8ec]">K</span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center">
              <Button variant="destructive" onClick={leaveGame} data-testid="button-leave-game">
                Leave Game
              </Button>
            </div>
          </div>
        )}

        {screenState === 'finished' && opponent && gameState && (
          <div className="text-center space-y-6">
            <Trophy className={`w-20 h-20 mx-auto ${
              winner === playerNumber ? 'text-yellow-500' : 
              winner === 'draw' ? 'text-gray-400' : 'text-red-500'
            }`} />
            
            <h2 className="text-3xl font-bold text-white">
              {winner === playerNumber ? 'Victory!' : 
               winner === 'draw' ? "It's a Draw!" : 'Defeat'}
            </h2>

            <Card className="bg-gray-800 border-gray-700 max-w-sm mx-auto">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">You</span>
                  <span className="text-2xl font-bold text-white">
                    {playerNumber === 1 ? gameState.player1Score : gameState.player2Score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{opponent.username}</span>
                  <span className="text-2xl font-bold text-white">
                    {playerNumber === 1 ? gameState.player2Score : gameState.player1Score}
                  </span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating Change</span>
                  <span className={`text-lg font-bold ${ratingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {ratingChange >= 0 ? '+' : ''}{ratingChange}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={requestRematch} data-testid="button-rematch">
                Request Rematch
              </Button>
              <Button variant="secondary" onClick={leaveGame} data-testid="button-back-to-lobby">
                Back to Lobby
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
