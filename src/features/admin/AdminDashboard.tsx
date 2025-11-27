import { useState } from 'react';
import { ArrowLeft, Database, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { geminiService } from '@/lib/gemini';
import { scenarioStore } from '@/lib/scenario-store';

interface AdminDashboardProps {
    onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [dbCount, setDbCount] = useState(scenarioStore.getCount());

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

    const handleClear = () => {
        if (confirm('Are you sure? This deletes all AI-generated hands.')) {
            scenarioStore.clear();
            setDbCount(0);
            addLog('🗑️ Database cleared');
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
                        variant="danger"
                        onClick={handleClear}
                        disabled={dbCount === 0 || isGenerating}
                    >
                        <span className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Clear Database
                        </span>
                    </Button>
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
