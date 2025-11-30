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
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { levels } from '@/features/map/levels';
import { usePlayerState } from '@/hooks/usePlayerState';
import { useQuests, type Quest } from '@/hooks/useQuests';
import { useAchievements } from '@/hooks/useAchievements';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { ProfileModal } from '@/components/ui/ProfileModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { AnimatePresence, motion } from 'framer-motion';

import { BottomNav } from '@/components/layout/BottomNav';

// Variants for page sliding
const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
  }),
  animate: {
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
  })
};

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

  const [currentScreen, setCurrentScreen] = useState<'menu' | 'map' | 'game' | 'blitz' | 'analyzer' | 'admin' | 'builder' | 'stats' | 'preflop' | 'chart' | 'profile'>('menu');
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [direction, setDirection] = useState(0);

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
      return;
    }

    // Calculate direction
    if (currentScreen === 'menu' && screen === 'profile') setDirection(1);
    if (currentScreen === 'profile' && screen === 'menu') setDirection(-1);

    setCurrentScreen(screen);
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
  const showBottomNav = currentScreen === 'menu' || currentScreen === 'profile';

  if (!isAppStarted) {
    return <SplashScreen onComplete={() => setIsAppStarted(true)} />;
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#f0f4f8]">
      <AnimatePresence custom={direction} initial={false}>
        {currentScreen === 'menu' && (
          <motion.div
            key="menu"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full absolute inset-0"
          >
            <MainMenu
              bankroll={bankroll}
              streak={streak}
              quests={quests}
              onNavigate={handleMenuNavigate}
            />
          </motion.div>
        )}

        {currentScreen === 'profile' && (
          <motion.div
            key="profile"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full absolute inset-0"
          >
            <ProfileScreen
              onNavigate={handleMenuNavigate}
              onOpenSettings={() => setIsSettingsOpen(true)}
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
            className="w-full h-full overflow-y-auto absolute inset-0 bg-slate-900"
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
            className="w-full h-full absolute inset-0 bg-slate-900"
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
            className="w-full h-full absolute inset-0 bg-slate-900"
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
            className="w-full h-full overflow-y-auto absolute inset-0 bg-slate-900"
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
            className="w-full h-full overflow-y-auto absolute inset-0 bg-slate-900"
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
            className="w-full h-full overflow-y-auto absolute inset-0 bg-slate-900"
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
            className="w-full h-full overflow-y-auto absolute inset-0 bg-slate-900"
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
            className="w-full h-full absolute inset-0 bg-slate-900"
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
            className="w-full h-full overflow-y-auto absolute inset-0 bg-slate-900"
          >
            <ChartEditor onBack={() => setCurrentScreen('admin')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSISTENT BOTTOM NAV */}
      <AnimatePresence>
        {showBottomNav && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="z-[60] relative"
          >
            <BottomNav
              activeTab={currentScreen as 'menu' | 'profile'}
              onNavigate={handleMenuNavigate}
            />
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
        onOpenSettings={() => {
          setIsProfileOpen(false);
          setIsSettingsOpen(true);
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
