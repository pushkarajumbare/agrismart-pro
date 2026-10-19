import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./services/backendConnection', () => ({
  wakeBackend: jest.fn(),
  wakeAIService: jest.fn()
}));

const { wakeBackend, wakeAIService } = require('./services/backendConnection');

beforeEach(() => {
  localStorage.clear();
  wakeBackend.mockReset();
  wakeAIService.mockReset();
  wakeBackend.mockResolvedValue({ status: 'ok' });
  wakeAIService.mockResolvedValue({ status: 'healthy' });
});

test('shows the app after the backend health check succeeds', async () => {
  render(<App />);
  expect(screen.getByText(/waking up agrismart pro services/i)).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /launch agrismart/i })).toBeInTheDocument();
});

test('keeps the app available and offers retry after a backend health check fails', async () => {
  wakeBackend.mockRejectedValueOnce(new Error('Backend unavailable'));
  render(<App />);

  expect(await screen.findByText(/backend is temporarily unavailable/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /retry connection/i }));

  await waitFor(() => expect(wakeBackend).toHaveBeenCalledTimes(2));
});

test('reports and retries the separate Python AI service independently', async () => {
  wakeAIService.mockRejectedValueOnce(new Error('AI service unavailable'));
  render(<App />);

  expect(await screen.findByText(/separate python ai service is temporarily unavailable/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /launch agrismart/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /retry ai connection/i }));

  await waitFor(() => expect(wakeAIService).toHaveBeenCalledTimes(2));
});
