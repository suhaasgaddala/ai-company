import { useState, useCallback, useRef, useEffect } from 'react';
import type { TranscriptMessage, Run, Artifact } from "@workspace/api-client-react";

export function useSimulation() {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [run, setRun] = useState<Run | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const activeRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);

  const stopPolling = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const pollData = useCallback((runId: string) => {
    activeRef.current = true;
    errorCountRef.current = 0;

    const poll = async () => {
      if (!activeRef.current) return;

      try {
        const [runRes, transcriptRes] = await Promise.all([
          fetch(`/api/runs/${runId}`),
          fetch(`/api/runs/${runId}/transcript`),
        ]);

        if (!activeRef.current) return;

        if (runRes.ok) {
          errorCountRef.current = 0;
          const runData: Run = await runRes.json();
          setRun(runData);

          if (runData.status === 'completed' || runData.phase === 'founders_complete') {
            setStatus('completed');
            stopPolling();
            const artRes = await fetch(`/api/runs/${runId}/artifacts`);
            if (artRes.ok) {
              setArtifacts(await artRes.json());
            }
            return;
          } else if (runData.status === 'error') {
            setStatus('error');
            stopPolling();
            return;
          }
        } else {
          errorCountRef.current++;
          if (errorCountRef.current > 10) {
            setStatus('error');
            stopPolling();
            return;
          }
        }

        if (transcriptRes.ok) {
          const msgs: TranscriptMessage[] = await transcriptRes.json();
          setMessages(msgs);
        }
      } catch {
        errorCountRef.current++;
        if (errorCountRef.current > 10) {
          setStatus('error');
          stopPolling();
          return;
        }
      }

      if (activeRef.current) {
        timerRef.current = setTimeout(poll, 2000);
      }
    };

    poll();
  }, [stopPolling]);

  const startRun = useCallback(async (keywords: string) => {
    setStatus('running');
    setMessages([]);
    setArtifacts([]);
    setRun(null);

    try {
      const createRes = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userKeywords: keywords }),
      });

      if (!createRes.ok) throw new Error('Failed to create run');
      const newRun: Run = await createRes.json();
      setRun(newRun);

      const startRes = await fetch(`/api/runs/${newRun.id}/founders/start`, {
        method: 'POST',
      });

      if (!startRes.ok) throw new Error('Failed to start founder debate');

      pollData(newRun.id);
    } catch (err) {
      console.error('Start run error:', err);
      setStatus('error');
    }
  }, [pollData]);

  const resetRun = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setRun(null);
    setMessages([]);
    setArtifacts([]);
  }, [stopPolling]);

  return {
    status,
    run,
    messages,
    artifacts,
    startRun,
    resetRun,
  };
}
