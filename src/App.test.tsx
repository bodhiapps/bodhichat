import { describe, it, expect } from 'vitest';
import { render, screen } from './test/test-utils';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Routes>
        <Route path="/bodhichat/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    );
    expect(screen.getAllByText(/Bodhi Chat/i).length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(
      <Routes>
        <Route path="/bodhichat/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    );
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
  });
});
