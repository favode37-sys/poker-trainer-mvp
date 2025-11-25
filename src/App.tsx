import { useState, useEffect } from 'react';
import { CareerMap } from '@/features/map/CareerMap';
import { GameTable } from '@/features/game/GameTable';
import { MOCK_LEVELS, type Level } from '@/features/map/levels';

type Screen = 'map' | 'game';

const STORAGE_KEY = 'poker-trainer-progress';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('map');
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  // Load levels from localStorage or use defaults
  const [levels, setLevels] = useState<Level[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved progress:', e);
        return MOCK_LEVELS;
      }
    }
    return MOCK_LEVELS;
  });

  // Save to localStorage whenever levels change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  }, [levels]);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevelId(levelId);
    setCurrentScreen('game');
  };

  const handleLevelComplete = (completedLevelId: string) => {
    console.log('🎉 Level completed:', completedLevelId);

    setLevels(prevLevels => {
      const newLevels = [...prevLevels];
      const completedIndex = newLevels.findIndex(l => l.id === completedLevelId);

      if (completedIndex === -1) {
        console.error('Completed level not found:', completedLevelId);
        return prevLevels;
      }

      // Mark current level as completed
      newLevels[completedIndex] = {
        ...newLevels[completedIndex],
        status: 'completed'
      };

      // Unlock next level if it exists
      const nextIndex = completedIndex + 1;
      if (nextIndex < newLevels.length && newLevels[nextIndex].status === 'locked') {
        newLevels[nextIndex] = {
          ...newLevels[nextIndex],
          status: 'active'
        };
        console.log('🔓 Unlocked next level:', newLevels[nextIndex].title);
      }

      console.log('📊 Updated levels:', newLevels);
      return newLevels;
    });
  };

  const handleBackToMap = () => {
    setCurrentScreen('map');
    setSelectedLevelId(null);
  };

  const handleResetProgress = () => {
    console.log('🔄 Resetting all progress...');

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);

    // Reset levels to initial state
    setLevels(MOCK_LEVELS);

    // Return to map
    setCurrentScreen('map');
    setSelectedLevelId(null);

    console.log('✅ Progress reset complete');

    // Optional: Show a brief alert
    setTimeout(() => {
      alert('✅ Progress has been reset!\n\nAll levels are back to their initial state.');
    }, 100);
  };

  const selectedLevel = selectedLevelId === 'TEST_HAND'
    ? {
      id: 'TEST_HAND',
      title: '🛠️ Dev Test: Full Hand',
      scenarios: ['mda_rule1_turn_xr', 'mda_rule2_triple_barrel', 'mda_rule3_give_up_river', 'mda_rule4_preflop_3bet', 'mda_bonus_value_bet'],
      xpReward: 0,
      status: 'active' as const,
      position: { x: 0, y: 0 }
    }
    : selectedLevelId
      ? levels.find(l => l.id === selectedLevelId)
      : null;

  return (
    <div className="min-h-screen w-full bg-slate-900 flex justify-center items-center font-sans">
      <div className="w-full max-w-[420px] h-full min-h-screen bg-slate-50 relative shadow-2xl overflow-hidden transform">
        {currentScreen === 'map' ? (
          <CareerMap
            levels={levels}
            onLevelSelect={handleLevelSelect}
            onResetProgress={handleResetProgress}
          />
        ) : (
          selectedLevel && (
            <GameTable
              levelId={selectedLevel.id}
              levelTitle={selectedLevel.title}
              scenarioIds={selectedLevel.scenarios}
              xpReward={selectedLevel.xpReward}
              onLevelComplete={handleLevelComplete}
              onBackToMap={handleBackToMap}
            />
          )
        )}
      </div>
    </div>
  );
}

export default App;
