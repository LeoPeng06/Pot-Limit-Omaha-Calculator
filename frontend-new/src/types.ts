export interface HandRequest {
    holeCards: string[];
    communityCards: string[];
    numPlayers: number;
    potSize: number;
    betToCall: number;
}

export interface HandResponse {
    equity: number;
    potOdds: number;
    shouldCall: boolean;
    ev: number;
}

export interface Card {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: string;
    value: number;
}

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const; 