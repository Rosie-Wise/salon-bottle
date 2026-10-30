import OpenAI from 'openai';

let cachedClient: OpenAI | null | undefined;

/**
 * Returns an OpenAI client when `OPENAI_API_KEY` is set; otherwise `null`.
 * Never throws for a missing key.
 */
export function getOpenAI(): OpenAI | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    cachedClient = null;
    return null;
  }
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

/** Clears the cached client (useful in tests). */
export function resetOpenAIClientCache(): void {
  cachedClient = undefined;
}
