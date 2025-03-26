# Pot Limit Omaha Calculator

A web application for calculating odds in Pot Limit Omaha poker games. This project consists of a React frontend and Python backend.

## Project Structure

```
.
├── frontend/           # React frontend application
├── backend/           # Python FastAPI backend
└── shared/           # Shared types and utilities
```

## Features

- Calculate pot odds in PLO games
- Real-time equity calculations
- Hand strength evaluation
- Multiple player scenarios
- Modern, responsive UI

## Setup Instructions

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Axios

- Backend:
  - Python
  - FastAPI
  - Pydantic
  - Poker-eval (for hand evaluation)

## License

MIT License
