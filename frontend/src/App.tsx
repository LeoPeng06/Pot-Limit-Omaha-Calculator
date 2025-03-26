import React, { useState } from 'react';
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
} from '@mui/material';
import { HandRequest, HandResponse, SUITS, RANKS } from './types';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function App() {
  const [holeCards, setHoleCards] = useState<string[]>([]);
  const [communityCards, setCommunityCards] = useState<string[]>([]);
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [potSize, setPotSize] = useState<number>(0);
  const [betToCall, setBetToCall] = useState<number>(0);
  const [result, setResult] = useState<HandResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = async () => {
    try {
      const request: HandRequest = {
        hole_cards: holeCards,
        community_cards: communityCards,
        num_players: numPlayers,
        pot_size: potSize,
        bet_to_call: betToCall,
      };

      const response = await axios.post<HandResponse>(`${API_URL}/calculate`, request);
      setResult(response.data);
      setError('');
    } catch (err) {
      setError('Error calculating odds. Please check your input.');
      setResult(null);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
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
                <Typography color="error" gutterBottom>
                  {error}
                </Typography>
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
                        <Typography>{formatPercentage(result.pot_odds)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>Expected Value:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>${result.ev.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography
                          color={result.should_call ? 'success.main' : 'error.main'}
                          variant="h6"
                        >
                          {result.should_call ? 'Call' : 'Fold'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App; 