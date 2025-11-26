export const analytics = {
    init: () => console.log('Analytics init (stub)'),
    track: (event: string, props?: any) => console.log('Track:', event, props),
    trackLevelStart: (levelId: string) => console.log('Level started:', levelId),
    trackLevelComplete: (levelId: string, xpEarned: number) => console.log('Level completed:', levelId, xpEarned),
    trackScenarioResult: (scenarioId: string, isCorrect: boolean, livesRemaining: number) => console.log('Scenario result:', scenarioId, isCorrect, livesRemaining),
    trackCoachOpened: (scenarioId: string) => console.log('Coach opened:', scenarioId)
};
