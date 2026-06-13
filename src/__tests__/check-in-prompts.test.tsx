import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CheckIn from '@/app/check-in/page';
import { i18n } from '@/lib/i18n';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
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
    t: i18n.en,
  }),
}));

vi.mock('@/components/Navigation', () => ({
  Navigation: () => <nav aria-label="mock navigation">CalmPrep</nav>,
}));

vi.mock('@/lib/firebase/firestore', () => ({
  saveCheckIn: vi.fn(),
}));

describe('Check-in micro-journal prompts', () => {
  it('inserts a prompt into the journal without submitting the form', () => {
    render(<CheckIn />);

    expect(screen.getByRole('heading', { name: /micro-journal prompts/i })).toBeTruthy();

    const prompt = screen.getByRole('button', {
      name: /what thought kept repeating today/i,
    });
    fireEvent.click(prompt);

    const journal = screen.getByLabelText(/open-ended daily journaling/i) as HTMLTextAreaElement;
    expect(journal.value).toContain('What thought kept repeating today?');
    expect(pushMock).not.toHaveBeenCalled();
  });
});
