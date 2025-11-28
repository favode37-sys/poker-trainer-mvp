import { useState } from 'react';
import { ArrowLeft, Database, Sparkles, Trash2, Layers, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { geminiService } from '@/lib/gemini';
import { scenarioStore } from '@/lib/scenario-store';
import { scenarioValidator } from '@/lib/validator';

interface AdminDashboardProps {
    onBack: () => void;
    onBuilderClick: () => void;
    onChartClick: () => void;
}

export function AdminDashboard({ onBack, onBuilderClick, onChartClick }: AdminDashboardProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [dbCount, setDbCount] = useState(scenarioStore.getCount());
    const [auditStats, setAuditStats] = useState({ total: 0, broken: 0, fixed: 0 });

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        addLog('🚀 Starting AI generation...');

        try {
            // 1. Generate
            const newScenarios = await geminiService.generateBlitzScenarios(5); // Generate 5 at a time to avoid timeouts
            addLog(`✅ AI generated ${newScenarios.length} raw scenarios`);

            // 2. Save
            scenarioStore.addBatch(newScenarios);
            setDbCount(scenarioStore.getCount());
            addLog('💾 Saved to local database');

        } catch (e) {
            addLog(`❌ Error: ${(e as Error).message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateBatch = async () => {
        setIsGenerating(true);
        addLog('🏭 Starting Batch Generation (40 hands)...');
        const streets = ['preflop', 'flop', 'turn', 'river'] as const;

        try {
            for (const street of streets) {
                addLog(`⏳ Generating 10 ${street} scenarios...`);
                const newScenarios = await geminiService.generateBlitzScenarios(10, street);
                scenarioStore.addBatch(newScenarios);
                setDbCount(scenarioStore.getCount());
                addLog(`✅ Saved 10 ${street} hands.`);
            }
            addLog('🎉 Success! Generated 40 balanced scenarios.');
        } catch (e) {
            addLog(`❌ Error: ${(e as Error).message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        if (confirm('Are you sure? This deletes all AI-generated hands.')) {
            scenarioStore.clear();
            setDbCount(0);
            addLog('🗑️ Database cleared');
        }
    };

    const handleAudit = async () => {
        setIsGenerating(true);
        addLog('🛡️ Starting Quality Audit...');

        const allScenarios = scenarioStore.getAll();
        const cleanedScenarios = [];
        let brokenCount = 0;
        let fixedCount = 0;

        try {
            for (const scenario of allScenarios) {
                const validation = scenarioValidator.validate(scenario);

                if (!validation.isValid) {
                    brokenCount++;
                    addLog(`⚠️ Broken: ${scenario.id} - ${validation.errors.join(', ')}`);

                    try {
                        addLog(`🔧 Attempting AI repair...`);
                        const fixed = await geminiService.repairScenario(scenario, validation.errors);
                        cleanedScenarios.push(fixed);
                        fixedCount++;
                        addLog(`✅ Repaired: ${scenario.id}`);
                    } catch (e) {
                        addLog(`❌ Failed to repair ${scenario.id}: ${(e as Error).message}`);
                        // Keep the broken one if repair fails
                        cleanedScenarios.push(scenario);
                    }
                } else {
                    cleanedScenarios.push(scenario);
                }
            }

            // Save cleaned database
            scenarioStore.overrideAll(cleanedScenarios);
            setDbCount(cleanedScenarios.length);
            setAuditStats({ total: allScenarios.length, broken: brokenCount, fixed: fixedCount });
            addLog(`🎉 Audit Complete! Scanned: ${allScenarios.length} | Fixed: ${fixedCount}`);
        } catch (e) {
            addLog(`❌ Audit Error: ${(e as Error).message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 p-6 font-mono">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
                    <button onClick={onBack} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
                            Content Factory v1.0
                        </h1>
                        <p className="text-neutral-500 text-sm">AI-Powered Scenario Generator</p>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                        <div className="flex items-center gap-2 text-neutral-400 mb-1">
                            <Database className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider">Database Size</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{dbCount} <span className="text-sm font-normal text-neutral-500">hands</span></div>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                        <div className="flex items-center gap-2 text-neutral-400 mb-1">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider">AI Model</span>
                        </div>
                        <div className="text-lg font-bold text-brand-primary">Gemini 2.5 Flash</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="h-16 text-lg"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Generating Content...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" /> Generate 5 Blitz Hands
                            </span>
                        )}
                    </Button>

                    <Button
                        fullWidth
                        size="lg"
                        variant="secondary"
                        onClick={handleGenerateBatch}
                        disabled={isGenerating}
                        className="h-16 text-lg bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Batch Processing...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Layers className="w-5 h-5" /> Generate Full Set (40 hands)
                            </span>
                        )}
                    </Button>

                    <Button
                        fullWidth
                        size="lg"
                        variant="outline"
                        onClick={onBuilderClick}
                        className="h-16 text-lg border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                    >
                        <span className="flex items-center gap-2">
                            🛠️ Manual Builder
                        </span>
                    </Button>

                    <Button
                        fullWidth
                        size="lg"
                        variant="outline"
                        onClick={onChartClick}
                        className="h-16 text-lg border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                    >
                        <span className="flex items-center gap-2">
                            📊 Chart Editor
                        </span>
                    </Button>

                    <Button
                        fullWidth
                        variant="danger"
                        onClick={handleClear}
                        disabled={dbCount === 0 || isGenerating}
                    >
                        <span className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Clear Database
                        </span>
                    </Button>
                </div>

                {/* Quality Control Section */}
                <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 space-y-3">
                    <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Quality Control
                    </h3>

                    <Button
                        fullWidth
                        variant="outline"
                        onClick={handleAudit}
                        disabled={dbCount === 0 || isGenerating}
                        className="bg-purple-600/10 hover:bg-purple-600/20 border-purple-500/50 text-purple-300"
                    >
                        <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Audit & Auto-Fix Database
                        </span>
                    </Button>

                    {auditStats.total > 0 && (
                        <div className="flex gap-4 text-xs">
                            <div className="flex-1 bg-neutral-900 p-2 rounded border border-neutral-700">
                                <div className="text-neutral-400">Scanned</div>
                                <div className="text-lg font-bold text-white">{auditStats.total}</div>
                            </div>
                            <div className="flex-1 bg-neutral-900 p-2 rounded border border-neutral-700">
                                <div className="text-neutral-400">Fixed</div>
                                <div className="text-lg font-bold text-green-400">{auditStats.fixed}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Terminal Log */}
                <div className="bg-black rounded-xl p-4 border border-slate-800 h-64 overflow-y-auto font-mono text-xs space-y-1 shadow-inner">
                    <div className="text-slate-500 pb-2 border-b border-slate-900 mb-2">System Logs...</div>
                    {logs.length === 0 && <span className="text-slate-700 italic">Waiting for commands...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="text-green-400">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
