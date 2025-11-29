import { useState } from 'react';
import { CareerMap } from '@/features/map/CareerMap';
import { GameTable } from '@/features/game/GameTable';
import { BlitzMode } from '@/features/game/BlitzMode';
import { HandAnalyzer } from '@/features/tools/HandAnalyzer';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { ScenarioBuilder } from '@/features/admin/ScenarioBuilder';
import { StatsDashboard } from '@/features/stats/StatsDashboard';
import { PreflopTrainer } from '@/features/tools/PreflopTrainer';
import { ChartEditor } from '@/features/admin/ChartEditor';
import { MainMenu } from '@/features/menu/MainMenu';
import { levels } from '@/features/map/levels';
import { usePlayerState } from '@/hooks/usePlayerState';
import { useQuests, type Quest } from '@/hooks/useQuests';
import { useAchievements } from '@/hooks/useAchievements';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { ProfileModal } from '@/components/ui/ProfileModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { AnimatePresence, motion } from 'framer-motion';

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
  const { resetAchievements } = useAchievements();

  const [currentScreen, setCurrentScreen] = useState<'menu' | 'map' | 'game' | 'blitz' | 'analyzer' | 'admin' | 'builder' | 'stats' | 'preflop' | 'chart'>('menu');
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevelId(levelId);
    setCurrentScreen('game');
  };

  const handleLevelComplete = (levelId: string) => {
    completeLevel(levelId);
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setSelectedLevelId(null);
  };

  const handleMenuNavigate = (screen: any) => {
    if (screen === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setCurrentScreen(screen);
    }
  };

  const handleQuestEvent = (type: Quest['type'], value: number = 1) => {
    updateQuestProgress(type, value);
  };

  const handleFullReset = () => {
    resetProgress();
    resetQuests();
    resetAchievements();
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

  if (!isAppStarted) {
    return <SplashScreen onComplete={() => setIsAppStarted(true)} />;
  }

  return (
    <div className="w-full h-full overflow-hidden bg-slate-900">
      <AnimatePresence mode="wait">
        {currentScreen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <MainMenu
              bankroll={bankroll}
              streak={streak}
              quests={quests}
              onNavigate={handleMenuNavigate}
              onProfileClick={() => setIsProfileOpen(true)}
            />
          </motion.div>
        )}

        {currentScreen === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto"
          >
            <CareerMap
              levels={mapLevels}
              onLevelSelect={handleLevelSelect}
              onBack={handleBackToMenu}
              onResetProgress={handleFullReset}
              bankroll={bankroll}
              streak={streak}
            />
          </motion.div>
        )}

        {currentScreen === 'game' && selectedLevel && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <GameTable
              levelId={selectedLevel.id}
              levelTitle={selectedLevel.title}
              scenarioIds={selectedLevel.scenarioIds}
              xpReward={selectedLevel.xpReward}
              onLevelComplete={handleLevelComplete}
              onBackToMap={handleBackToMenu}
              bankroll={bankroll}
              streak={streak}
              updateBankroll={updateBankroll}
              onQuestEvent={handleQuestEvent}
              bossId={selectedLevel.bossId}
            />
          </motion.div>
        )}

        {currentScreen === 'blitz' && (
          <motion.div
            key="blitz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <BlitzMode
              onBack={handleBackToMenu}
              onQuestEvent={handleQuestEvent}
            />
          </motion.div>
        )}

        {currentScreen === 'analyzer' && (
          <motion.div
            key="analyzer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto"
          >
            <HandAnalyzer onBack={handleBackToMenu} />
          </motion.div>
        )}

        {currentScreen === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto"
          >
            <AdminDashboard
              onBack={handleBackToMenu}
              onBuilderClick={() => setCurrentScreen('builder')}
              onChartClick={() => setCurrentScreen('chart')}
            />
          </motion.div>
        )}

        {currentScreen === 'builder' && (
          <motion.div
            key="builder"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto"
          >
            <ScenarioBuilder onBack={() => setCurrentScreen('admin')} />
          </motion.div>
        )}

        {currentScreen === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto"
          >
            <StatsDashboard onBack={handleBackToMenu} />
          </motion.div>
        )}

        {currentScreen === 'preflop' && (
          <motion.div
            key="preflop"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <PreflopTrainer onBack={handleBackToMenu} />
          </motion.div>
        )}

        {currentScreen === 'chart' && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto"
          >
            <ChartEditor onBack={() => setCurrentScreen('admin')} />
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenStats={() => {
          setIsProfileOpen(false);
          setCurrentScreen('stats');
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onReset={() => {
          handleFullReset();
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
}
