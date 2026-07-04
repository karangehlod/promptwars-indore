import { useState, useCallback } from 'react';
import type { AgentError, Result } from '../schemas/common';

export function useAsyncAction<T, Args extends any[]>(
  action: (...args: Args) => Promise<Result<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AgentError | null>(null);

  const execute = useCallback(async (...args: Args) => {
    setLoading(true);
    setError(null);
    
    const result = await action(...args);
    
    if (result.success) {
      setData(result.data);
      setLoading(false);
      return result.data;
    } else {
      setError(result.error);
      setLoading(false);
      return null;
    }
  }, [action]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, data, loading, error, reset };
}
