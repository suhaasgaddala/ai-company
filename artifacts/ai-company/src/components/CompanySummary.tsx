import { Run } from "@workspace/api-client-react";
import { GlowCard } from "./GlowCard";
import { Network, Database, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface CompanySummaryProps {
  run: Run | null;
}

export function CompanySummary({ run }: CompanySummaryProps) {
  if (!run || !run.companyName) {
    return (
      <GlowCard className="border-dashed border-white/10 flex flex-col items-center justify-center py-12 text-center h-full">
        <Network className="w-12 h-12 text-white/10 mb-4" />
        <h3 className="font-display tracking-widest text-white/30 uppercase">No Company Data</h3>
        <p className="text-sm text-white/20 mt-2 font-mono">Run simulation to generate company profile</p>
      </GlowCard>
    );
  }

  return (
    <GlowCard glowColorClass="border-primary" isActive className="h-full">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row gap-6 h-full"
      >
        <div className="flex-1 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-display tracking-widest uppercase mb-4">
              <Activity className="w-3 h-3" />
              Finalized Entity
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-wider mb-2">
              {run.companyName}
            </h2>
            <p className="text-xl text-primary font-light">
              {run.companyTagline}
            </p>
          </div>
          
          <div className="p-4 bg-black/40 border border-white/5 rounded-lg">
            <h4 className="font-mono text-xs text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Database className="w-3 h-3" /> Selected Idea
            </h4>
            <h5 className="font-bold text-white/90 mb-2">{run.selectedIdeaTitle}</h5>
            <p className="text-sm text-white/60 leading-relaxed">
              {run.selectedIdeaSummary}
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-64 flex flex-col justify-end gap-4 p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <div className="space-y-1">
            <div className="text-xs font-mono text-primary/60 uppercase">Run ID</div>
            <div className="font-mono text-sm text-white/80">{run.id}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-primary/60 uppercase">Phase</div>
            <div className="font-mono text-sm text-white/80 capitalize">{run.phase}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-primary/60 uppercase">Keywords</div>
            <div className="font-mono text-sm text-white/80">{run.userKeywords}</div>
          </div>
        </div>
      </motion.div>
    </GlowCard>
  );
}
