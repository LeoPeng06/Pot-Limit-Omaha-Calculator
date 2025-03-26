import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { HandRequest, HandResponse, SUITS, RANKS } from './types';
import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:8000';
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Card selection component
const CardSelector: React.FC<{
  title: string;
  cards: string[];
  onCardSelect: (card: string) => void;
  maxCards: number;
}> = ({ title, cards, onCardSelect, maxCards }) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const handleCardClick = (card: string) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else if (selectedCards.length < maxCards) {
      setSelectedCards([...selectedCards, card]);
      onCardSelect(card);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title} ({selectedCards.length}/{maxCards})
      </Typography>
      <Grid container spacing={1}>
        {SUITS.map(suit => (
          <Grid item xs={12} key={suit}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {RANKS.map(rank => {
                const card = `${rank}${suit[0]}`;
                const isSelected = selectedCards.includes(card);
                return (
                  <Button
                    key={card}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => handleCardClick(card)}
                    disabled={!isSelected && selectedCards.length >= maxCards}
                    sx={{ minWidth: '40px' }}
                  >
                    {rank}
                  </Button>
                );
              })}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

function App() {
  // State management
  const [holeCards, setHoleCards] = useState<string[]>([]);
  const [communityCards, setCommunityCards] = useState<string[]>([]);
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [potSize, setPotSize] = useState<number>(0);
  const [betToCall, setBetToCall] = useState<number>(0);
  const [result, setResult] = useState<HandResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // Debug logging
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('Current state:', {
        holeCards,
        communityCards,
        numPlayers,
        potSize,
        betToCall,
        result,
      });
    }
  }, [holeCards, communityCards, numPlayers, potSize, betToCall, result]);

  // API call handler
  const handleCalculate = async () => {
    try {
      if (DEBUG_MODE) {
        console.log('Sending request to API:', {
          holeCards,
          communityCards,
          numPlayers,
          potSize,
          betToCall,
        });
      }

      const request: HandRequest = {
        holeCards,
        communityCards,
        numPlayers,
        potSize,
        betToCall,
      };

      const response = await axios.post<HandResponse>(`${API_URL}/calculate`, request);
      
      if (DEBUG_MODE) {
        console.log('API Response:', response.data);
      }

      setResult(response.data);
      setError('');
      setSnackbar({
        open: true,
        message: 'Calculation completed successfully!',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error calculating odds. Please check your input.';
      setError(errorMessage);
      setResult(null);
      setSnackbar({
        open: true,
        message: errorMessage,
      });
    }
  };

  // Utility functions
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          PLO Odds Calculator
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Hand Information
              </Typography>
              
              {/* Card Selection */}
              <CardSelector
                title="Hole Cards"
                cards={holeCards}
                onCardSelect={(card) => setHoleCards([...holeCards, card])}
                maxCards={4}
              />
              
              <CardSelector
                title="Community Cards"
                cards={communityCards}
                onCardSelect={(card) => setCommunityCards([...communityCards, card])}
                maxCards={5}
              />
              
              {/* Game Parameters */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Number of Players</InputLabel>
                <Select
                  value={numPlayers}
                  label="Number of Players"
                  onChange={(e) => setNumPlayers(Number(e.target.value))}
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} Players
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Pot Size"
                type="number"
                value={potSize}
                onChange={(e) => setPotSize(Number(e.target.value))}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Bet to Call"
                type="number"
                value={betToCall}
                onChange={(e) => setBetToCall(Number(e.target.value))}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleCalculate}
                fullWidth
                disabled={holeCards.length !== 4}
              >
                Calculate Odds
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {result && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hand Analysis
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography>Equity:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>{formatPercentage(result.equity)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>Pot Odds:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>{formatPercentage(result.potOdds)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>Expected Value:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>${result.ev.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Alert 
                          severity={result.shouldCall ? "success" : "error"}
                          sx={{ mt: 2 }}
                        >
                          {result.shouldCall ? 'Call' : 'Fold'}
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}

export default App;
