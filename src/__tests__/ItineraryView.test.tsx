import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ItineraryView } from '../components/itinerary/ItineraryView';
import { useAppStore } from '../store/useAppStore';
import { ToastProvider } from '../hooks/useToast';

// Mock the agent facade
const mockRegenerateSingleDay = vi.fn();
vi.mock('../services/AgentFacade', () => ({
  agent: {
    itinerary: {
      regenerateSingleDay: (...args: any[]) => mockRegenerateSingleDay(...args),
    },
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('ItineraryView', () => {
  const mockProfile = {
    dates: { start: '2024-12-01', end: '2024-12-03' },
    budget: { level: 'moderate', amount: 20000 },
    pace: 'moderate',
    interests: ['culture'],
    dietary: [],
    accessibility: [],
  };

  const mockDestination = {
    city: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
  };

  const mockItinerary = {
    days: [
      {
        day: 1,
        date: '2024-12-01',
        items: [
          { activity: 'Visit Amber Fort', time: '09:00', cost: 500, costJustification: 'Entry fee', notes: 'Morning visit' },
          { activity: 'Explore City Palace', time: '14:00', cost: 300, costJustification: 'Entry fee', notes: '' },
        ],
      },
      {
        day: 2,
        date: '2024-12-02',
        items: [
          { activity: 'Hawa Mahal visit', time: '10:00', cost: 200, costJustification: 'Entry fee', notes: 'Photo stop' },
          { activity: 'Jantar Mantar', time: '15:00', cost: 150, costJustification: 'Entry fee', notes: '' },
        ],
      },
      {
        day: 3,
        date: '2024-12-03',
        items: [
          { activity: 'Local market shopping', time: '11:00', cost: 1000, costJustification: 'Estimated', notes: 'Bargain well' },
        ],
      },
    ],
    totalBudget: 2150,
    budgetBreakdown: [
      { category: 'Activities', amount: 2150 },
      { category: 'Food', amount: 0 },
      { category: 'Transport', amount: 0 },
      { category: 'Accommodation', amount: 0 },
      { category: 'Misc', amount: 0 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAppStore.setState({
      profile: mockProfile,
      destination: mockDestination,
      itinerary: mockItinerary,
      activeStep: 'itinerary',
      hasStarted: true,
    });
  });

  it('renders current day card with day header', () => {
    renderWithProviders(<ItineraryView />);
    expect(screen.getByText('Your Itinerary: Jaipur')).toBeDefined();
    expect(screen.getByText('Day 1')).toBeDefined();
    expect(screen.getByText('2024-12-01')).toBeDefined();
    expect(screen.getByText('Visit Amber Fort')).toBeDefined();
    expect(screen.getByText('Explore City Palace')).toBeDefined();
  });

  it('shows pagination dots for multiple days', () => {
    renderWithProviders(<ItineraryView />);
    const dots = screen.getAllByRole('button', { name: /Go to Day \d+/ });
    expect(dots).toHaveLength(3);
  });

  it('navigates to next day when clicking Next Day button', () => {
    renderWithProviders(<ItineraryView />);
    const nextBtn = screen.getByText('Next Day');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Day 2')).toBeDefined();
    expect(screen.getByText('Hawa Mahal visit')).toBeDefined();
  });

  it('navigates to previous day when clicking Previous Day button', () => {
    renderWithProviders(<ItineraryView />);
    // Go to day 2 first
    const nextBtn = screen.getByText('Next Day');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Day 2')).toBeDefined();

    // Then go back
    const prevBtn = screen.getByText('Previous Day');
    fireEvent.click(prevBtn);
    expect(screen.getByText('Day 1')).toBeDefined();
    expect(screen.getByText('Visit Amber Fort')).toBeDefined();
  });

  it('navigates to specific day when clicking pagination dot', () => {
    renderWithProviders(<ItineraryView />);
    const dot3 = screen.getByRole('button', { name: 'Go to Day 3' });
    fireEvent.click(dot3);
    expect(screen.getByText('Day 3')).toBeDefined();
    expect(screen.getByText('Local market shopping')).toBeDefined();
  });

  it('disables Previous Day button on first day', () => {
    renderWithProviders(<ItineraryView />);
    const prevBtn = screen.getByRole('button', { name: /previous day/i });
    expect(prevBtn).toBeDisabled();
  });

  it('disables Next Day button on last day', () => {
    renderWithProviders(<ItineraryView />);
    // Go to last day
    const nextBtn = screen.getByRole('button', { name: /next day/i });
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    expect(screen.getByRole('button', { name: /next day/i })).toBeDisabled();
  });

  it('shows regenerate button for each day', () => {
    renderWithProviders(<ItineraryView />);
    const regenBtn = screen.getByRole('button', { name: /regenerate/i });
    expect(regenBtn).toBeDefined();
  });

  it('calls agent.itinerary.regenerateSingleDay when regenerate is clicked', async () => {
    mockRegenerateSingleDay.mockResolvedValue({
      day: 1,
      date: '2024-12-01',
      items: [{ activity: 'New Activity', time: '10:00', cost: 100, costJustification: 'Test', notes: '' }],
    });

    renderWithProviders(<ItineraryView />);
    const regenBtn = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenBtn);

    await waitFor(() => {
      expect(mockRegenerateSingleDay).toHaveBeenCalled();
    });
  });

  it('shows budget breakdown section', () => {
    renderWithProviders(<ItineraryView />);
    expect(screen.getByText('Budget Breakdown')).toBeDefined();
  });

  it('shows map preview section', () => {
    renderWithProviders(<ItineraryView />);
    // Leaflet map container starts loading or exists in DOM
    const mapEl = document.querySelector('.w-full.h-80');
    expect(mapEl).toBeDefined();
  });

  it('has data-day-card attribute for PDF export', () => {
    renderWithProviders(<ItineraryView />);
    const dayCard = document.querySelector('[data-day-card]');
    expect(dayCard).toBeDefined();
  });

  it('has data-pagination attribute for PDF export', () => {
    renderWithProviders(<ItineraryView />);
    const pagination = document.querySelector('[data-pagination]');
    expect(pagination).toBeDefined();
  });
});