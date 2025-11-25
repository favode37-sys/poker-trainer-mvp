# 🃏 Poker Trainer - Duolingo for Poker

A beautiful, interactive poker learning app inspired by Duolingo's UX design. Learn poker strategy through fun, bite-sized scenarios with instant feedback.

## ✨ Features Implemented

### 🎨 **Beautiful UI (Duolingo-inspired)**
- **3D Button Effects**: All buttons have the signature "lip" effect (`border-b-4`)
- **Brand Colors**: Green (#58CC02), Red (#FF4B4B), Blue (#1CB0F6)
- **Mobile-First Design**: Optimized for vertical orientation
- **Smooth Animations**: Framer Motion for all transitions

### 🗺️ **Career Progression Map**
- **Visual Learning Path**: Duolingo-style progression map
- **3 Distinct Levels**:
  - Kitchen Games 🏠 (Beginner)
  - Underground Club 🎰 (Intermediate)
  - Vegas Pro 💎 (Advanced)
- **Level States**: Active, Locked, Completed
- **Victory Screen**: XP rewards, accuracy stats, celebration
- **Smooth Navigation**: Seamlessly switch between map and game

### 🎮 **Interactive Game Loop**
1. **Select Level**: Click on active level node from the career map
2. **Scenario Display**: See your cards, opponent's action, and board
3. **User Decision**: Choose FOLD, CALL, or RAISE
4. **Instant Feedback**: Beautiful slide-up overlay with explanation
5. **Progress Tracking**: Lives, streak, and progress bar
6. **Level Complete**: Victory screen with stats and rewards
7. **Return to Map**: Continue your poker journey

### 🧠 **Learning Features**
- **3 Diverse Scenarios**:
  - Preflop: Premium hand strategy (AKs)
  - River: Avoiding bad bluff-catches
  - Flop: Value betting with top pair
- **Detailed Explanations**: Learn WHY each answer is correct
- **Opponent Types**: Passive, Aggressive, Tight, Loose
- **Difficulty Progression**: From basic to intermediate concepts
- **XP Rewards**: Earn points for completing levels

### 🎯 **Game Mechanics**
- **Lives System**: Start with 100 BB, lose 10 per mistake
- **Streak Counter**: Track consecutive correct answers
- **Progress Bar**: Visual feedback on lesson completion
- **Level System**: Unlock new challenges as you progress

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Lightning-fast dev server
- **Tailwind CSS 3** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Then open **http://localhost:5173/** in your browser!

## 📁 Project Structure

```
src/
├── components/ui/             # Reusable UI components
│   ├── Button.tsx            # 3D button with variants
│   ├── PlayingCard.tsx       # Animated poker card
│   ├── PokerChip.tsx         # Chip component
│   ├── FeedbackSheet.tsx     # Success/Error overlay
│   └── LevelCompleteModal.tsx # Victory screen
│
├── features/
│   ├── game/                 # Game logic and features
│   │   ├── GameTable.tsx     # Main game screen
│   │   ├── scenarios.ts      # Poker scenarios data
│   │   └── useGameLogic.ts   # Game state management
│   │
│   └── map/                  # Career progression
│       ├── CareerMap.tsx     # Level map UI
│       └── levels.ts         # Level definitions
│
└── lib/
    ├── types.ts              # TypeScript interfaces
    └── utils.ts              # Utility functions (cn)
```

## 🎓 How to Play

### Getting Started
1. **Open the app**: Navigate to http://localhost:5173/
2. **View the Career Map**: See all available levels
3. **Select a level**: Click on the yellow (active) level node

### Playing a Level
1. **Study the scenario**: 
   - Look at your cards (bottom)
   - Check the board (center - if any cards are shown)
   - Read opponent's action (speech bubble)
   - Note the opponent's type (badge under avatar)

2. **Make your decision**:
   - Click FOLD, CALL, or RAISE
   - Think about:
     - Hand strength
     - Position
     - Board texture
     - Opponent type (Passive/Aggressive/Tight/Loose)
     - Pot odds

3. **Learn from feedback**:
   - ✅ **Correct**: Read the explanation to understand why
   - ❌ **Wrong**: Learn what you missed and the correct answer
   - Your streak increases on correct answers
   - You lose 10 BB on incorrect answers

4. **Complete the level**:
   - Answer all scenarios in the level
   - View your stats (XP earned, accuracy, questions answered)
   - Click "CONTINUE JOURNEY" to return to the map

5. **Progress**:
   - Watch your streak grow
   - Keep an eye on your remaining lives (BB)
   - See the progress bar fill up
   - Earn XP for completing levels
   - Unlock new levels as you progress

## 🎨 Design Philosophy

Following Duolingo's proven UX patterns:
- **Immediate Feedback**: Know right away if you're correct
- **Positive Reinforcement**: Celebratory success messages
- **Educational Focus**: Every answer includes an explanation
- **Gamification**: Lives, streaks, and progress tracking
- **Beautiful Aesthetics**: Smooth animations and vibrant colors

## 🔜 Future Enhancements

- [ ] Sound effects for correct/incorrect answers
- [ ] More scenarios (50+ situations)
- [ ] Difficulty levels (Beginner, Intermediate, Advanced)
- [ ] Learning path/map (like Duolingo's skill tree)
- [ ] Statistics dashboard
- [ ] Spaced repetition algorithm
- [ ] Multiplayer mode
- [ ] Achievement system

## 📝 License

MIT License - Feel free to use this for learning and teaching poker!

---

**Made with ❤️ for poker learners everywhere**
