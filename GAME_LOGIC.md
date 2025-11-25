# Poker Trainer - Game Logic Documentation

## 🎮 Game Flow

### 1. **Playing State**
- User sees a poker scenario with:
  - Hero cards (2 cards at the bottom)
  - Community cards (0-5 cards in the center)
  - Opponent action (in speech bubble)
  - Three action buttons: FOLD, CALL, RAISE

### 2. **User Action**
- User clicks one of the three buttons
- `handleAction()` compares the choice with `correctAction`

### 3. **Feedback State**
- **Success** (Correct Answer):
  - Green feedback sheet slides up from bottom
  - Shows checkmark icon and "Correct!" message
  - Displays explanation
  - Increases streak counter
  - "CONTINUE" button advances to next scenario
  
- **Error** (Wrong Answer):
  - Red feedback sheet slides up from bottom
  - Shows X icon and "Not Quite" message
  - Shows correct answer and explanation
  - Decreases lives by 10 BB
  - Resets streak to 0
  - "GOT IT" button advances to next scenario

### 4. **Next Scenario**
- Clicking the feedback button:
  - Resets game state to 'playing'
  - Advances to next scenario (loops back to start)
  - Updates progress bar

## 📊 Mock Scenarios

### Scenario 1: Preflop AKs
- **Situation**: Hero has AKs in UTG position
- **Opponent**: Passive player calls 2 BB
- **Correct Action**: RAISE
- **Learning**: Premium hands should be raised to build pot

### Scenario 2: River Second Pair
- **Situation**: Hero has second pair, board shows A-T-6-3-K
- **Opponent**: Aggressive player bets 45 BB into 90 BB pot
- **Correct Action**: FOLD
- **Learning**: Avoid risky bluff-catches as a beginner

### Scenario 3: Flop Top Pair
- **Situation**: Hero has AQ, flop shows A-7-2
- **Opponent**: Tight player checks
- **Correct Action**: RAISE (bet for value)
- **Learning**: Bet top pair for value and protection

## 🎯 State Management

The `useGameLogic` hook manages:
- `currentScenarioIndex`: Which scenario is active (0-2)
- `lives`: Player's remaining BB (starts at 100)
- `streak`: Consecutive correct answers
- `gameState`: 'playing' | 'success' | 'error'
- `feedbackMessage`: Text shown in feedback overlay
- `progress`: Visual progress bar (calculated from scenario index)

## 🎨 UI Components

### FeedbackSheet
- Animated bottom sheet with Framer Motion
- Slides up from `y: 100%` to `y: 0`
- Success: Green theme with CheckCircle icon
- Error: Red theme with XCircle icon
- Responsive to user's answer

### GameTable
- Full-screen layout with:
  - HUD (progress, lives, streak)
  - Opponent area (avatar, type badge, action bubble)
  - Table area (pot, community cards, hero cards)
  - Controls (action buttons)
  - Feedback overlay (conditional)

## 🔄 Animation Details

- **Cards**: Staggered entrance animations
  - Community cards: slide down with spring physics
  - Hero cards: slide up with spring physics
- **Feedback Sheet**: Slide up with spring damping
- **Progress Bar**: Smooth width transition on scenario change
- **Opponent Action**: Fade in on new scenario
