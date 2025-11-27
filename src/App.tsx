import { useState } from 'react';
import { CareerMap } from '@/features/map/CareerMap';
import { GameTable } from '@/features/game/GameTable';
import { BlitzMode } from '@/features/game/BlitzMode';
import { HandAnalyzer } from '@/features/tools/HandAnalyzer';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { levels } from '@/features/map/levels';
import { usePlayerState } from '@/hooks/usePlayerState';
import { useQuests, type Quest } from '@/hooks/useQuests';

export default function App() {
  const {
    completedLevels,
    bankroll,
    streak,
    completeLevel,
    updateBankroll,
    resetProgress
  } = usePlayerState();

  const { quests, updateQuestProgress, resetQuests } = useQuests();

  const [currentScreen, setCurrentScreen] = useState<'map' | 'game' | 'blitz' | 'analyzer' | 'admin'>('map');
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevelId(levelId);
    setCurrentScreen('game');
  };

  const handleLevelComplete = (levelId: string) => {
    completeLevel(levelId);
  };

  const handleBackToMap = () => {
    setCurrentScreen('map');
    setSelectedLevelId(null);
  };

  const handleQuestEvent = (type: Quest['type'], value: number = 1) => {
    updateQuestProgress(type, value);
  };

  const handleFullReset = () => {
    resetProgress();
    resetQuests();
  };

  // Prepare levels with status
  const mapLevels = levels.map((level, index) => {
    const isCompleted = completedLevels.includes(level.id);
    const isUnlocked = index === 0 || completedLevels.includes(levels[index - 1].id);

    return {
      ...level,
      status: isCompleted ? 'completed' : isUnlocked ? 'active' : 'locked'
    } as const;
  });

  const selectedLevel = levels.find(l => l.id === selectedLevelId);

  return (
    <>
      {currentScreen === 'map' && (
        <CareerMap
          levels={mapLevels}
          onLevelSelect={handleLevelSelect}
          onResetProgress={handleFullReset}
          onBlitzClick={() => setCurrentScreen('blitz')}
          onAnalyzerClick={() => setCurrentScreen('analyzer')}
          onAdminClick={() => setCurrentScreen('admin')}
          bankroll={bankroll}
          streak={streak}
          quests={quests}
        />
      )}

      {currentScreen === 'game' && selectedLevel && (
        <GameTable
          levelId={selectedLevel.id}
          levelTitle={selectedLevel.title}
          scenarioIds={selectedLevel.scenarioIds}
          xpReward={selectedLevel.xpReward}
          onLevelComplete={handleLevelComplete}
          onBackToMap={handleBackToMap}
          bankroll={bankroll}
          streak={streak}
          updateBankroll={updateBankroll}
          onQuestEvent={handleQuestEvent}
        />
      )}

      {currentScreen === 'blitz' && (
        <BlitzMode
          onBack={handleBackToMap}
          onQuestEvent={handleQuestEvent}
        />
      )}

      {currentScreen === 'analyzer' && (
        <HandAnalyzer onBack={handleBackToMap} />
      )}

      {currentScreen === 'admin' && (
        <AdminDashboard onBack={handleBackToMap} />
      )}
    </>
  );
}
