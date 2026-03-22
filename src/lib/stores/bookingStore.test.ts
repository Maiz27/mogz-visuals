import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useBookingStore } from './bookingStore';

describe('useBookingStore', () => {
  // Helper to get fresh actions and state
  const getActions = () => useBookingStore.getState();
  const getState = () => useBookingStore.getState();

  beforeEach(() => {
    // Reset store to default before each test
    getState().reset();
    vi.clearAllMocks();
    
    // Mock sessionStorage
    const mockStorage: Record<string, string> = {};
    global.sessionStorage = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => { mockStorage[key] = value }),
      removeItem: vi.fn((key) => { delete mockStorage[key] }),
      clear: vi.fn(() => { }),
      length: 0,
      key: vi.fn(),
    } as any;
  });

  afterEach(() => {
    getState().reset();
  });

  it('should initialize with default state', () => {
    const state = getState();
    expect(state.step).toBe(1);
    expect(state.categoryId).toBeNull();
    expect(state.packageName).toBeNull();
    expect(state.addOnNames).toEqual([]);
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

  it('should select category and reset further steps', () => {
    // Set some deep state
    useBookingStore.setState({ 
      step: 3, 
      packageName: 'Premium', 
      date: '2023-01-01T10:00:00Z' 
    });
    
    getActions().selectCategory('id123');
    
    const state = getState();
    expect(state.categoryId).toBe('id123');
    expect(state.packageName).toBeNull(); // Reset
    expect(state.date).toBe(''); // Reset
  });

  it('should update package and toggle add-ons', () => {
    getActions().selectPackage('Standard');
    expect(getState().packageName).toBe('Standard');
    
    getActions().toggleAddOn('Video');
    expect(getState().addOnNames).toContain('Video');
    getActions().toggleAddOn('Video'); // Toggle off
    expect(getState().addOnNames).not.toContain('Video');
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

  it('should persist and hydrate state from storage', () => {
    const draft = {
      step: 4,
      categoryId: 'cat1',
      packageName: 'pack1',
      addOnNames: ['add1'],
      name: 'Persisted User'
    };
    
    (sessionStorage.getItem as any).mockReturnValue(JSON.stringify(draft));
    
    getActions().hydrateFromStorage();
    
    const state = getState();
    expect(state.step).toBe(4);
    expect(state.categoryId).toBe('cat1');
    expect(state.name).toBe('Persisted User');
  });

  it('should reset state correctly', () => {
    useBookingStore.setState({ step: 5, categoryId: 'cat1', name: 'User' });
    getActions().reset();
    
    const state = getState();
    expect(state.step).toBe(1);
    expect(state.categoryId).toBeNull();
    expect(state.name).toBe('');
  });
});
