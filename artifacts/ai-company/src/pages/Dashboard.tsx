import { useState } from "react";
import { useSimulation } from "@/hooks/use-simulation";
import { CyberButton } from "@/components/CyberButton";
import { AgentCard } from "@/components/AgentCard";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { CompanySummary } from "@/components/CompanySummary";
import { ArtifactsPanel } from "@/components/ArtifactsPanel";
import { Hexagon, Plus, Terminal } from "lucide-react";
import { motion } from "framer-motion";

const EXAMPLE_KEYWORDS = [
  "healthcare, ai analytics", 
  "b2b saas, fintech", 
  "edtech, gamification", 
  "real estate, predictive"
];

export default function Dashboard() {
  const { status, run, messages, artifacts, startRun, resetRun } = useSimulation();
  const [keywords, setKeywords] = useState("");

  const handleStart = () => {
    if (!keywords) {
      startRun("general tech startup");
    } else {
      startRun(keywords);
    }
  };

  // Determine agent visual state based on latest message
  const getAgentStatus = (agentKey: string) => {
    if (status === 'idle' || status === 'completed') return 'idle';
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.agentKey === agentKey) return 'speaking';
    return 'active';
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8">
              <Hexagon className="w-8 h-8 text-primary absolute" />
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-widest leading-none">AI COMPANY</h1>
              <p className="font-mono text-[10px] text-primary tracking-widest uppercase">Autonomous Startup Factory</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 font-mono text-xs text-white/50 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              SYSTEM ONLINE
            </div>
            {status !== 'idle' && (
              <CyberButton variant="secondary" onClick={resetRun} className="py-2 px-4 text-xs">
                RESET
              </CyberButton>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 pt-8 space-y-8">
        
        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Agents */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Control Panel */}
            <section className="bg-card/80 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500 opacity-50" />
              
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                INITIALIZE RUN
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-white/50 uppercase tracking-widest mb-2">
                    Industry / Market Keywords
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. healthcare, ai, analytics" 
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    disabled={status !== 'idle'}
                    className="w-full bg-black/50 border border-white/20 rounded-none px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_KEYWORDS.map(kw => (
                    <button
                      key={kw}
                      onClick={() => setKeywords(kw)}
                      disabled={status !== 'idle'}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-mono text-[10px] text-white/60 transition-colors disabled:opacity-50"
                    >
                      {kw}
                    </button>
                  ))}
                </div>

                <CyberButton 
                  className="w-full mt-4" 
                  onClick={handleStart}
                  disabled={status !== 'idle'}
                  isLoading={status === 'running'}
                >
                  {status === 'running' ? 'SIMULATION IN PROGRESS...' : 'START FOUNDER DEBATE'}
                </CyberButton>
              </div>
            </section>

            {/* Agent Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display tracking-widest text-sm text-white/60 uppercase">Active Agents</h3>
                <span className="font-mono text-xs text-primary">4 / 4 ONLINE</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <AgentCard agentKey="tech" status={getAgentStatus('tech')} />
                <AgentCard agentKey="market" status={getAgentStatus('market')} />
                <AgentCard agentKey="skeptic" status={getAgentStatus('skeptic')} />
                <AgentCard agentKey="finance" status={getAgentStatus('finance')} />
              </div>
            </section>
          </div>

          {/* Right Column: Transcript */}
          <div className="lg:col-span-7">
            <TranscriptPanel messages={messages} />
          </div>
        </div>

        {/* Results Section (Only shows when running/completed) */}
        {status !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8 mt-12 pt-12 border-t border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-primary" />
              <h2 className="font-display text-2xl font-bold tracking-widest">GENERATED OUTPUT</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <CompanySummary run={run} />
              </div>
              <div className="lg:col-span-7">
                <ArtifactsPanel artifacts={artifacts} />
              </div>
            </div>
          </motion.div>
        )}
      </main>
      
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/cyber-grid.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
}
