from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from treys import Card as TreysCard
from treys import Evaluator
from treys import Deck as TreysDeck
import logging
import time
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('plo_calculator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PLO Calculator API",
    description="API for calculating Pot Limit Omaha poker odds",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class HandRequest(BaseModel):
    """Request model for hand calculation"""
    holeCards: List[str]
    communityCards: List[str]
    numPlayers: int
    potSize: float
    betToCall: float

class HandResponse(BaseModel):
    """Response model for hand calculation"""
    equity: float
    potOdds: float
    shouldCall: bool
    ev: float

# Utility functions
def convertCardStrToTreys(cardStr: str) -> int:
    """
    Convert card string (e.g., "As" for Ace of spades) to treys format
    
    Args:
        cardStr: Card string in format "RankSuit" (e.g., "As", "Kh", "Qd", "Jc")
    
    Returns:
        int: Card representation in treys format
    """
    rankMap = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
                '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14}
    suitMap = {'s': 0, 'h': 1, 'd': 2, 'c': 3}
    
    rank = cardStr[:-1].upper()
    suit = cardStr[-1].lower()
    
    if rank not in rankMap or suit not in suitMap:
        raise ValueError(f"Invalid card format: {cardStr}")
    
    return TreysCard.new(rankMap[rank], suitMap[suit])

def calculateEquity(holeCards: List[str], communityCards: List[str], numPlayers: int) -> float:
    """
    Calculate equity for a PLO hand using Monte Carlo simulation
    
    Args:
        holeCards: List of hole cards in string format
        communityCards: List of community cards in string format
        numPlayers: Number of players in the hand
    
    Returns:
        float: Equity percentage (0-1)
    """
    startTime = time.time()
    logger.info(f"Starting equity calculation for {numPlayers} players")
    
    try:
        # Convert card strings to treys format
        holeCardsTreys = []
        for card in holeCards:
            holeCardsTreys.append(convertCardStrToTreys(card))

        # Convert community cards
        communityCardsTreys = []
        for card in communityCards:
            communityCardsTreys.append(convertCardStrToTreys(card))

        # Create evaluator
        evaluator = Evaluator()
        
        # Monte Carlo simulation
        numSimulations = 1000
        wins = 0
        
        for i in range(numSimulations):
            # Create a new deck and remove known cards
            deck = TreysDeck()
            for card in holeCardsTreys + communityCardsTreys:
                deck.cards.remove(card)
            
            # Complete the community cards
            currentCommunity = communityCardsTreys.copy()
            while len(currentCommunity) < 5:
                currentCommunity.append(deck.draw())
            
            # Create opponent hands
            opponentHands = []
            for _ in range(numPlayers - 1):
                opponentCards = [deck.draw() for _ in range(4)]
                opponentHands.append(opponentCards + currentCommunity)
            
            # Evaluate our hand
            ourHand = holeCardsTreys + currentCommunity
            ourScore = evaluator.evaluate(ourHand, [])
            
            # Compare hands
            if all(evaluator.evaluate(oppHand, []) > ourScore for oppHand in opponentHands):
                wins += 1
            
            if i % 100 == 0:
                logger.debug(f"Completed {i} simulations")
        
        equity = wins / numSimulations
        elapsedTime = time.time() - startTime
        logger.info(f"Equity calculation completed in {elapsedTime:.2f} seconds")
        logger.info(f"Final equity: {equity:.2%}")
        
        return equity
        
    except Exception as e:
        logger.error(f"Error in equity calculation: {str(e)}")
        raise

@app.post("/calculate", response_model=HandResponse)
async def calculateOdds(request: HandRequest):
    """
    Calculate odds for a PLO hand
    
    Args:
        request: HandRequest containing hand information
    
    Returns:
        HandResponse with calculated odds and recommendations
    """
    try:
        logger.info(f"Received calculation request: {request}")
        
        # Calculate equity
        equity = calculateEquity(
            request.holeCards,
            request.communityCards,
            request.numPlayers
        )
        
        # Calculate pot odds
        potOdds = request.betToCall / (request.potSize + request.betToCall)
        
        # Calculate EV
        ev = (equity * request.potSize) - ((1 - equity) * request.betToCall)
        
        # Determine if we should call
        shouldCall = ev >= 0
        
        response = HandResponse(
            equity=equity,
            potOdds=potOdds,
            shouldCall=shouldCall,
            ev=ev
        )
        
        logger.info(f"Calculation completed: {response}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    } 