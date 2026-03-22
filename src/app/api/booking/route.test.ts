import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { fetchSanityData } from '@/lib/sanity/client';

vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null }),
      };
    },
  };
});

global.fetch = vi.fn();

describe('POST /api/booking', () => {
  const validPayload = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    items: [
      {
        categoryId: 'wedding-photography',
        packageId: 'wedding-photo-bronze',
        addOnIds: ['photo-addon'],
      },
      {
        categoryId: 'wedding-videography',
        packageId: 'wedding-video-basic',
        addOnIds: ['video-addon'],
      },
    ],
    date: '2025-01-01T10:00:00Z',
    notes: 'Hello MGZ',
    token: 'valid-token',
  };

  const mockCategories = [
    {
      id: 'wedding-photography',
      name: 'Wedding Photography',
      shortName: 'Wedding Photo',
      description: 'Photo coverage',
      image: null,
      packages: [{ id: 'wedding-photo-bronze', name: 'Bronze', price: 500 }],
      addOns: [{ id: 'photo-addon', name: 'Extra Album', price: 50 }],
    },
    {
      id: 'wedding-videography',
      name: 'Wedding Videography',
      shortName: 'Wedding Video',
      description: 'Video coverage',
      image: null,
      packages: [{ id: 'wedding-video-basic', name: 'Basic', price: 600 }],
      addOns: [{ id: 'video-addon', name: 'Drone', price: 150 }],
    },
  ];

  const mockCombinations = [
    {
      id: 'wedding',
      name: 'Wedding',
      categoryIds: ['wedding-photography', 'wedding-videography'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('should return 200 and success details for valid request', async () => {
    vi.mocked(fetchSanityData)
      .mockResolvedValueOnce(mockCategories)
      .mockResolvedValueOnce(mockCombinations);

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

  it('should return 400 if a category is invalid', async () => {
    vi.mocked(fetchSanityData)
      .mockResolvedValueOnce([mockCategories[0]])
      .mockResolvedValueOnce(mockCombinations);

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('One or more categories are invalid.');
  });

  it('should return 400 if categories are incompatible', async () => {
    vi.mocked(fetchSanityData)
      .mockResolvedValueOnce(mockCategories)
      .mockResolvedValueOnce([]);

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('The selected categories cannot be booked together.');
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
