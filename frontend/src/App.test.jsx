import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the login screen', () => {
    render(<App />);
    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /login/i }).length).toBeGreaterThan(0);
  });
});
