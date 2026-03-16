import { useState, useCallback, useRef, useEffect } from 'react';
import type { TranscriptMessage, Run, Artifact } from "@workspace/api-client-react";

export type SimulationPhase = 'idle' | 'founders_running' | 'founders_complete' | 'workers_running' | 'completed' | 'error';

export function useSimulation() {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [phase, setPhase] = useState<SimulationPhase>('idle');
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

  const fetchArtifacts = useCallback(async (runId: string) => {
    try {
      const artRes = await fetch(`/api/runs/${runId}/artifacts`);
      if (artRes.ok) {
        setArtifacts(await artRes.json());
      }
    } catch {
      // ignore
    }
  }, []);

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

          if (runData.phase === 'founders_complete' && runData.status === 'completed') {
            setPhase('founders_complete');
            setStatus('running');
            await fetchArtifacts(runId);
          } else if (runData.phase === 'workers' && runData.status === 'running') {
            setPhase('workers_running');
            setStatus('running');
            await fetchArtifacts(runId);
          } else if (runData.phase === 'complete' && runData.status === 'completed') {
            setPhase('completed');
            setStatus('completed');
            stopPolling();
            await fetchArtifacts(runId);
            return;
          } else if (runData.status === 'error') {
            setPhase('error');
            setStatus('error');
            stopPolling();
            await fetchArtifacts(runId);
            return;
          } else if (runData.status === 'running') {
            if (runData.phase?.startsWith('founders')) {
              setPhase('founders_running');
            } else if (runData.phase === 'workers') {
              setPhase('workers_running');
            }
            setStatus('running');
          }
        } else {
          errorCountRef.current++;
          if (errorCountRef.current > 10) {
            setStatus('error');
            setPhase('error');
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
          setPhase('error');
          stopPolling();
          return;
        }
      }

      if (activeRef.current) {
        timerRef.current = setTimeout(poll, 2000);
      }
    };

    poll();
  }, [stopPolling, fetchArtifacts]);

  const startWorkers = useCallback(async () => {
    if (!run) return;

    try {
      setPhase('workers_running');
      setStatus('running');

      const startRes = await fetch(`/api/runs/${run.id}/workers/start`, {
        method: 'POST',
      });

      if (!startRes.ok) {
        const err: Record<string, string> = await startRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to start workers');
      }

      stopPolling();
      pollData(run.id);
    } catch (err) {
      console.error('Start workers error:', err);
      setStatus('error');
      setPhase('error');
    }
  }, [run, pollData, stopPolling]);

  const startRun = useCallback(async (keywords: string) => {
    setStatus('running');
    setPhase('founders_running');
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
      setPhase('error');
    }
  }, [pollData]);

  const resetRun = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setPhase('idle');
    setRun(null);
    setMessages([]);
    setArtifacts([]);
  }, [stopPolling]);

  return {
    status,
    phase,
    run,
    messages,
    artifacts,
    startRun,
    startWorkers,
    resetRun,
  };
}
