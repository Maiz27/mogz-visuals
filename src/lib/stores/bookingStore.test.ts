import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useBookingStore } from './bookingStore';

describe('useBookingStore', () => {
  const getActions = () => useBookingStore.getState();
  const getState = () => useBookingStore.getState();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    getState().reset();
    vi.clearAllMocks();

    const mockStorage: Record<string, string> = {};
    global.sessionStorage = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {}),
      length: 0,
      key: vi.fn(),
    } as any;
  });

  afterEach(() => {
    getState().reset();
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const state = getState();
    expect(state.step).toBe(1);
    expect(state.selections).toEqual([]);
    expect(state.name).toBe('');
  });

  it('should transition steps correctly', () => {
    getActions().nextStep();
    expect(getState().step).toBe(2);
    getActions().nextStep();
    expect(getState().step).toBe(3);
    getActions().prevStep();
    expect(getState().step).toBe(2);
  });

  it('should clear selected services when going back from packages', () => {
    useBookingStore.setState({
      step: 2,
      selections: [{ categoryId: 'cat-a', packageId: 'pkg-a', addOnIds: [] }],
    });

    getActions().goBack();

    const state = getState();
    expect(state.step).toBe(1);
    expect(state.selections).toEqual([]);
  });

  it('should preserve add-ons when going back from add-ons', () => {
    useBookingStore.setState({
      step: 3,
      selections: [
        {
          categoryId: 'cat-a',
          packageId: 'pkg-a',
          addOnIds: ['addon-a'],
        },
      ],
    });

    getActions().goBack();

    const state = getState();
    expect(state.step).toBe(2);
    expect(state.selections).toEqual([
      { categoryId: 'cat-a', packageId: 'pkg-a', addOnIds: ['addon-a'] },
    ]);
  });

  it('should preserve scheduling fields when going back from scheduling', () => {
    useBookingStore.setState({
      step: 4,
      date: '2026-04-24T10:00',
      notes: 'Window light only',
    });

    getActions().goBack();

    const state = getState();
    expect(state.step).toBe(3);
    expect(state.date).toBe('2026-04-24T10:00');
    expect(state.notes).toBe('Window light only');
  });

  it('should preserve contact fields when going back from contact details', () => {
    useBookingStore.setState({
      step: 5,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+211900000000',
      termsAccepted: true,
      token: 'verified-token',
    });

    getActions().goBack();

    const state = getState();
    expect(state.step).toBe(4);
    expect(state.name).toBe('Jane Doe');
    expect(state.email).toBe('jane@example.com');
    expect(state.phone).toBe('+211900000000');
    expect(state.termsAccepted).toBe(true);
    expect(state.token).toBe('verified-token');
  });

  it('should toggle categories and reset scheduling fields', () => {
    useBookingStore.setState({
      step: 3,
      selections: [{ categoryId: 'cat-a', packageId: 'pkg-a', addOnIds: [] }],
      date: '2023-01-01T10:00:00Z',
      notes: 'Existing note',
    });

    getActions().toggleCategory('cat-b');

    const state = getState();
    expect(state.selections).toEqual([
      { categoryId: 'cat-a', packageId: 'pkg-a', addOnIds: [] },
      { categoryId: 'cat-b', packageId: null, addOnIds: [] },
    ]);
    expect(state.date).toBe('');
    expect(state.notes).toBe('');
  });

  it('should update package and toggle add-ons per category', () => {
    getActions().toggleCategory('cat-a');
    getActions().selectPackage('cat-a', 'pkg-standard');
    expect(getState().selections[0].packageId).toBe('pkg-standard');

    getActions().toggleAddOn('cat-a', 'addon-video');
    expect(getState().selections[0].addOnIds).toContain('addon-video');

    getActions().toggleAddOn('cat-a', 'addon-video');
    expect(getState().selections[0].addOnIds).not.toContain('addon-video');
  });

  it('should update fields (name, email, date)', () => {
    getActions().updateField('name', 'John Doe');
    getActions().updateField('email', 'john@example.com');
    getActions().updateField('date', '2024-10-10T12:00:00Z');

    const state = getState();
    expect(state.name).toBe('John Doe');
    expect(state.email).toBe('john@example.com');
    expect(state.date).toBe('2024-10-10T12:00:00Z');
  });

  it('should hydrate legacy single-category drafts into selections', () => {
    const draft = {
      step: 4,
      categoryId: 'real-estate-photo',
      packageName: 'pack1',
      addOnNames: ['add1'],
      name: 'Persisted User',
    };

    (sessionStorage.getItem as any).mockReturnValue(JSON.stringify(draft));

    getActions().hydrateFromStorage();

    const state = getState();
    expect(state.step).toBe(2);
    expect(state.selections).toEqual([
      {
        categoryId: 'real-estate-photography',
        packageId: null,
        addOnIds: [],
      },
    ]);
    expect(state.name).toBe('Persisted User');
  });

  it('should clear persisted token and clamp resumed step to contact details', () => {
    const draft = {
      step: 6,
      selections: [
        {
          categoryId: 'cat-a',
          packageId: 'pkg-a',
          addOnIds: [],
        },
      ],
      date: '2099-03-23T10:00',
      name: 'Persisted User',
      email: 'persisted@example.com',
      phone: '+211900000000',
      termsAccepted: true,
      token: 'stale-token',
    };

    (sessionStorage.getItem as any).mockReturnValue(JSON.stringify(draft));

    getActions().hydrateFromStorage();

    const state = getState();
    expect(state.step).toBe(5);
    expect(state.token).toBe('');
  });

  it('should clamp resumed step when required earlier data is missing', () => {
    const draft = {
      step: 6,
      selections: [{ categoryId: 'cat-a', packageId: null, addOnIds: [] }],
      date: '2099-03-23T10:00',
      name: 'Persisted User',
      email: 'persisted@example.com',
      phone: '+211900000000',
      termsAccepted: true,
      token: 'stale-token',
    };

    (sessionStorage.getItem as any).mockReturnValue(JSON.stringify(draft));

    getActions().hydrateFromStorage();

    const state = getState();
    expect(state.step).toBe(2);
    expect(state.token).toBe('');
  });

  it('should clamp resumed step when the stored date is no longer submittable', () => {
    const draft = {
      step: 6,
      selections: [
        {
          categoryId: 'cat-a',
          packageId: 'pkg-a',
          addOnIds: [],
        },
      ],
      date: '2026-01-01T12:00',
      name: 'Persisted User',
      email: 'persisted@example.com',
      phone: '+211900000000',
      termsAccepted: true,
      token: 'stale-token',
    };

    (sessionStorage.getItem as any).mockReturnValue(JSON.stringify(draft));

    getActions().hydrateFromStorage();

    const state = getState();
    expect(state.step).toBe(4);
    expect(state.token).toBe('');
  });

  it('should reset state correctly', () => {
    useBookingStore.setState({
      step: 5,
      selections: [{ categoryId: 'cat1', packageId: 'pack1', addOnIds: [] }],
      name: 'User',
    });
    getActions().reset();

    const state = getState();
    expect(state.step).toBe(1);
    expect(state.selections).toEqual([]);
    expect(state.name).toBe('');
  });
});
