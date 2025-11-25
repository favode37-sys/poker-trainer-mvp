# Component Architecture

## Component Tree

```
App
└── GameTable (Smart Component - uses useGameLogic hook)
    ├── HUD (Top Bar)
    │   ├── Progress Bar
    │   ├── Lives Display
    │   │   └── PokerChip (blue)
    │   └── Streak Display
    │       └── Flame Icon
    │
    ├── Opponent Area
    │   ├── Avatar
    │   ├── Type Badge (Passive/Aggressive/Tight/Loose)
    │   └── Speech Bubble (opponent action)
    │
    ├── Table Area (The Felt)
    │   ├── Pot Size Display
    │   ├── Community Cards Row
    │   │   ├── PlayingCard (sm) x 0-5
    │   │   └── Empty Slots (dashed borders)
    │   └── Hero Cards Row
    │       └── PlayingCard (lg) x 2
    │
    ├── Controls Area
    │   ├── FOLD Button (danger variant)
    │   ├── CALL Button (primary variant)
    │   ├── RAISE Button (secondary variant)
    │   └── "Why?" Button (ghost variant)
    │
    └── FeedbackSheet (Conditional - shown on success/error)
        ├── Icon (CheckCircle2 / XCircle)
        ├── Header ("Correct!" / "Not Quite")
        ├── Message Box (explanation)
        └── Action Button ("CONTINUE" / "GOT IT")
```

## Data Flow

```
scenarios.ts (Mock Data)
    ↓
useGameLogic (State Management)
    ↓
GameTable (Presentation)
    ↓
User Clicks Button
    ↓
handleAction() (in useGameLogic)
    ↓
Compare with correctAction
    ↓
Update gameState
    ├─→ 'success' → Show Green FeedbackSheet
    └─→ 'error'   → Show Red FeedbackSheet
    ↓
User clicks CONTINUE/GOT IT
    ↓
handleNext() (in useGameLogic)
    ↓
Reset state, advance to next scenario
```

## State Management (useGameLogic)

### State Variables
- `currentScenarioIndex`: number (0-2)
- `lives`: number (100 - mistakes * 10)
- `streak`: number (consecutive correct answers)
- `gameState`: 'playing' | 'success' | 'error'
- `feedbackMessage`: string | null

### Derived Values
- `currentScenario`: MOCK_SCENARIOS[currentScenarioIndex]
- `progress`: (currentScenarioIndex + 1) / total * 100

### Actions
- `handleAction(action)`: Process user's answer
- `handleNext()`: Move to next scenario

## Component Props

### GameTable
- No props (self-contained with hook)

### PlayingCard
```typescript
{
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  hidden?: boolean;
  className?: string;
}
```

### PokerChip
```typescript
{
  value?: number;
  color?: 'red' | 'blue' | 'green';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### Button
```typescript
{
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}
```

### FeedbackSheet
```typescript
{
  state: 'success' | 'error' | null;
  message: string | null;
  onNext: () => void;
}
```

## Animation Timeline

### Scenario Load
1. **0.0s**: Progress bar animates width
2. **0.0s**: Opponent action fades in
3. **0.0-0.5s**: Community cards slide down (staggered 0.1s each)
4. **0.5-0.65s**: Hero cards slide up (staggered 0.15s each)

### User Answers
1. **Immediate**: Buttons disabled
2. **0.0-0.3s**: FeedbackSheet slides up from bottom
3. **User clicks CONTINUE/GOT IT**
4. **0.0-0.3s**: FeedbackSheet slides down
5. **Restart**: New scenario animation begins

## Styling Patterns

### Colors
- Primary (Green): `#58CC02` - Correct answers, CALL button
- Danger (Red): `#FF4B4B` - Wrong answers, FOLD button, lives
- Secondary (Blue): `#1CB0F6` - RAISE button, chip stacks
- Surface: `#E5E5E5` - Backgrounds

### 3D Effect (Border-b technique)
```css
border-b-4: Creates "lip" shadow effect
active:border-b-0: Removes lip when pressed
active:translate-y-[4px]: Moves button down to simulate press
```

### Borders & Shadows
- Cards: `border-2 border-slate-200 shadow-sm`
- Buttons: `border-b-4 border-[darker-shade]`
- Felt: `border-4 border-emerald-100/50 shadow-inner`
- Feedback: `shadow-2xl border-t-4`
