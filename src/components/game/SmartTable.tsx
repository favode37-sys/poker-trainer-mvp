import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { TableLayout } from '@/components/game/TableLayout';
import { BettingStack } from '@/components/game/BettingStack';
import { soundEngine } from '@/lib/sound';
import { calculateTableSeats, type Position } from '@/lib/poker-engine';
import { playSuccessEffect, playFoldEffect, triggerShake, triggerHaptic } from '@/lib/effects';
import { type Scenario, type Action, type Decision } from '@/lib/types';
import { bossLogic } from '@/lib/boss-logic';
import { PREFLOP_ORDER, POSTFLOP_ORDER, getAllFoldedPositions } from '@/lib/action-engine';

export interface SmartTableControlsProps {
    handleAction: (action: Action) => void;
    isReady: boolean;
    amountToCall: number;
    raiseAmount: number;
}

interface SmartTableProps {
    currentScenario: Scenario;
    onActionComplete: (action: Action, isCorrect: boolean) => void;
    renderControls: (props: SmartTableControlsProps) => ReactNode;
    boss?: any;
    onVillainMessage?: (msg: string) => void;
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
    const [heroActed, setHeroActed] = useState(false);
    const [heroFolded, setHeroFolded] = useState(false); // Track if Hero folded for card animation

    // Multi-decision support
    const [decisionIndex, setDecisionIndex] = useState(0);
    const decisions = currentScenario.decisions || [];
    const hasMultipleDecisions = decisions.length > 1;
    const currentDecision: Decision | null = decisions[decisionIndex] || null;

