const originalFetch = global.fetch;

afterEach(() => {
  jest.restoreAllMocks();
  if (originalFetch) {
    global.fetch = originalFetch;
  } else {
    delete global.fetch;
  }
  jest.resetModules();
});

test('retries a failed health check and shares an in-flight wake-up request', async () => {
  const setTimeout = global.setTimeout;
  jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay, ...args) => {
    if (delay === 1000) {
      callback(...args);
      return 0;
    }
    return setTimeout(callback, delay, ...args);
  });
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: false, status: 503 })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' })
    });

  const { wakeBackend } = require('./backendConnection');
  const firstRequest = wakeBackend();
  expect(wakeBackend()).toBe(firstRequest);

  await expect(firstRequest).resolves.toMatchObject({ status: 'ok' });
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/api\/health$/);
});
