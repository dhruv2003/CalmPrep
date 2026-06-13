import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Navigation } from '@/components/Navigation';

vi.mock('next/navigation', () => ({
  usePathname: () => '/check-in',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    isDemoMode: true,
  }),
}));

vi.mock('@/components/LanguageProvider', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: {
      appTitle: 'CalmPrep',
      profile: 'Profile',
    },
  }),
}));

describe('Navigation', () => {
  it('renders a dedicated mobile app navigation group', () => {
    render(<Navigation />);

    expect(screen.getByLabelText('Primary mobile navigation')).toBeTruthy();
    expect(screen.getByRole('link', { name: /home/i }).getAttribute('href')).toBe('/');
    expect(screen.getAllByRole('link', { name: /check-in/i })[0].getAttribute('href')).toBe('/check-in');
    expect(screen.getAllByRole('link', { name: /profile/i })[0].getAttribute('href')).toBe('/profile');
  });
});
