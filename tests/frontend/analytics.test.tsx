import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Analytics from '../../src/frontend/pages/Analytics';

// Mock the auth hook
vi.mock('../../src/frontend/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      role: 'admin',
      is_premium: true
    }
  })
}));

// Mock fetch
global.fetch = vi.fn();

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />
}));

// Mock AppLayout component
vi.mock('../../src/frontend/components/AppLayout', () => ({
  default: ({ children }: any) => <div data-testid="app-layout">{children}</div>
}));

// Mock PremiumFeatureGuard component
vi.mock('../../src/frontend/components/PremiumFeatureGuard', () => ({
  default: ({ children }: any) => <div data-testid="premium-guard">{children}</div>
}));

const mockAnalyticsData = {
  activeUsers: 150,
  totalPlays: 45,
  totalSignals: 120,
  totalTeams: 12,
  topTeams: [
    { name: 'Team Alpha', play_count: 15, signal_count: 30 },
    { name: 'Team Beta', play_count: 12, signal_count: 25 }
  ],
  timeSeriesData: {
    dailyUsers: [
      { date: '2024-01-01', user_count: 10 },
      { date: '2024-01-02', user_count: 15 }
    ],
    dailyPlays: [
      { date: '2024-01-01', play_count: 5 },
      { date: '2024-01-02', play_count: 8 }
    ],
    dailySignals: [
      { date: '2024-01-01', signal_count: 12 },
      { date: '2024-01-02', signal_count: 18 }
    ]
  }
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Analytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    renderWithRouter(<Analytics />);
    
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('should render analytics data after loading', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => mockAnalyticsData
    } as Response);

    renderWithRouter(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument(); // Active users
      expect(screen.getByText('45')).toBeInTheDocument(); // Total plays
      expect(screen.getByText('120')).toBeInTheDocument(); // Total signals
      expect(screen.getByText('12')).toBeInTheDocument(); // Total teams
    });
  });

  it('should render time range selector', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => mockAnalyticsData
    } as Response);

    renderWithRouter(<Analytics />);

    await waitFor(() => {
      const timeRangeSelect = screen.getByRole('combobox');
      expect(timeRangeSelect).toBeInTheDocument();
      expect(timeRangeSelect).toHaveValue('30d');
    });
  });

  it('should change time range and reload data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => mockAnalyticsData
    } as Response);

    renderWithRouter(<Analytics />);

    await waitFor(() => {
      const timeRangeSelect = screen.getByRole('combobox');
      fireEvent.change(timeRangeSelect, { target: { value: '7d' } });
    });

    // Should make a second API call with new time range
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith('/api/analytics?range=7d', {
      credentials: 'include'
    });
  });

  it('should render charts for premium users', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => mockAnalyticsData
    } as Response);

    renderWithRouter(<Analytics />);

    await waitFor(() => {
      expect(screen.getByTestId('premium-guard')).toBeInTheDocument();
      expect(screen.getByText('Daily Activity')).toBeInTheDocument();
      expect(screen.getByText('Daily Active Users')).toBeInTheDocument();
      expect(screen.getByText('Top Performing Teams')).toBeInTheDocument();
    });
  });

  it('should render top teams list for admin users', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => mockAnalyticsData
    } as Response);

    renderWithRouter(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Team Beta')).toBeInTheDocument();
      expect(screen.getByText('15 plays • 30 signals')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('API Error'));

    renderWithRouter(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      // Should still render the page even if analytics fail to load
    });
  });
}); 