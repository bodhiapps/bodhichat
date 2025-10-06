import { describe, it, expect } from 'vitest';
import { render, screen } from './test/test-utils';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getAllByText(/Bodhi Chat/i).length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(<App />);
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
  });
});
