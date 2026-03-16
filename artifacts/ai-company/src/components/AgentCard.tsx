import { AGENT_PROFILES } from "@/data/mock-data";
import { GlowCard } from "./GlowCard";
import { Cpu, TrendingUp, ShieldAlert, Coins } from "lucide-react";
import { motion } from "framer-motion";

interface AgentCardProps {
  agentKey: keyof typeof AGENT_PROFILES;
  status: 'idle' | 'active' | 'speaking';
}

const ICONS = {
  tech: Cpu,
  market: TrendingUp,
  skeptic: ShieldAlert,
  finance: Coins,
  system: Cpu
};

export function AgentCard({ agentKey, status }: AgentCardProps) {
  const profile = AGENT_PROFILES[agentKey];
  const Icon = ICONS[agentKey as keyof typeof ICONS];
  
  if (!profile) return null;

  const isActive = status === 'active' || status === 'speaking';

  return (
    <GlowCard 
      glowColorClass={profile.border} 
      isActive={isActive}
      className="flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-background border ${profile.border} ${isActive ? 'bg-opacity-20' : 'bg-opacity-50'}`}>
          <Icon className={`w-6 h-6 ${profile.text}`} />
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 bg-background/50 border border-white/10 px-3 py-1 rounded-full">
          <motion.div 
            animate={{ opacity: status === 'speaking' ? [0.4, 1, 0.4] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${
              status === 'speaking' ? `bg-${profile.text.replace('text-', '')}` : 
              status === 'active' ? 'bg-green-500' : 'bg-white/20'
            }`} 
          />
          <span className="text-[10px] uppercase font-display tracking-widest text-muted-foreground">
            {status}
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="font-display text-lg font-bold text-foreground tracking-wide">
          {profile.name}
        </h3>
        <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">
          Model: <span className={profile.text}>{profile.model}</span>
        </p>
      </div>
    </GlowCard>
  );
}
