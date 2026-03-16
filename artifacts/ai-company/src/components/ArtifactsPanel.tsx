import { useState } from "react";
import { Artifact } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, TrendingUp, PieChart, Monitor } from "lucide-react";

interface ArtifactsPanelProps {
  artifacts: Artifact[];
}

const TABS = [
  { id: 'product', label: 'Architecture', icon: Code },
  { id: 'gtm', label: 'GTM Strategy', icon: TrendingUp },
  { id: 'finance', label: 'Financials', icon: PieChart },
  { id: 'preview', label: 'Preview', icon: Monitor },
];

export function ArtifactsPanel({ artifacts }: ArtifactsPanelProps) {
  const [activeTab, setActiveTab] = useState('product');

  const activeArtifact = artifacts.find(a => a.artifactType === activeTab);

  return (
    <div className="flex flex-col bg-card border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
      <div className="flex flex-wrap border-b border-white/10 bg-black/40">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const hasContent = artifacts.some(a => a.artifactType === tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!hasContent}
              className={`
                flex items-center gap-2 px-6 py-4 font-display text-sm tracking-widest uppercase transition-all
                ${isActive ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
                ${!hasContent && 'opacity-30 cursor-not-allowed'}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      <div className="flex-1 p-6 bg-black/20 relative">
        <AnimatePresence mode="wait">
          {activeArtifact ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="prose prose-invert max-w-none font-mono text-sm leading-relaxed"
            >
              {/* Simplistic markdown rendering for MVP */}
              {activeArtifact.contentText?.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-display text-white mb-4 mt-6">{line.substring(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-display text-white/90 mb-3 mt-5">{line.substring(3)}</h2>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 text-white/70 mb-1">{line.substring(2)}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="text-white/70 mb-2">{line}</p>;
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-white/20 font-mono"
            >
              <Monitor className="w-12 h-12 mb-4 opacity-20" />
              <p>AWAITING ARTIFACT GENERATION</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
