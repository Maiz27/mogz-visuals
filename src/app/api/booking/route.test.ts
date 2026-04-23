import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { fetchSanityDataUncached } from '@/lib/sanity/client';
import { enforceRateLimitRules } from '@/lib/server/rateLimit';

vi.mock('@/lib/sanity/client', () => ({
  fetchSanityDataUncached: vi.fn(),
}));

vi.mock('@/lib/server/rateLimit', () => ({
  enforceRateLimitRules: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
  getRateLimitHeaders: vi.fn(() => ({ 'Retry-After': '60' })),
  hashRateLimitValue: vi.fn((value: string) => `hash:${value}`),
  normalizeRateLimitEmail: vi.fn((value: string) => value.trim().toLowerCase()),
  normalizeRateLimitPhone: vi.fn((value: string) => value.replace(/\D+/g, '')),
  parseRateLimitNumber: vi.fn((_value: string | undefined, fallback: number) => fallback),
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
    date: '2099-01-01T10:00',
    notes: 'Hello MGZ',
    termsAccepted: true,
    token: 'valid-token',
    timeZone: 'Africa/Juba',
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
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: true,
      enabled: false,
    });

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('should return 200 and success details for valid request', async () => {
    vi.mocked(fetchSanityDataUncached)
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
    expect(enforceRateLimitRules).toHaveBeenCalledTimes(1);
  });

  it('should return 429 when booking is rate limited', async () => {
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: false,
      message: 'Too many booking attempts. Please try again later.',
      retryAfterSeconds: 60,
    });

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.message).toBe('Too many booking attempts. Please try again later.');
  });

  it('should return 429 when booking identity or duplicate limits block a verified request', async () => {
    vi.mocked(enforceRateLimitRules)
      .mockResolvedValueOnce({
        ok: true,
        enabled: false,
      })
      .mockResolvedValueOnce({
        ok: false,
        message:
          'We recently received several booking attempts with these contact details. Please wait before trying again.',
        retryAfterSeconds: 60,
      });

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.message).toBe(
      'We recently received several booking attempts with these contact details. Please wait before trying again.',
    );
    expect(enforceRateLimitRules).toHaveBeenCalledTimes(2);
  });

  it('should return 400 if a category is invalid', async () => {
    vi.mocked(fetchSanityDataUncached)
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
    vi.mocked(fetchSanityDataUncached)
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
    vi.mocked(fetchSanityDataUncached).mockRejectedValue(new Error('Sanity down'));

    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
  });

  it('should return 400 if terms are not accepted', async () => {
    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({ ...validPayload, termsAccepted: false }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Please agree to the terms to continue.');
  });

  it('should return 400 for invalid contact details', async () => {
    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        email: 'invalid-email',
        phone: '',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Please enter a valid email address.');
  });

  it('should return 400 for invalid local date values', async () => {
    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({ ...validPayload, date: 'not-a-date' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Choose a valid date and time.');
  });

  it('should return 400 when time zone is missing', async () => {
    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({ ...validPayload, timeZone: '' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe(
      'We could not confirm your local time. Refresh the page and try again.',
    );
  });

  it('should return 400 for malformed booking items', async () => {
    const req = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        items: [
          {
            categoryId: 'wedding-photography',
            packageId: 'wedding-photo-bronze',
            addOnIds: 'photo-addon',
          },
        ],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Please review your selected services and try again.');
  });
});
