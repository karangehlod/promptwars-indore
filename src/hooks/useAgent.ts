import { useState, useCallback } from 'react';
import { AgentError } from '../services/ai/AgentError';

export function useAgent<TArgs extends unknown[], TResult>(
  agentFn: (...args: TArgs) => Promise<TResult>
) {
  const [data, setData] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AgentError | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await agentFn(...args);
        setData(result);
        return result;
      } catch (err) {
        if (err instanceof AgentError) {
          setError(err);
        } else {
          const message = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(new AgentError(message));
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [agentFn]
  );

  return { data, loading, error, execute, setData };
}
