import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileWizard } from '../components/profile/ProfileWizard';
import { useAppStore } from '../store/useAppStore';

describe('ProfileWizard', () => {
  beforeEach(() => {
    useAppStore.setState({ profile: null, activeStep: 'profile' });
  });

  it('validates and advances through steps', () => {
    render(<ProfileWizard />);
    
    // Step 1: Interests
    expect(screen.getByText('What are your interests?')).toBeInTheDocument();
    
    // Cannot advance without selection
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Please select at least one interest.')).toBeInTheDocument();
    
    // Select an interest
    fireEvent.click(screen.getByText('History'));
    fireEvent.click(screen.getByText('Next'));
    
    // Step 2: Budget
    expect(screen.getByText('Budget & Style')).toBeInTheDocument();
    
    // Cannot advance without budget
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Please enter a valid budget amount.')).toBeInTheDocument();
    
    const budgetInput = screen.getByPlaceholderText('e.g. 2000');
    fireEvent.change(budgetInput, { target: { value: '1500' } });
    fireEvent.click(screen.getByText('Comfort'));
    fireEvent.click(screen.getByText('Next'));
    
    // Step 3: Dates & Pace
    expect(screen.getByText('When & How')).toBeInTheDocument();
    
    // Step 4: Accessibility
    // Assuming Dates & Pace requires input too... 
    // We would fill dates, click Next, then get to step 4.
  });
});
