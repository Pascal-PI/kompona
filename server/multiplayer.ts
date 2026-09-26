import { WebSocket, WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';
import { storage } from './storage';

interface Player {
  id: string;
  username: string;
  ws: WebSocket;
  rating: number;
}

interface GameRoom {
  id: string;
  player1: Player;
  player2: Player | null;
  gameState: MultiplayerGameState | null;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  inviteCode?: string;
  isTournament?: boolean;
  tournamentSeasonId?: string;
}

interface Card {
  id: number;
  symbolKey: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MultiplayerGameState {
  cards: Card[];
  currentPlayer: 1 | 2;
  player1Score: number;
  player2Score: number;
  flippedCards: number[];
  cardCount: number;
  theme: string;
}

type ClientMessage = 
  | { type: 'join_queue'; cardCount: number; theme: string }
  | { type: 'leave_queue' }
  | { type: 'create_room'; cardCount: number; theme: string }
  | { type: 'join_room'; inviteCode: string }
  | { type: 'flip_card'; cardIndex: number }
  | { type: 'leave_game' }
  | { type: 'rematch' }
  | { type: 'ping' }
  | { type: 'join_tournament_queue' }
  | { type: 'leave_tournament_queue' };

type ServerMessage = 
  | { type: 'queued'; position: number }
  | { type: 'tournament_queued'; position: number; seasonName: string }
  | { type: 'room_created'; roomId: string; inviteCode: string }
  | { type: 'game_start'; roomId: string; opponent: { username: string; rating: number }; playerNumber: 1 | 2; gameState: MultiplayerGameState; isTournament?: boolean }
  | { type: 'card_flipped'; cardIndex: number; symbolKey: string }
  | { type: 'match_result'; matched: boolean; cards: number[]; currentPlayer: 1 | 2; scores: { player1: number; player2: number } }
  | { type: 'game_over'; winner: 1 | 2 | 'draw'; scores: { player1: number; player2: number }; ratingChange: number; isTournament?: boolean }
  | { type: 'opponent_left' }
  | { type: 'rematch_request' }
  | { type: 'error'; message: string }
  | { type: 'pong' };

const SAINT_SYMBOLS = [
  "fa-cross", "fa-bible", "fa-dove", "fa-church", "fa-praying-hands", "fa-hands-praying",
  "fa-heart", "fa-star", "fa-crown", "fa-book", "fa-candle-holder", "fa-scroll",
  "fa-feather", "fa-fish", "fa-bread-slice", "fa-wine-glass", "fa-key", "fa-bell",
  "fa-anchor", "fa-shield", "fa-sword", "fa-staff", "fa-sun", "fa-moon",
  "fa-mountain", "fa-tree", "fa-flower", "fa-lamb", "fa-angel", "fa-halo",
  "fa-rosary", "fa-chalice", "fa-monstrance", "fa-mitre", "fa-crosier", "fa-thurible",
  "fa-holy-water", "fa-palm", "fa-olive-branch", "fa-lily", "fa-rose", "fa-wheat",
  "fa-grapes", "fa-fire", "fa-cloud", "fa-rainbow", "fa-shell", "fa-rock",
  "fa-gate", "fa-ladder", "fa-trumpet", "fa-harp", "fa-lantern", "fa-ring",
  "fa-orb", "fa-scepter", "fa-banner", "fa-torch", "fa-oil-lamp", "fa-sandals",
  "fa-robe", "fa-cloak", "fa-chain", "fa-rope"
];

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createGameState(cardCount: number, theme: string): MultiplayerGameState {
  const pairCount = cardCount / 2;
  const selectedSymbols = shuffleArray(SAINT_SYMBOLS).slice(0, pairCount);
  
  const cards: Card[] = [];
  selectedSymbols.forEach((symbol, idx) => {
    cards.push({ id: idx * 2, symbolKey: symbol, isFlipped: false, isMatched: false });
    cards.push({ id: idx * 2 + 1, symbolKey: symbol, isFlipped: false, isMatched: false });
  });
  
  return {
    cards: shuffleArray(cards),
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    flippedCards: [],
    cardCount,
    theme
  };
}

function calculateRatingChange(winnerRating: number, loserRating: number, isDraw: boolean): number {
  const K = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  
  if (isDraw) {
    return Math.round(K * (0.5 - expectedScore));
  }
  return Math.round(K * (1 - expectedScore));
}

interface TournamentQueueEntry {
  player: Player;
  tournamentRating: number;
  seasonId: string;
  seasonName: string;
  boardSize: number;
  theme: string;
  queuedAt: Date;
}

export class MultiplayerServer {
  private wss: WebSocketServer;
  private players: Map<WebSocket, Player> = new Map();
  private rooms: Map<string, GameRoom> = new Map();
  private matchmakingQueue: Map<string, { player: Player; cardCount: number; theme: string; queuedAt: Date }> = new Map();
  private tournamentQueue: Map<string, TournamentQueueEntry> = new Map();
  private inviteCodes: Map<string, string> = new Map();
  private flipTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/ws/multiplayer' });
    this.setupWebSocketServer();
    this.startMatchmakingLoop();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        this.sendMessage(ws, { type: 'error', message: 'Authentication required' });
        ws.close();
        return;
      }

      const wsTokens = (global as any).wsTokens as Map<string, { userId: string; expiresAt: number }> | undefined;
      const tokenData = wsTokens?.get(token);
      
      if (!tokenData) {
        this.sendMessage(ws, { type: 'error', message: 'Invalid or expired token' });
        ws.close();
        return;
      }

      if (Date.now() > tokenData.expiresAt) {
        wsTokens?.delete(token);
        this.sendMessage(ws, { type: 'error', message: 'Token expired' });
        ws.close();
        return;
      }

      wsTokens?.delete(token);
      const userId = tokenData.userId;

      try {
        const user = await storage.getUser(userId);
        if (!user) {
          this.sendMessage(ws, { type: 'error', message: 'User not found' });
          ws.close();
          return;
        }

        const player: Player = {
          id: user.id,
          username: user.username,
          ws,
          rating: user.rating || 1000
        };

        this.players.set(ws, player);
        console.log(`Player connected: ${player.username} (Rating: ${player.rating})`);

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString()) as ClientMessage;
            this.handleMessage(player, message);
          } catch (e) {
            console.error('Invalid message:', e);
          }
        });

        ws.on('close', () => {
          this.handleDisconnect(player);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.handleDisconnect(player);
        });

      } catch (error) {
        console.error('Connection error:', error);
        ws.close();
      }
    });
  }

  private handleMessage(player: Player, message: ClientMessage) {
    switch (message.type) {
      case 'ping':
        this.sendMessage(player.ws, { type: 'pong' });
        break;
      case 'join_queue':
        this.joinQueue(player, message.cardCount, message.theme);
        break;
      case 'leave_queue':
        this.leaveQueue(player);
        break;
      case 'join_tournament_queue':
        this.joinTournamentQueue(player);
        break;
      case 'leave_tournament_queue':
        this.leaveTournamentQueue(player);
        break;
      case 'create_room':
        this.createPrivateRoom(player, message.cardCount, message.theme);
        break;
      case 'join_room':
        this.joinPrivateRoom(player, message.inviteCode);
        break;
      case 'flip_card':
        this.flipCard(player, message.cardIndex);
        break;
      case 'leave_game':
        this.leaveGame(player);
        break;
      case 'rematch':
        this.requestRematch(player);
        break;
    }
  }

  private handleDisconnect(player: Player) {
    console.log(`Player disconnected: ${player.username}`);
    this.leaveQueue(player);
    this.leaveTournamentQueue(player);
    this.leaveGame(player);
    this.players.delete(player.ws);
  }

  private sendMessage(ws: WebSocket, message: ServerMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private joinQueue(player: Player, cardCount: number, theme: string) {
    if (this.matchmakingQueue.has(player.id)) {
      return;
    }

    this.matchmakingQueue.set(player.id, {
      player,
      cardCount,
      theme,
      queuedAt: new Date()
    });

    const position = this.matchmakingQueue.size;
    this.sendMessage(player.ws, { type: 'queued', position });
    console.log(`${player.username} joined queue (${position} players waiting)`);
  }

  private leaveQueue(player: Player) {
    this.matchmakingQueue.delete(player.id);
  }

  private async joinTournamentQueue(player: Player) {
    if (this.tournamentQueue.has(player.id)) {
      return;
    }

    try {
      const season = await storage.getActiveTournamentSeason();
      if (!season) {
        this.sendMessage(player.ws, { type: 'error', message: 'No active tournament season' });
        return;
      }

      const rating = await storage.getUserTournamentRating(season.id, player.id);
      if (!rating) {
        this.sendMessage(player.ws, { type: 'error', message: 'You must join the tournament first' });
        return;
      }

      this.tournamentQueue.set(player.id, {
        player,
        tournamentRating: rating.rating,
        seasonId: season.id,
        seasonName: season.name,
        boardSize: season.boardSize,
        theme: season.theme,
        queuedAt: new Date()
      });

      const position = this.tournamentQueue.size;
      this.sendMessage(player.ws, { type: 'tournament_queued', position, seasonName: season.name });
      console.log(`${player.username} joined tournament queue (${position} players waiting)`);
    } catch (error) {
      console.error('Tournament queue error:', error);
      this.sendMessage(player.ws, { type: 'error', message: 'Failed to join tournament queue' });
    }
  }

  private leaveTournamentQueue(player: Player) {
    this.tournamentQueue.delete(player.id);
  }

  private startMatchmakingLoop() {
    setInterval(() => {
      this.processMatchmaking();
      this.processTournamentMatchmaking();
    }, 1000);
  }

  private processMatchmaking() {
    const queueEntries = Array.from(this.matchmakingQueue.entries());
    
    const matched = new Set<string>();
    
    for (let i = 0; i < queueEntries.length; i++) {
      if (matched.has(queueEntries[i][0])) continue;
      
      const [id1, entry1] = queueEntries[i];
      
      for (let j = i + 1; j < queueEntries.length; j++) {
        if (matched.has(queueEntries[j][0])) continue;
        
        const [id2, entry2] = queueEntries[j];
        
        if (entry1.cardCount === entry2.cardCount) {
          const ratingDiff = Math.abs(entry1.player.rating - entry2.player.rating);
          const waitTime = Math.max(
            Date.now() - entry1.queuedAt.getTime(),
            Date.now() - entry2.queuedAt.getTime()
          );
          
          const maxRatingDiff = 200 + Math.floor(waitTime / 5000) * 100;
          
          if (ratingDiff <= maxRatingDiff) {
            matched.add(id1);
            matched.add(id2);
            this.createMatch(entry1.player, entry2.player, entry1.cardCount, entry1.theme);
            break;
          }
        }
      }
    }

    matched.forEach(id => this.matchmakingQueue.delete(id));
  }

  private processTournamentMatchmaking() {
    const queueEntries = Array.from(this.tournamentQueue.entries());
    
    const matched = new Set<string>();
    
    for (let i = 0; i < queueEntries.length; i++) {
      if (matched.has(queueEntries[i][0])) continue;
      
      const [id1, entry1] = queueEntries[i];
      
      for (let j = i + 1; j < queueEntries.length; j++) {
        if (matched.has(queueEntries[j][0])) continue;
        
        const [id2, entry2] = queueEntries[j];
        
        // Must be same season
        if (entry1.seasonId !== entry2.seasonId) continue;
        
        const ratingDiff = Math.abs(entry1.tournamentRating - entry2.tournamentRating);
        const waitTime = Math.max(
          Date.now() - entry1.queuedAt.getTime(),
          Date.now() - entry2.queuedAt.getTime()
        );
        
        // More relaxed rating for tournaments, expands faster
        const maxRatingDiff = 300 + Math.floor(waitTime / 3000) * 150;
        
        if (ratingDiff <= maxRatingDiff) {
          matched.add(id1);
          matched.add(id2);
          this.createTournamentMatch(entry1, entry2);
          break;
        }
      }
    }

    matched.forEach(id => this.tournamentQueue.delete(id));
  }

  private createTournamentMatch(entry1: TournamentQueueEntry, entry2: TournamentQueueEntry) {
    const roomId = generateRoomId();
    const gameState = createGameState(entry1.boardSize, entry1.theme);
    
    const room: GameRoom = {
      id: roomId,
      player1: entry1.player,
      player2: entry2.player,
      gameState,
      status: 'playing',
      createdAt: new Date(),
      isTournament: true,
      tournamentSeasonId: entry1.seasonId
    };
    
    this.rooms.set(roomId, room);
    
    console.log(`Tournament match created: ${entry1.player.username} (${entry1.tournamentRating}) vs ${entry2.player.username} (${entry2.tournamentRating}) in room ${roomId}`);

    const hiddenGameState = {
      ...gameState,
      cards: gameState.cards.map(c => ({ ...c, symbolKey: '' }))
    };
    
    this.sendMessage(entry1.player.ws, {
      type: 'game_start',
      roomId,
      opponent: { username: entry2.player.username, rating: entry2.tournamentRating },
      playerNumber: 1,
      gameState: hiddenGameState,
      isTournament: true
    });
    
    this.sendMessage(entry2.player.ws, {
      type: 'game_start',
      roomId,
      opponent: { username: entry1.player.username, rating: entry1.tournamentRating },
      playerNumber: 2,
      gameState: hiddenGameState,
      isTournament: true
    });
  }

  private createMatch(player1: Player, player2: Player, cardCount: number, theme: string) {
    const roomId = generateRoomId();
    const gameState = createGameState(cardCount, theme);
    
    const room: GameRoom = {
      id: roomId,
      player1,
      player2,
      gameState,
      status: 'playing',
      createdAt: new Date()
    };
    
    this.rooms.set(roomId, room);
    
    console.log(`Match created: ${player1.username} vs ${player2.username} in room ${roomId}`);

    const hiddenGameState = {
      ...gameState,
      cards: gameState.cards.map(c => ({ ...c, symbolKey: '' }))
    };
    
    this.sendMessage(player1.ws, {
      type: 'game_start',
      roomId,
      opponent: { username: player2.username, rating: player2.rating },
      playerNumber: 1,
      gameState: hiddenGameState
    });
    
    this.sendMessage(player2.ws, {
      type: 'game_start',
      roomId,
      opponent: { username: player1.username, rating: player1.rating },
      playerNumber: 2,
      gameState: hiddenGameState
    });
  }

  private createPrivateRoom(player: Player, cardCount: number, theme: string) {
    const roomId = generateRoomId();
    const inviteCode = generateInviteCode();
    
    const room: GameRoom = {
      id: roomId,
      player1: player,
      player2: null,
      gameState: null,
      status: 'waiting',
      createdAt: new Date(),
      inviteCode
    };
    
    this.rooms.set(roomId, room);
    this.inviteCodes.set(inviteCode, roomId);
    
    (room as any).pendingCardCount = cardCount;
    (room as any).pendingTheme = theme;
    
    this.sendMessage(player.ws, {
      type: 'room_created',
      roomId,
      inviteCode
    });
    
    console.log(`Private room created: ${roomId} by ${player.username} (Invite: ${inviteCode})`);
  }

  private joinPrivateRoom(player: Player, inviteCode: string) {
    const roomId = this.inviteCodes.get(inviteCode.toUpperCase());
    
    if (!roomId) {
      this.sendMessage(player.ws, { type: 'error', message: 'Invalid invite code' });
      return;
    }
    
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'waiting') {
      this.sendMessage(player.ws, { type: 'error', message: 'Room not available' });
      return;
    }
    
    if (room.player1.id === player.id) {
      this.sendMessage(player.ws, { type: 'error', message: 'Cannot join your own room' });
      return;
    }
    
    room.player2 = player;
    room.status = 'playing';
    
    const cardCount = (room as any).pendingCardCount || 16;
    const theme = (room as any).pendingTheme || 'saints';
    room.gameState = createGameState(cardCount, theme);
    
    this.inviteCodes.delete(inviteCode.toUpperCase());
    
    const hiddenGameState = {
      ...room.gameState,
      cards: room.gameState.cards.map(c => ({ ...c, symbolKey: '' }))
    };
    
    this.sendMessage(room.player1.ws, {
      type: 'game_start',
      roomId,
      opponent: { username: player.username, rating: player.rating },
      playerNumber: 1,
      gameState: hiddenGameState
    });
    
    this.sendMessage(player.ws, {
      type: 'game_start',
      roomId,
      opponent: { username: room.player1.username, rating: room.player1.rating },
      playerNumber: 2,
      gameState: hiddenGameState
    });
    
    console.log(`${player.username} joined room ${roomId}`);
  }

  private flipCard(player: Player, cardIndex: number) {
    const room = this.findPlayerRoom(player);
    if (!room || !room.gameState || room.status !== 'playing') {
      return;
    }
    
    const playerNumber = room.player1.id === player.id ? 1 : 2;
    if (room.gameState.currentPlayer !== playerNumber) {
      this.sendMessage(player.ws, { type: 'error', message: 'Not your turn' });
      return;
    }
    
    const card = room.gameState.cards[cardIndex];
    if (!card || card.isFlipped || card.isMatched) {
      return;
    }
    
    if (room.gameState.flippedCards.length >= 2) {
      return;
    }
    
    const existingTimeout = this.flipTimeouts.get(room.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.flipTimeouts.delete(room.id);
    }
    
    card.isFlipped = true;
    room.gameState.flippedCards.push(cardIndex);
    
    this.sendMessage(room.player1.ws, {
      type: 'card_flipped',
      cardIndex,
      symbolKey: card.symbolKey
    });
    
    if (room.player2) {
      this.sendMessage(room.player2.ws, {
        type: 'card_flipped',
        cardIndex,
        symbolKey: card.symbolKey
      });
    }
    
    if (room.gameState.flippedCards.length === 2) {
      const [idx1, idx2] = room.gameState.flippedCards;
      const card1 = room.gameState.cards[idx1];
      const card2 = room.gameState.cards[idx2];
      
      const matched = card1.symbolKey === card2.symbolKey;
      
      const timeout = setTimeout(() => {
        this.processMatchResult(room, matched, idx1, idx2);
      }, 1000);
      
      this.flipTimeouts.set(room.id, timeout);
    }
  }

  private processMatchResult(room: GameRoom, matched: boolean, idx1: number, idx2: number) {
    if (!room.gameState) return;
    
    const card1 = room.gameState.cards[idx1];
    const card2 = room.gameState.cards[idx2];
    
    if (matched) {
      card1.isMatched = true;
      card2.isMatched = true;
      
      if (room.gameState.currentPlayer === 1) {
        room.gameState.player1Score++;
      } else {
        room.gameState.player2Score++;
      }
    } else {
      card1.isFlipped = false;
      card2.isFlipped = false;
      room.gameState.currentPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;
    }
    
    room.gameState.flippedCards = [];
    
    const matchResult = {
      type: 'match_result' as const,
      matched,
      cards: [idx1, idx2],
      currentPlayer: room.gameState.currentPlayer,
      scores: {
        player1: room.gameState.player1Score,
        player2: room.gameState.player2Score
      }
    };
    
    this.sendMessage(room.player1.ws, matchResult);
    if (room.player2) {
      this.sendMessage(room.player2.ws, matchResult);
    }
    
    const allMatched = room.gameState.cards.every(c => c.isMatched);
    if (allMatched) {
      this.endGame(room);
    }
  }

  private async endGame(room: GameRoom) {
    if (!room.gameState || !room.player2) return;
    
    room.status = 'finished';
    
    const { player1Score, player2Score } = room.gameState;
    let winner: 1 | 2 | 'draw';
    let ratingChange1: number = 0;
    let ratingChange2: number = 0;
    
    if (player1Score > player2Score) {
      winner = 1;
    } else if (player2Score > player1Score) {
      winner = 2;
    } else {
      winner = 'draw';
    }
    
    try {
      if (room.isTournament && room.tournamentSeasonId) {
        // Tournament match - record to tournament tables only
        const winnerId = winner === 1 ? room.player1.id : 
                        winner === 2 ? room.player2.id : null;
        
        const match = await storage.recordTournamentMatch({
          seasonId: room.tournamentSeasonId,
          player1Id: room.player1.id,
          player2Id: room.player2.id,
          boardSize: room.gameState.cardCount,
          theme: room.gameState.theme,
          player1Score,
          player2Score,
          winnerId
        });

        // Calculate rating changes from the recorded match
        ratingChange1 = (match.player1RatingAfter || 0) - (match.player1RatingBefore || 0);
        ratingChange2 = (match.player2RatingAfter || 0) - (match.player2RatingBefore || 0);
        
        console.log(`Tournament match ended: ${room.player1.username} (${ratingChange1 >= 0 ? '+' : ''}${ratingChange1}) vs ${room.player2.username} (${ratingChange2 >= 0 ? '+' : ''}${ratingChange2})`);
      } else {
        // Regular online match - update normal stats
        if (winner === 1) {
          ratingChange1 = calculateRatingChange(room.player1.rating, room.player2.rating, false);
          ratingChange2 = -calculateRatingChange(room.player2.rating, room.player1.rating, false);
        } else if (winner === 2) {
          ratingChange2 = calculateRatingChange(room.player2.rating, room.player1.rating, false);
          ratingChange1 = -calculateRatingChange(room.player1.rating, room.player2.rating, false);
        } else {
          ratingChange1 = calculateRatingChange(room.player1.rating, room.player2.rating, true);
          ratingChange2 = calculateRatingChange(room.player2.rating, room.player1.rating, true);
        }

        await storage.updateUserOnlineStats(room.player1.id, {
          eloChange: ratingChange1,
          won: winner === 1,
          lost: winner === 2,
          drawn: winner === 'draw'
        });
        
        await storage.updateUserOnlineStats(room.player2.id, {
          eloChange: ratingChange2,
          won: winner === 2,
          lost: winner === 1,
          drawn: winner === 'draw'
        });
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
    
    this.sendMessage(room.player1.ws, {
      type: 'game_over',
      winner,
      scores: { player1: player1Score, player2: player2Score },
      ratingChange: ratingChange1,
      isTournament: room.isTournament
    });
    
    this.sendMessage(room.player2.ws, {
      type: 'game_over',
      winner,
      scores: { player1: player1Score, player2: player2Score },
      ratingChange: ratingChange2,
      isTournament: room.isTournament
    });
    
    console.log(`Game ended in room ${room.id}: ${winner === 'draw' ? 'Draw' : `Player ${winner} wins`}${room.isTournament ? ' (Tournament)' : ''}`);
  }

  private leaveGame(player: Player) {
    const room = this.findPlayerRoom(player);
    if (!room) return;
    
    const timeout = this.flipTimeouts.get(room.id);
    if (timeout) {
      clearTimeout(timeout);
      this.flipTimeouts.delete(room.id);
    }
    
    if (room.status === 'waiting') {
      if (room.inviteCode) {
        this.inviteCodes.delete(room.inviteCode);
      }
      this.rooms.delete(room.id);
      return;
    }
    
    const opponent = room.player1.id === player.id ? room.player2 : room.player1;
    if (opponent) {
      this.sendMessage(opponent.ws, { type: 'opponent_left' });
    }
    
    this.rooms.delete(room.id);
  }

  private requestRematch(player: Player) {
    const room = this.findPlayerRoom(player);
    if (!room || room.status !== 'finished') return;
    
    const opponent = room.player1.id === player.id ? room.player2 : room.player1;
    if (opponent) {
      this.sendMessage(opponent.ws, { type: 'rematch_request' });
    }
  }

  private findPlayerRoom(player: Player): GameRoom | undefined {
    const roomsArray = Array.from(this.rooms.values());
    for (const room of roomsArray) {
      if (room.player1.id === player.id || room.player2?.id === player.id) {
        return room;
      }
    }
    return undefined;
  }
}
