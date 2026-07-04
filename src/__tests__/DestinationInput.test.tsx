import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DestinationInput } from '../../components/destination/DestinationInput';

// Mock the store
const mockStore: any = {
  profile: { 
    dates: { start: '2024-12-01', end: '2024-12-07' },
    budget: { level: 'moderate', amount: 20000 },
    interests: ['culture'],
    pace: 'moderate',
    dietary: [],
    accessibility: [],
  },
  setDestination: vi.fn(),
  setActiveStep: vi.fn(),
  validatedLocations: {},
  cacheValidatedLocation: vi.fn(),
};

vi.mock('../../store/useAppStore', () => ({
  useAppStore: (selector: (s: any) => any) => selector(mockStore),
}));

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
    mockStore.validatedLocations = {};
    mockStore.setDestination = vi.fn();
    mockStore.setActiveStep = vi.fn();
    mockStore.cacheValidatedLocation = vi.fn();
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
    // It should be disabled since no validation yet
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

  it('blocks submit and shows correction chip when validation returns invalid with correction', async () => {
    mockValidate.mockResolvedValue({
      valid: false,
      confidence: 'high',
      correctedState: 'Maharashtra',
      reason: 'Mumbai is in Maharashtra, not Rajasthan',
    });

    render(<DestinationInput />);
    const stateSelect = screen.getByText('Select State').closest('select')!;
    fireEvent.change(stateSelect, { target: { value: 'Rajasthan' } });
    const cityInput = document.querySelector('input[type="text"]:not([disabled])')!;
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });

    fireEvent.click(screen.getByText('Verify Location'));

    await waitFor(() => {
      expect(screen.getByText(/couldn't confirm/i)).toBeDefined();
    });

    // Proceed button still disabled
    const proceedBtn = screen.getByText('Explore Destination →');
    expect((proceedBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables proceed only after valid:true + high confidence', async () => {
    mockValidate.mockResolvedValue({ valid: true, confidence: 'high' });

    render(<DestinationInput />);
    const stateSelect = screen.getByText('Select State').closest('select')!;
    fireEvent.change(stateSelect, { target: { value: 'Rajasthan' } });
    const cityInput = document.querySelector('input[type="text"]:not([disabled])')!;
    fireEvent.change(cityInput, { target: { value: 'Jaipur' } });
    fireEvent.click(screen.getByText('Verify Location'));

    await waitFor(() => {
      expect(screen.queryByText('Verify Location')).toBeNull(); // hidden after valid
    });
    const proceedBtn = screen.getByText('Explore Destination →');
    expect((proceedBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('uses cache and skips AI call on repeated submission of same location', async () => {
    mockStore.validatedLocations = { 'India|Rajasthan|jaipur': true };
    mockValidate.mockResolvedValue({ valid: true, confidence: 'high' });

    render(<DestinationInput />);
    const stateSelect = screen.getByText('Select State').closest('select')!;
    fireEvent.change(stateSelect, { target: { value: 'Rajasthan' } });
    const cityInput = document.querySelector('input[type="text"]:not([disabled])')!;
    fireEvent.change(cityInput, { target: { value: 'Jaipur' } });

    // Should show Proceed immediately from cache, not call AI
    expect(screen.queryByText('Verify Location')).toBeNull();
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('correction chip updates the city/state fields but does NOT auto-proceed', async () => {
    mockValidate.mockResolvedValue({
      valid: false,
      confidence: 'high',
      correctedCity: 'Pune',
      correctedState: 'Maharashtra',
      reason: 'Test',
    });

    render(<DestinationInput />);
    const stateSelect = screen.getByText('Select State').closest('select')!;
    fireEvent.change(stateSelect, { target: { value: 'Rajasthan' } });
    const cityInput = document.querySelector('input[type="text"]:not([disabled])')!;
    fireEvent.change(cityInput, { target: { value: 'Pone' } });
    fireEvent.click(screen.getByText('Verify Location'));

    await waitFor(() => screen.getByText(/Did you mean Pune/i));

    const correctionBtn = screen.getByText(/Did you mean Pune/i);
    fireEvent.click(correctionBtn);

    // Correction applied, but proceed still disabled (requires re-validation)
    await waitFor(() => {
      const proceedBtn = screen.getByText('Explore Destination →');
      expect((proceedBtn as HTMLButtonElement).disabled).toBe(true);
    });
    expect(mockStore.setActiveStep).not.toHaveBeenCalled();
  });
});
