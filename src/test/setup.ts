import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDestinationStore } from '@/store/destinations'; // Adjust path

describe('Destination Store', () => {
  beforeEach(() => {
    // Clear store before each test
    useDestinationStore.setState({ destinations: [] });
  });

  it('should add destination to store', () => {
    const { result } = renderHook(() => useDestinationStore());

    act(() => {
      result.current.addDestination({
        id: '1',
        name: 'Tokyo',
        cost: 1500,
        duration: 5,
        score: 9.5,
      });
    });

    expect(result.current.destinations).toHaveLength(1);
    expect(result.current.destinations[0].name).toBe('Tokyo');
  });

  it('should filter destinations by budget', () => {
    const { result } = renderHook(() => useDestinationStore());

    act(() => {
      result.current.addDestination({ id: '1', name: 'Tokyo', cost: 2000 });
      result.current.addDestination({ id: '2', name: 'Bangkok', cost: 500 });
    });

    const filtered = result.current.destinations.filter(d => d.cost <= 1000);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Bangkok');
  });
});

describe('API Rate Limiting', () => {
  it('should queue requests during rate limit', async () => {
    const mockApi = vi.fn().mockRejectedValueOnce({ status: 429 });
    
    // Simulate retry logic
    let attempts = 0;
    while (attempts < 3) {
      try {
        await mockApi();
        break;
      } catch (e: any) {
        if (e.status === 429) {
          attempts++;
          await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempts))); // Exponential backoff
        }
      }
    }

    expect(attempts).toBeGreaterThan(0);
  });
});
