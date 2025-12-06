import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, type ReactNode } from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { TableLayout } from '@/components/game/TableLayout';
import { BettingStack } from '@/components/game/BettingStack';
import { soundEngine } from '@/lib/sound';
import { calculateTableSeats, getFillerSeatStatus, type Position } from '@/lib/poker-engine';
import { playSuccessEffect, playFoldEffect, triggerShake, triggerHaptic } from '@/lib/effects';
import { type Scenario, type Action } from '@/lib/types';
import { bossLogic } from '@/lib/boss-logic';

// Helper types for the Render Prop pattern
export interface SmartTableControlsProps {
    handleAction: (action: Action) => void;
    isReady: boolean;
    amountToCall: number;
    raiseAmount: number;
}

interface SmartTableProps {
    currentScenario: Scenario;
    onActionComplete: (action: Action, isCorrect: boolean) => void;
    renderControls: (props: SmartTableControlsProps) => ReactNode; // Custom buttons for each mode
    boss?: any; // Optional boss data
    onVillainMessage?: (msg: string) => void; // Callback to show speech bubbles
    customTheme?: string;
}

export function SmartTable({
    currentScenario,
    onActionComplete,
    renderControls,
    boss,
    onVillainMessage,
    customTheme
}: SmartTableProps) {
    const [addedHeroChips, setAddedHeroChips] = useState(0);
    const [playbackStage, setPlaybackStage] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [internalVillainMsg, setInternalVillainMsg] = useState("");

    // --- PLAYBACK ANIMATION ---
    useEffect(() => {
        setPlaybackStage(0);
        setAddedHeroChips(0);

        const timeline = [
            { stage: 1, delay: 100, action: () => soundEngine.playCard() },
            { stage: 2, delay: 500, action: () => currentScenario.communityCards.length > 0 && soundEngine.playCard() },
            { stage: 3, delay: 1000, action: () => (currentScenario.villainChipsInFront! > 0) && soundEngine.playChips() },
            { stage: 4, delay: 1400, action: () => { } }
        ];

        const timeouts: ReturnType<typeof setTimeout>[] = [];
        timeline.forEach(({ stage, delay, action }) => {
            const t = setTimeout(() => {
                setPlaybackStage(stage as any);
                action();
            }, delay);
            timeouts.push(t);
        });
        return () => timeouts.forEach(clearTimeout);
    }, [currentScenario.id]);

    // --- DATA PREP ---
    const {
        villainAction,
        heroCards,
        communityCards,
        potSize,
        heroPosition = 'BTN',
        villainPosition = 'BB',
        heroChipsInFront = 0,
        villainChipsInFront = 0,
        blinds = { sb: 0.5, bb: 1 }
    } = currentScenario;

    const showHeroCards = playbackStage >= 1;
    const showBoard = playbackStage >= 2;
    const showVillainAction = playbackStage >= 3;
    const isReady = playbackStage >= 4;

    // --- 1. CHIPS LOGIC (The Core Fix) ---
    const isPreflop = communityCards.length === 0;
    let baseHeroChips = heroChipsInFront;
    if (isPreflop && baseHeroChips === 0) {
        if (heroPosition === 'SB') baseHeroChips = blinds.sb;
        if (heroPosition === 'BB') baseHeroChips = blinds.bb;
    }
    const displayHeroChips = baseHeroChips + addedHeroChips;

    // --- 2. SEATS LOGIC ---
    const seatConfigs = calculateTableSeats(heroPosition as Position, villainPosition as Position);
    const seatsArray = seatConfigs.map((config) => {
        if (config.isHero) return undefined;
        if (config.isVillain) {
            const stack = 100 - villainChipsInFront;
            let displayBet = villainChipsInFront;
            if (currentScenario.actionHistory.length === 0 && displayBet === 0) {
                if (config.positionLabel === 'SB') displayBet = blinds.sb;
                if (config.positionLabel === 'BB') displayBet = blinds.bb;
            }
            return {
                player: {
                    name: boss ? boss.name : 'Villain',
                    stack: stack,
                    isActive: true,
                    avatar: boss ? boss.avatar : undefined
                },
                betAmount: showVillainAction ? displayBet : 0,
                positionLabel: config.positionLabel,
                isFolded: false,
                lastAction: showVillainAction ? villainAction : '',
                isDealer: config.isDealer,
                isHero: false
            };
        }
        const { isFolded, betAmount } = getFillerSeatStatus(
            config.positionLabel,
            heroPosition as Position,
            currentScenario.street,
            currentScenario.actionHistory
        );
        return {
            player: { name: `Player ${config.id}`, stack: 100, isActive: !isFolded },
            positionLabel: config.positionLabel,
            isFolded: isFolded,
            lastAction: isFolded ? 'Fold' : '',
            isDealer: config.isDealer,
            betAmount: betAmount,
            isHero: false
        };
    });

    // --- 3. LIVE POT LOGIC (The Core Fix) ---
    const villainBet = seatsArray.find(s => s?.player.name === (boss ? boss.name : 'Villain'))?.betAmount || 0;
    const fillerBets = seatsArray.reduce((acc, s) => acc + (s && !s.player.name.includes('Villain') ? s.betAmount : 0), 0);
    const livePotSize = potSize + displayHeroChips + villainBet + fillerBets;

    const seats = [undefined, ...seatsArray.slice(1)] as any;


    // --- ACTION HANDLER (Unified) ---
    const handleActionWithSound = (action: Action) => {
        if (action === 'Fold') triggerHaptic('light');
        if (action === 'Call') triggerHaptic('medium');
        if (action === 'Raise') triggerHaptic('heavy');

        soundEngine.playClick();

        // Animation Logic
        if (action === 'Raise') {
            const fallbackRaise = Math.max(villainChipsInFront * 3, 3);
            const targetAmount = currentScenario.defaultRaiseAmount || fallbackRaise;
            const chipsToAdd = Math.max(0, targetAmount - baseHeroChips);
            setAddedHeroChips(chipsToAdd);
            soundEngine.playChips();
        }
        if (action === 'Call') {
            const callAmount = Math.max(0, villainChipsInFront - baseHeroChips);
            setAddedHeroChips(callAmount);
            soundEngine.playChips();
        }

        const isCorrect = action === currentScenario.correctAction;

        // Visual Feedback Logic
        if (isCorrect) {
            triggerHaptic('success');
            if (action === 'Fold') playFoldEffect();
            else playSuccessEffect();
        } else {
            triggerHaptic('error');
            triggerShake('smart-table-container');

            // Boss Reaction (Visual)
            if (boss) {
                const reaction = bossLogic.getReaction(boss, action, { potSize });
                if (reaction) {
                    setInternalVillainMsg(reaction);
                    if (onVillainMessage) onVillainMessage(reaction);
                    setTimeout(() => setInternalVillainMsg(""), 2500);
                }
            }
        }

        // Notify Parent
        onActionComplete(action, isCorrect);
    };

    const activeMsg = internalVillainMsg;

    return (
        <div id="smart-table-container" className="relative w-full h-full">
            {/* 1. TABLE AREA */}
            <div className="flex-1 min-h-0 w-full h-full flex items-center justify-center relative p-4">
                <div className="relative w-full h-full max-w-md">
                    <TableLayout
                        seats={seats}
                        communityCards={showBoard ? communityCards : []}
                        potSize={livePotSize}
                        themeClass={customTheme || (boss ? boss.colorTheme : undefined)}
                    />

                    {/* Hero Chips - CENTERED & LOWERED */}
                    {displayHeroChips > 0 && (
                        <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <BettingStack amount={displayHeroChips} position={1} />
                            </motion.div>
                        </div>
                    )}

                    {/* Villain Speech Bubble */}
                    <AnimatePresence>
                        {activeMsg && showVillainAction && (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-xl border-2 border-brand-primary/20 max-w-[200px]">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 text-center leading-tight">{activeMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 2. HERO CARDS OVERLAY */}
            <div className="absolute bottom-[110px] sm:bottom-[138px] left-1/2 -translate-x-1/2 sm:left-[30px] sm:translate-x-0 flex gap-2 z-30 origin-bottom scale-[0.65] sm:scale-[0.8] sm:origin-bottom-left pointer-events-none">
                {seatConfigs[0].isDealer && (
                    <div className="absolute -top-6 -right-2 sm:-top-4 sm:-right-4 h-6 w-6 sm:h-8 sm:w-8 bg-yellow-400 border border-yellow-500 text-yellow-950 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold z-40 shadow-md">D</div>
                )}
                {showHeroCards && heroCards.map((card, index) => (
                    <motion.div
                        key={`${currentScenario.id}-hero-${index}`}
                        initial={{ y: 200, opacity: 0, rotate: 0 }}
                        animate={{ y: 0, opacity: 1, rotate: index === 0 ? -5 : 5 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="origin-bottom"
                    >
                        <PlayingCard card={card} size="lg" className="shadow-2xl ring-2 ring-brand-accent/50" />
                    </motion.div>
                ))}
            </div>

            {/* 3. RENDER PROPS FOR CONTROLS (Buttons) */}
            {renderControls({
                handleAction: handleActionWithSound,
                isReady,
                amountToCall: currentScenario.amountToCall ?? Math.max(0, villainChipsInFront - heroChipsInFront),
                raiseAmount: currentScenario.defaultRaiseAmount || 0
            })}
        </div>
    );
}
