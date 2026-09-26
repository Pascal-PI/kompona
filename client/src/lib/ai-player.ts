import { GameCard, GameState, AIPlayer } from '../types/game';



export class PexesoAI implements AIPlayer {
  difficulty: number;
  private known: Map<number, string> = new Map(); // Cards AI has seen: position -> symbol
  private turnCounter: number = 0; // Track turns for forgetting mechanism

  constructor(difficulty: number) {
    this.difficulty = difficulty;
  }

  private getForgetInterval(): number {
    switch(this.difficulty) {
      case 100: return 1;  // Beginner: forgets every 1 turn
      case 500: return 2;  // Novice: forgets every 2 turns
      case 1000: return 3; // Intermediate: forgets every 3 turns
      case 1500: return 4; // Advanced: forgets every 4 turns
      case 2000: return 5; // Expert: forgets every 5 turns
      case 2500: return 6; // Master: forgets every 6 turns
      default: return 2;
    }
  }

  private forgetRandomCard(): void {
    const knownPositions = Array.from(this.known.keys());
    if (knownPositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * knownPositions.length);
      const positionToForget = knownPositions[randomIndex];
      const forgottenSymbol = this.known.get(positionToForget);
      this.known.delete(positionToForget);
      console.log(`AI forgot: Position ${positionToForget} = ${forgottenSymbol}`);
    }
  }

  async makeMove(cards: GameCard[], gameState: GameState): Promise<number> {
    // Increment turn counter and check for forgetting
    this.turnCounter++;
    const forgetInterval = this.getForgetInterval();
    if (this.turnCounter % forgetInterval === 0) {
      this.forgetRandomCard();
    }

    // Simulate thinking time
    const thinkingTime = Math.max(500, 2000 - (this.difficulty * 0.8));
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    // Learn from ALL currently flipped cards (including player's picks)
    cards.forEach((card, index) => {
      if (card.isFlipped && !card.isMatched && !this.known.has(index)) {
        this.known.set(index, card.symbol);
        console.log(`AI learned from revealed card: Position ${index} = ${card.symbol}`);
      }
    });

    // If there's a flipped card, try to match it
    if (gameState.flippedCards.length === 1) {
      const flippedIndex = gameState.flippedCards[0];
      const flippedSymbol = cards[flippedIndex].symbol;
      
      // Look for the matching card in known cards
      for (const [position, symbol] of this.known.entries()) {
        if (symbol === flippedSymbol && 
            position !== flippedIndex && 
            !cards[position].isFlipped && 
            !cards[position].isMatched) {
          console.log(`AI found match for ${flippedSymbol}: position ${position}`);
          return position;
        }
      }
    }

    // No card flipped or no match found - look for pairs AI can make
    const availableCards = cards
      .map((_, index) => index)
      .filter(index => !cards[index].isFlipped && !cards[index].isMatched);

    // Group known available cards by symbol
    const symbolGroups = new Map<string, number[]>();
    availableCards.forEach(index => {
      if (this.known.has(index)) {
        const symbol = this.known.get(index)!;
        if (!symbolGroups.has(symbol)) {
          symbolGroups.set(symbol, []);
        }
        symbolGroups.get(symbol)!.push(index);
      }
    });

    // Find a pair AI can complete
    for (const [symbol, positions] of symbolGroups.entries()) {
      if (positions.length >= 2) {
        console.log(`AI making pair of ${symbol} at position ${positions[0]}`);
        return positions[0];
      }
    }

    // No pairs available, pick randomly
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }

  // Method to learn from any revealed cards (called when player flips cards too)
  learnFromCards(cards: GameCard[]): void {
    cards.forEach((card, index) => {
      if (card.isFlipped && !card.isMatched && !this.known.has(index)) {
        this.known.set(index, card.symbol);
        console.log(`AI learned: Position ${index} = ${card.symbol}`);
      }
    });
  }

  resetMemory(): void {
    this.known.clear();
    this.turnCounter = 0;
  }
}