    // --- PLAYBACK ANIMATION ---
    useEffect(() => {
        setPlaybackStage(0);
        setAddedHeroChips(0);
        setHeroActed(false);
        setHeroFolded(false); // Reset fold state for new scenario
        setDecisionIndex(0); // Reset to first decision

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

    // --- DATA PREP (use currentDecision if multi-decision scenario) ---
    const {
        heroCards,
        communityCards,
        potSize,
        heroPosition = 'BTN',
        villainPosition = 'BB',
        villains = [],
        blinds = { sb: 0.5, bb: 1 }
    } = currentScenario;

    // Debug: Log decisions array
    console.log('[SmartTable] Scenario:', currentScenario.id, 'Decisions:', decisions.length, 'Current Index:', decisionIndex);
    if (decisions.length > 0) {
        console.log('[SmartTable] Decision', decisionIndex, ':', decisions[decisionIndex]);
    }

    // Use decision-specific values if available
    const effectiveHeroChips = currentDecision?.heroChipsInFront ?? currentScenario.heroChipsInFront ?? 0;
    const effectiveVillainChips = currentDecision?.villainChipsInFront ?? currentScenario.villainChipsInFront ?? 0;
    const effectiveVillainAction = currentDecision?.villainAction ?? currentScenario.villainAction ?? 'Check';
    const effectiveAmountToCall = currentDecision?.amountToCall ?? currentScenario.amountToCall ?? 0;
    const effectiveRaiseAmount = currentDecision?.defaultRaiseAmount ?? currentScenario.defaultRaiseAmount ?? 0;
    const effectiveCorrectAction = currentDecision?.correctAction ?? currentScenario.correctAction;

    console.log('[SmartTable] effectiveCorrectAction:', effectiveCorrectAction);

    const showHeroCards = playbackStage >= 1;
    const showBoard = playbackStage >= 2;
    const showVillainAction = playbackStage >= 3;
    const isReady = playbackStage >= 4;

    console.log('[SmartTable] playbackStage:', playbackStage, 'isReady:', isReady);

    // --- 1. HERO CHIPS ---
    const isPreflop = communityCards.length === 0;
    let baseHeroChips = effectiveHeroChips;

    // Auto-Blinds for Hero
    if (isPreflop && baseHeroChips === 0) {
        if (heroPosition === 'SB') baseHeroChips = blinds.sb;
        if (heroPosition === 'BB') baseHeroChips = blinds.bb;
    }
    const displayHeroChips = baseHeroChips + addedHeroChips;

    // --- ACTION ORDER (using action-engine) ---
    const actionOrder = isPreflop ? PREFLOP_ORDER : POSTFLOP_ORDER;
    const heroOrderIndex = actionOrder.indexOf(heroPosition);
    const mainVillainPos = villains[0]?.position || villainPosition;
    const villainOrderIndex = actionOrder.indexOf(mainVillainPos);

    // Get all villain positions for fold calculation
    const villainPositions = useMemo(() =>
        villains.length > 0
            ? villains.map(v => v.position)
            : [villainPosition],
        [villains, villainPosition]
    );

    // All fillers that should be folded by end of action
    const allFoldedPositions = useMemo(() =>
        getAllFoldedPositions(heroPosition, villainPositions),
        [heroPosition, villainPositions]
    );

    // --- 2. SEATS LOGIC ---
    const seatConfigs = calculateTableSeats(heroPosition as Position, villains[0]?.position as Position || villainPosition as Position);

    const seatsArray = seatConfigs.map((config) => {
        // A. HERO
        if (config.isHero) return undefined;

        // B. VILLAIN (Check if this seat is occupied by ANY villain in the scenario)
        const villainData = villains.find(v => v.position === config.positionLabel);
        const isMainVillain = config.positionLabel === villainPosition || villainData?.position === villainPosition;

        if (villainData || isMainVillain) {
            const stack = villainData?.stack || 100;
            // Use effectiveVillainChips for main villain in multi-decision scenarios
            let displayBet = isMainVillain ? effectiveVillainChips : (villainData?.chipsInFront || 0);

            // Auto-Blinds for Villain
            if (isPreflop && displayBet === 0) {
                if (config.positionLabel === 'SB') displayBet = blinds.sb;
                if (config.positionLabel === 'BB') displayBet = blinds.bb;
            }

            // Determine villain action to display
            const villainActionToShow = isMainVillain ? effectiveVillainAction : (villainData?.action || 'Check');

            return {
                player: {
                    name: boss ? boss.name : `Villain ${config.positionLabel}`,
                    stack: stack - displayBet,
                    isActive: true,
                    avatar: boss ? boss.avatar : undefined
                },
                betAmount: showVillainAction ? displayBet : 0,
                positionLabel: config.positionLabel,
                isFolded: false,
                lastAction: (showVillainAction && villainActionToShow !== 'To Act' && villainActionToShow !== 'Check') ? villainActionToShow : '',
                isDealer: config.isDealer,
                isHero: false
            };
        }

        // C. FILLER (Empty Seat)
        const positionLabel = config.positionLabel || '';
        const fillerOrderIndex = actionOrder.indexOf(positionLabel);

        // Check if this position should be folded
        const isFolded = allFoldedPositions.has(positionLabel);

        // Determine WHEN to show the fold based on action order
        // Players before Hero in action order: fold at showVillainAction stage (they've already acted)
        // Players between Hero and Villain: fold when Hero acts
        // Players after Villain: fold when Hero has acted AND Villain has actually made a bet/raise
        const actedBeforeHero = fillerOrderIndex < heroOrderIndex && fillerOrderIndex !== -1;
        const isBetweenHeroAndVillain = fillerOrderIndex > heroOrderIndex &&
            fillerOrderIndex < villainOrderIndex &&
            fillerOrderIndex !== -1;
        const isAfterVillain = fillerOrderIndex > villainOrderIndex && fillerOrderIndex !== -1;

        // Check if villain has actually made a betting action (not just "Check" or empty)
        const villainHasBet = effectiveVillainChips > 0 ||
            (effectiveVillainAction && !['Check', 'To Act', ''].includes(effectiveVillainAction));

        // When should we show the fold animation?
        const shouldShowFold = isFolded && (
            (actedBeforeHero && showVillainAction) ||
            (isBetweenHeroAndVillain && heroActed) ||
            (isAfterVillain && heroActed && villainHasBet) // Villain must have actually bet!
        );

        // Show blinds on preflop (SB/BB always post regardless of animation stage)
        let fillerBet = 0;
        if (isPreflop) {
            if (positionLabel === 'SB') fillerBet = blinds.sb;
            if (positionLabel === 'BB') fillerBet = blinds.bb;
        }

        return {
            player: { name: `Player ${config.id}`, stack: 100 - fillerBet, isActive: !shouldShowFold },
            positionLabel: positionLabel,
            isFolded: shouldShowFold,
            lastAction: shouldShowFold ? 'Fold' : '',
            isDealer: config.isDealer,
            betAmount: fillerBet,  // Blinds stay on table even when folded
            isHero: false
        };
    });

    // --- 3. LIVE POT LOGIC ---
    // On preflop: pot = blinds already posted = sum of all bets on table
    // On later streets: potSize from scenario + current street bets
    const totalVillainBets = seatsArray.reduce((acc, s) => acc + (s?.betAmount || 0), 0);

    // If preflop, pot is just the visible bets (no base potSize to avoid double counting blinds)
    // If postflop, use potSize as accumulated pot from previous streets
    const livePotSize = isPreflop
        ? displayHeroChips + totalVillainBets
        : potSize + displayHeroChips + totalVillainBets;

    const seats = [undefined, ...seatsArray.slice(1)] as any;

    // --- ACTION HANDLER ---
    const handleActionWithSound = (action: Action) => {
        soundEngine.playClick();

        console.log('[SmartTable] Action clicked:', action, 'Expected:', effectiveCorrectAction, 'DecisionIndex:', decisionIndex);
        console.log('[SmartTable] hasMultipleDecisions:', hasMultipleDecisions, 'decisions.length:', decisions.length);
        const isCorrect = action === effectiveCorrectAction;
        console.log('[SmartTable] isCorrect:', isCorrect);

        // Only apply visual changes (chips, folds) for CORRECT actions
        if (isCorrect) {
            // Haptic feedback for the action type
            if (action === 'Fold') triggerHaptic('light');
            if (action === 'Call') triggerHaptic('medium');
            if (action === 'Raise') triggerHaptic('heavy');

            // Mark that hero has acted - triggers fold animation for fillers
            setHeroActed(true);

            const maxVillainBet = Math.max(0, ...villains.map(v => v.chipsInFront || 0), effectiveVillainChips);

            // Add chips for Call/Raise
            if (action === 'Raise') {
                const fallbackRaise = Math.max(maxVillainBet * 3, 3);
                const targetAmount = effectiveRaiseAmount || fallbackRaise;
                const chipsToAdd = Math.max(0, targetAmount - baseHeroChips);
                setAddedHeroChips(chipsToAdd);
                soundEngine.playChips();
            }
            if (action === 'Call') {
                const callAmount = Math.max(0, maxVillainBet - baseHeroChips);
                setAddedHeroChips(callAmount);
                soundEngine.playChips();
            }
            // Success effects
            triggerHaptic('success');
            if (action === 'Fold') {
                setHeroFolded(true); // Trigger fold card animation
                playFoldEffect();
            } else {
                playSuccessEffect();
            }

            // Multi-decision: advance to next decision or complete
            if (hasMultipleDecisions && decisionIndex < decisions.length - 1) {
                // More decisions to go - animate transition
                // Note: We DON'T reset heroActed here - fillers should stay folded throughout the hand
                setTimeout(() => {
                    setDecisionIndex(decisionIndex + 1);
                    setAddedHeroChips(0);
                    // heroActed stays true - all fillers remain folded
                    soundEngine.playChips(); // Sound for villain response
                }, 800);
                return; // Don't call onActionComplete yet
            }

            // Final decision of multi-decision or single decision - complete with delay
            if (hasMultipleDecisions) {
                console.log('[SmartTable] Final decision complete! Calling onActionComplete in 1s...');
                setTimeout(() => {
                    console.log('[SmartTable] Calling onActionComplete now:', action, isCorrect);
                    onActionComplete(action, isCorrect);
                }, 1000);
                return;
            }

            // Single-decision scenario - add delay for bet animation before completing
            console.log('[SmartTable] Single decision complete! Waiting for bet animation...');
            setTimeout(() => {
                onActionComplete(action, isCorrect);
            }, 800); // 800ms delay for chips/fold animation to play
            return;
        } else {
            // WRONG action - only shake and error feedback, NO visual changes
            triggerHaptic('error');
            triggerShake('smart-table-container');

            if (boss) {
                const reaction = bossLogic.getReaction(boss, action, { potSize });
                if (reaction) {
                    setInternalVillainMsg(reaction);
                    if (onVillainMessage) onVillainMessage(reaction);
                    setTimeout(() => setInternalVillainMsg(""), 2500);
                }
            }
        }

        // This is only reached for wrong actions
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

                    {displayHeroChips > 0 && (
                        <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <BettingStack amount={displayHeroChips} position={1} />
                            </motion.div>
                        </div>
                    )}

                    <AnimatePresence>
                        {activeMsg && showVillainAction && (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-xl border-2 border-brand-primary/20 max-w-[200px]">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 text-center leading-tight">{activeMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 2. HERO CARDS OVERLAY with premium fold animation */}
            <div
                className="absolute bottom-[110px] sm:bottom-[138px] left-1/2 -translate-x-1/2 sm:left-[30px] sm:translate-x-0 flex gap-2 z-30 origin-bottom scale-[0.65] sm:scale-[0.8] sm:origin-bottom-left pointer-events-none"
                style={{ perspective: '1000px' }}
            >
                {seatConfigs[0].isDealer && (
                    <div className="absolute -top-6 -right-2 sm:-top-4 sm:-right-4 h-6 w-6 sm:h-8 sm:w-8 bg-yellow-400 border border-yellow-500 text-yellow-950 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold z-40 shadow-md">D</div>
                )}
                {showHeroCards && heroCards.map((card, index) => (
                    <motion.div
                        key={`${currentScenario.id}-hero-${index}`}
                        initial={{ y: 200, opacity: 0, rotateY: 0, rotateZ: 0, x: 0, scale: 1 }}
                        animate={heroFolded ? {
                            // Premium fold animation: flip, shrink, fall, and fly away
                            y: [0, -30, 150],
                            opacity: [1, 1, 0],
                            rotateY: [0, 90, 180], // Flip to card back
                            rotateZ: [index === 0 ? -5 : 5, index === 0 ? -15 : 15, index === 0 ? -45 : 45],
                            x: [0, 0, index === 0 ? -80 : 80], // Cards fly apart
                            scale: [1, 0.95, 0.7]
                        } : {
                            y: 0,
                            opacity: 1,
                            rotateY: 0,
                            rotateZ: index === 0 ? -5 : 5,
                            x: 0,
                            scale: 1
                        }}
                        transition={heroFolded ? {
                            duration: 0.8,
                            ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for premium feel
                            times: [0, 0.3, 1] // Keyframe timing
                        } : {
                            type: 'spring',
                            stiffness: 200,
                            damping: 20
                        }}
                        className="origin-center"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Card front (visible when not folded) */}
                        <motion.div
                            animate={{ opacity: heroFolded ? 0 : 1 }}
                            transition={{ duration: 0.2, delay: heroFolded ? 0.15 : 0 }}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <PlayingCard card={card} size="lg" className="shadow-2xl ring-2 ring-brand-accent/50" />
                        </motion.div>

                        {/* Card back (appears during flip) */}
                        {heroFolded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15, delay: 0.15 }}
                                className="absolute inset-0"
                                style={{
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                }}
                            >
                                <div className="w-24 h-36 rounded-2xl bg-gradient-to-br from-brand-primary via-brand-primary to-brand-accent border-2 border-brand-primary shadow-2xl overflow-hidden">
                                    <div className="absolute inset-1 rounded-xl border border-white/20" />
                                    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.1)_8px,rgba(255,255,255,0.1)_16px)]" />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* 3. CONTROLS */}
            {renderControls({
                handleAction: handleActionWithSound,
                isReady,
                amountToCall: effectiveAmountToCall,
                raiseAmount: effectiveRaiseAmount
            })}
        </div>
    );
}
