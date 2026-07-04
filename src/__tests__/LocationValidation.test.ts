import { describe, it, expect, vi } from 'vitest';
import { LocationValidationService } from '../../services/domain/LocationValidationService';
import type { IAIProvider } from '../../services/ai/IAIProvider';
import type { LocationValidation } from '../../schemas/location';
import { z } from 'zod';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockProvider(result: LocationValidation): IAIProvider {
  return {
    generateStructured: vi.fn().mockResolvedValue(result),
    generateStream: vi.fn(),
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('LocationValidationService', () => {
  it('returns valid:true with high confidence for a real city/state pair', async () => {
    const provider = mockProvider({ valid: true, confidence: 'high' });
    const svc = new LocationValidationService(provider);
    const result = await svc.validate('India', 'Rajasthan', 'Jaipur');
    expect(result.valid).toBe(true);
    expect(result.confidence).toBe('high');
  });

  it('returns valid:false for a city in the wrong state', async () => {
    const provider = mockProvider({
      valid: false,
      confidence: 'high',
      correctedState: 'Maharashtra',
      reason: 'Mumbai belongs to Maharashtra, not Rajasthan',
    });
    const svc = new LocationValidationService(provider);
    const result = await svc.validate('India', 'Rajasthan', 'Mumbai');
    expect(result.valid).toBe(false);
    expect(result.correctedState).toBe('Maharashtra');
    expect(result.reason).toBeDefined();
  });

  it('returns valid:false with a reason for a fictional city', async () => {
    const provider = mockProvider({
      valid: false,
      confidence: 'high',
      reason: 'No city by this name exists in India',
    });
    const svc = new LocationValidationService(provider);
    const result = await svc.validate('India', 'Karnataka', 'FictionalCity123');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('returns correctedCity suggestion for a misspelled city', async () => {
    const provider = mockProvider({
      valid: true,
      confidence: 'medium',
      correctedCity: 'Bengaluru',
    });
    const svc = new LocationValidationService(provider);
    const result = await svc.validate('India', 'Karnataka', 'Bengalure');
    expect(result.correctedCity).toBe('Bengaluru');
  });

  it('calls the AI provider with a prompt containing the city, state and country', async () => {
    const provider = mockProvider({ valid: true, confidence: 'high' });
    const svc = new LocationValidationService(provider);
    await svc.validate('India', 'Tamil Nadu', 'Chennai');
    expect(provider.generateStructured).toHaveBeenCalledWith(
      expect.stringContaining('Chennai'),
      expect.anything(),
      expect.any(String),
    );
  });
});

// ─── Schema Tests ──────────────────────────────────────────────────────────

describe('LocationValidationSchema', () => {
  it('parses a minimal valid response', async () => {
    const { LocationValidationSchema } = await import('../../schemas/location');
    const result = LocationValidationSchema.safeParse({ valid: true, confidence: 'high' });
    expect(result.success).toBe(true);
  });

  it('parses a full response with optional fields', async () => {
    const { LocationValidationSchema } = await import('../../schemas/location');
    const result = LocationValidationSchema.safeParse({
      valid: false,
      confidence: 'medium',
      correctedCity: 'Kolkata',
      correctedState: 'West Bengal',
      reason: 'Common alternate spelling',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid confidence values', async () => {
    const { LocationValidationSchema } = await import('../../schemas/location');
    const result = LocationValidationSchema.safeParse({ valid: true, confidence: 'super' });
    expect(result.success).toBe(false);
  });
});
