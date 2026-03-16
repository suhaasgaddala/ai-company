import { useState, useCallback, useRef, useEffect } from 'react';
import { MOCK_RUN, MOCK_SEQUENCE, MOCK_ARTIFACTS } from '@/data/mock-data';
import type { TranscriptMessage, Run, Artifact } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useSimulation() {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [run, setRun] = useState<Run | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const startRun = useCallback(async (keywords: string) => {
    setStatus('running');
    setMessages([]);
    setArtifacts([]);
    
    let realRunId: string | null = null;
    try {
      const res = await fetch(`/api/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userKeywords: keywords })
      });
      if (res.ok) {
        const data = await res.json();
        realRunId = data.id;
      }
    } catch {
      // API call failed, continue with simulation
    }

    const newRun = { ...MOCK_RUN, id: realRunId || MOCK_RUN.id, userKeywords: keywords, status: 'active', phase: 'founder' };
    setRun(newRun);

    let accumulatedTime = 0;
    
    MOCK_SEQUENCE.forEach((msg, index) => {
      const delay = msg.roleType === 'system' ? 1000 : 2500 + Math.random() * 2000;
      accumulatedTime += delay;
      
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { ...msg, runId: newRun.id, createdAt: new Date().toISOString() }]);
        
        if (msg.phase === 'workers' && msg.roleType === 'system') {
          setRun(r => r ? { ...r, phase: 'worker' } : r);
        }
        
        if (index === MOCK_SEQUENCE.length - 1) {
          setStatus('completed');
          setRun(r => r ? { ...r, status: 'completed', companyName: 'NexaHealth AI', companyTagline: 'AI-Powered Healthcare Analytics for Better Patient Outcomes' } : r);
          setArtifacts(MOCK_ARTIFACTS);
        }
      }, accumulatedTime);
      
      timerRefs.current.push(timer);
    });
    
  }, [clearTimers]);

  const resetRun = useCallback(() => {
    clearTimers();
    setStatus('idle');
    setRun(null);
    setMessages([]);
    setArtifacts([]);
  }, [clearTimers]);

  return {
    status,
    run,
    messages,
    artifacts,
    startRun,
    resetRun
  };
}
