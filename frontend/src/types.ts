export interface HandRequest {
    hole_cards: string[];
    community_cards: string[];
    num_players: number;
    pot_size: number;
    bet_to_call: number;
}

export interface HandResponse {
    equity: number;
    pot_odds: number;
    should_call: boolean;
    ev: number;
}

export interface Card {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: string;
    value: number;
}

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const; 