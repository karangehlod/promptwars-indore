import { useState, useCallback } from 'react';
import { AgentError } from '../services/ai/AgentError';

export function useAgent<TArgs extends any[], TResult>(
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
      } catch (err: any) {
        if (err instanceof AgentError) {
          setError(err);
        } else {
          setError(new AgentError(err.message || 'Unknown error occurred'));
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
