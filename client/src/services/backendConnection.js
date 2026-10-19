import { API_BASE_URL, PYTHON_AI_BASE_URL } from '../config/api';

const positiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const REQUEST_TIMEOUT_MS = positiveInteger(process.env.REACT_APP_HEALTH_REQUEST_TIMEOUT_MS, 10000);
const WAKE_TIMEOUT_MS = positiveInteger(process.env.REACT_APP_BACKEND_WAKE_TIMEOUT_MS, 120000);
const RETRY_BASE_MS = positiveInteger(process.env.REACT_APP_HEALTH_RETRY_BASE_MS, 1000);
const RETRY_MAX_MS = positiveInteger(process.env.REACT_APP_HEALTH_RETRY_MAX_MS, 10000);

let backendWakePromise = null;
let aiWakePromise = null;

const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

async function requestHealth(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Health check returned HTTP ${response.status}`);
    }

    const result = await response.json();
    if (!['ok', 'healthy', 'operational'].includes(result.status)) {
      throw new Error('Health check returned an unexpected response');
    }
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

async function retryHealthCheck(url) {
  const deadline = Date.now() + WAKE_TIMEOUT_MS;
  let attempt = 0;
  let lastError;

  while (Date.now() < deadline) {
    attempt += 1;
    const remainingMs = deadline - Date.now();

    try {
      return await requestHealth(url, Math.min(REQUEST_TIMEOUT_MS, remainingMs));
    } catch (error) {
      lastError = error;
    }

    const waitMs = Math.min(RETRY_BASE_MS * (2 ** (attempt - 1)), RETRY_MAX_MS);
    const remainingMsAfterRequest = deadline - Date.now();
    if (remainingMsAfterRequest <= 0) break;
    await sleep(Math.min(waitMs, remainingMsAfterRequest));
  }

  throw new Error(`Service did not become available within ${WAKE_TIMEOUT_MS}ms`, {
    cause: lastError
  });
}

function deduplicateWake(currentPromise, setPromise, url) {
  if (currentPromise) return currentPromise;

  const request = retryHealthCheck(url).then(
    (result) => {
      setPromise(null);
      return result;
    },
    (error) => {
      setPromise(null);
      throw error;
    }
  );
  setPromise(request);
  return request;
}

export function wakeBackend() {
  return deduplicateWake(backendWakePromise, (promise) => {
    backendWakePromise = promise;
  }, `${API_BASE_URL}/api/health`);
}

export function wakeAIService() {
  return deduplicateWake(aiWakePromise, (promise) => {
    aiWakePromise = promise;
  }, `${PYTHON_AI_BASE_URL}/health`);
}
