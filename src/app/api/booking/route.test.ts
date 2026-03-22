import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { fetchSanityData } from '@/lib/sanity/client';

// 1. Mock Sanity Data Fetching
vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

// 2. Mock Resend (Class-based mock to satisfy constructor requirement)
vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null }),
      };
    },
  };
});

// 3. Mock Global Fetch (for Turnstile)
global.fetch = vi.fn();

describe('POST /api/booking', () => {
  const validPayload = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    categoryId: 'mock-category',
    packageId: 'Pack 1',
    addOnIds: ['Addon A'],
    date: '2025-01-01T10:00:00Z',
    notes: 'Hello MGZ',
    token: 'valid-token',
  };

  const mockCategoryData = {
    name: 'Photography',
    packages: [{ name: 'Pack 1', price: 100 }],
    addOns: [{ name: 'Addon A', price: 50 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default success for Turnstile
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    // Default success for Sanity
    vi.mocked(fetchSanityData).mockResolvedValue(mockCategoryData);
  });

  it('should return 200 and success details for valid request', async () => {
    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('email-id');
  });

  it('should return 400 if Turnstile verification fails', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    });

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid Turnstile Token');
  });

  it('should return 400 if category is invalid', async () => {
    vi.mocked(fetchSanityData).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid Category ID');
  });

  it('should handle runtime errors with 500', async () => {
    vi.mocked(fetchSanityData).mockRejectedValue(new Error('Sanity down'));

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
