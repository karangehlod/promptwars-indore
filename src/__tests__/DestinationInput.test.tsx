import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DestinationInput } from '../components/destination/DestinationInput';
import { useAppStore } from '../store/useAppStore';

// Mock the agent facade
const mockValidate = vi.fn();
vi.mock('../../services/AgentFacade', () => ({
  agent: {
    location: {
      validate: (...args: any[]) => mockValidate(...args),
    },
  },
}));

describe('DestinationInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset store to initial state with profile
    useAppStore.setState({
      profile: { 
        dates: { start: '2024-12-01', end: '2024-12-07' },
        budget: { level: 'moderate', amount: 20000 },
        interests: ['culture'],
        pace: 'moderate',
        dietary: [],
        accessibility: [],
      },
      destination: null,
      validatedLocations: {},
      activeStep: 'destination',
      hasStarted: true,
    });
  });

  it('renders without date pickers', () => {
    render(<DestinationInput />);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(0);
  });

  it('shows trip dates from profile (single source of truth)', () => {
    render(<DestinationInput />);
    expect(screen.getByText(/2024-12-01 → 2024-12-07/)).toBeDefined();
  });

  it('has "Explore Destination" button disabled until location is validated', () => {
    render(<DestinationInput />);
    const proceedBtn = screen.getByText('Explore Destination →');
    expect(proceedBtn).toBeDefined();
    expect((proceedBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows "Verify Location" button when city and state are filled', async () => {
    render(<DestinationInput />);
    const stateSelect = screen.getByText('Select State').closest('select')!;
    fireEvent.change(stateSelect, { target: { value: 'Rajasthan' } });
    const cityInput = document.querySelector('input[type="text"]:not([disabled])')!;
    fireEvent.change(cityInput, { target: { value: 'Jaipur' } });
    expect(screen.getByText('Verify Location')).toBeDefined();
  });
});
