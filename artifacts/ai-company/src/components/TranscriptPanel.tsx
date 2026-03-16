import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranscriptMessage } from "@workspace/api-client-react";
import { AGENT_PROFILES } from "@/data/agents";
import { format } from "date-fns";

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
}

export function TranscriptPanel({ messages }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[500px] lg:h-[600px] bg-black/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <h2 className="font-display text-sm tracking-widest font-bold text-white/80">TERMINAL_OUTPUT</h2>
        </div>
        <div className="text-xs font-mono text-white/30">
          LOGS: {messages.length} // ENCRYPTED
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="h-full flex items-center justify-center text-white/20 font-mono text-sm"
            >
              &gt; STANDBY FOR SYSTEM INITIALIZATION...
            </motion.div>
          ) : (
            messages.map((msg) => {
              const profile = AGENT_PROFILES[msg.agentKey as keyof typeof AGENT_PROFILES] || AGENT_PROFILES.system;
              const isSystem = msg.roleType === 'system';
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.4 }}
                  className={`flex flex-col gap-1 ${isSystem ? 'items-center text-center my-8' : 'items-start'}`}
                >
                  {!isSystem && (
                    <div className="flex items-center gap-2 font-mono text-xs mb-1">
                      <span className={`${profile.text} font-bold`}>{profile.name}</span>
                      <span className="text-white/20">|</span>
                      <span className="text-white/40">
                        {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm:ss.SSS') : '00:00:00.000'}
                      </span>
                    </div>
                  )}
                  
                  <div className={`
                    relative p-4 rounded-lg font-mono text-sm leading-relaxed max-w-[90%]
                    ${isSystem ? 
                      'bg-white/5 border border-white/10 text-white/60 text-xs tracking-widest uppercase' : 
                      `bg-white/5 border-l-2 ${profile.border} text-white/90`
                    }
                  `}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      
      {/* Decorative scanline overlaid on terminal */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
    </div>
  );
}
