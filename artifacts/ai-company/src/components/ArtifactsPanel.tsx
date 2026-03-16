import { useState } from "react";
import { Artifact } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, TrendingUp, PieChart, Monitor, Loader2 } from "lucide-react";

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  runId?: string;
  isGenerating?: boolean;
}

const TABS = [
  { id: 'product', label: 'Architecture', icon: Code },
  { id: 'gtm', label: 'GTM Strategy', icon: TrendingUp },
  { id: 'finance', label: 'Financials', icon: PieChart },
  { id: 'preview', label: 'Preview', icon: Monitor },
];

export function ArtifactsPanel({ artifacts, runId, isGenerating }: ArtifactsPanelProps) {
  const [activeTab, setActiveTab] = useState('product');

  const activeArtifact = artifacts.find(a => a.artifactType === activeTab);
  const isPreviewTab = activeTab === 'preview';
  const hasPreview = artifacts.some(a => a.artifactType === 'preview');
  const previewUrl = runId ? `/api/runs/${runId}/preview/static/index.html` : undefined;

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
              className={`
                flex items-center gap-2 px-6 py-4 font-display text-sm tracking-widest uppercase transition-all
                ${isActive ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
                ${!hasContent && !isActive && 'opacity-30'}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      <div className="flex-1 p-6 bg-black/20 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isPreviewTab && hasPreview && previewUrl ? (
            <motion.div
              key="preview-iframe"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full min-h-[500px]"
            >
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[500px] rounded-lg border border-white/10"
                sandbox="allow-scripts allow-forms"
                title="Landing Page Preview"
                style={{ background: '#fff' }}
              />
            </motion.div>
          ) : activeArtifact && !isPreviewTab ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="prose prose-invert max-w-none font-mono text-sm leading-relaxed overflow-auto max-h-[600px]"
            >
              {activeArtifact.contentText?.split('\n').map((line: string, i: number) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-display text-white mb-4 mt-6">{line.substring(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-display text-white/90 mb-3 mt-5">{line.substring(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-display text-white/80 mb-2 mt-4">{line.substring(4)}</h3>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 text-white/70 mb-1">{line.substring(2)}</li>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-white/90 font-bold mb-2">{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('|')) return <p key={i} className="text-white/60 font-mono text-xs mb-0.5 whitespace-pre">{line}</p>;
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
              {isGenerating ? (
                <>
                  <Loader2 className="w-12 h-12 mb-4 opacity-40 animate-spin" />
                  <p>GENERATING ARTIFACTS...</p>
                  <p className="text-xs mt-2 text-white/10">Workers are producing deliverables</p>
                </>
              ) : (
                <>
                  <Monitor className="w-12 h-12 mb-4 opacity-20" />
                  <p>AWAITING ARTIFACT GENERATION</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
