/**
 * OpenRouter client — OpenAI-compatible chat completions with SSE streaming,
 * tool calling, structured JSON output, and image generation (multimodal
 * output via `modalities`).
 */

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null | ContentPart[];
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export type ContentPart =
  | { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }
  | { type: 'image_url'; image_url: { url: string } };

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ToolDef {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatOptions {
  model: string;
  messages: LlmMessage[];
  tools?: ToolDef[];
  tool_choice?: 'auto' | 'none' | 'required';
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' } | { type: 'json_schema'; json_schema: unknown };
  stream?: boolean;
  signal?: AbortSignal;
  onDelta?: (text: string) => void;
  /** Provider routing preferences passed through to OpenRouter. */
  provider?: Record<string, unknown>;
  reasoning?: { effort?: 'low' | 'medium' | 'high'; exclude?: boolean };
}

export interface ChatResult {
  content: string;
  toolCalls: ToolCall[];
  finishReason: string | null;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  raw?: unknown;
  images?: string[]; // data URLs, for image-capable models
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string; image?: string };
  architecture?: { modality?: string; input_modalities?: string[]; output_modalities?: string[]; tokenizer?: string };
  supported_parameters?: string[];
  top_provider?: { context_length?: number; max_completion_tokens?: number };
}

let BASE = 'https://openrouter.ai/api/v1';
/** Override the API base (OpenAI-compatible). Used for local servers and tests. */
export function setBaseUrl(url: string) { BASE = url; }

export class OpenRouterError extends Error {
  status?: number;
  constructor(message: string, status?: number) { super(message); this.status = status; }
}

function headers(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://tavern.app',
    'X-Title': 'Tavern AI Dungeon Master',
  };
}

export async function listModels(apiKey: string): Promise<OpenRouterModel[]> {
  const res = await fetch(`${BASE}/models`, { headers: headers(apiKey) });
  if (!res.ok) throw new OpenRouterError(`Failed to list models (${res.status})`, res.status);
  const json = await res.json();
  return (json.data ?? []) as OpenRouterModel[];
}

export async function checkKey(apiKey: string): Promise<{ ok: boolean; label?: string; usage?: number; limit?: number | null; error?: string }> {
  try {
    const res = await fetch(`${BASE}/auth/key`, { headers: headers(apiKey) });
    if (!res.ok) return { ok: false, error: `Key rejected (${res.status})` };
    const json = await res.json();
    return { ok: true, label: json.data?.label, usage: json.data?.usage, limit: json.data?.limit ?? null };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Core chat call. Streams when opts.stream !== false and an onDelta handler is provided. */
export async function chat(apiKey: string, opts: ChatOptions): Promise<ChatResult> {
  if (!apiKey) throw new OpenRouterError('No OpenRouter API key configured. Add one in Settings.');
  const stream = opts.stream !== false && !!opts.onDelta;
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    stream,
    temperature: opts.temperature ?? 0.9,
  };
  if (opts.max_tokens) body.max_tokens = opts.max_tokens;
  if (opts.tools?.length) { body.tools = opts.tools; body.tool_choice = opts.tool_choice ?? 'auto'; }
  if (opts.response_format) body.response_format = opts.response_format;
  if (opts.provider) body.provider = opts.provider;
  if (opts.reasoning) body.reasoning = opts.reasoning;

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  if (!res.ok) {
    let msg = `OpenRouter error ${res.status}`;
    try { const j = await res.json(); msg = j.error?.message ?? msg; } catch { /* ignore */ }
    throw new OpenRouterError(msg, res.status);
  }

  if (!stream) {
    const json = await res.json();
    const choice = json.choices?.[0];
    const msg = choice?.message ?? {};
    return {
      content: typeof msg.content === 'string' ? msg.content : '',
      toolCalls: (msg.tool_calls ?? []) as ToolCall[],
      finishReason: choice?.finish_reason ?? null,
      usage: json.usage,
      raw: json,
      images: extractImages(msg),
    };
  }

  // SSE streaming
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  const toolCalls: ToolCall[] = [];
  let finishReason: string | null = null;
  let usage: ChatResult['usage'];
  const images: string[] = [];

  const handleLine = (line: string) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') return;
    let json: any;
    try { json = JSON.parse(data); } catch { return; }
    if (json.error) throw new OpenRouterError(json.error.message ?? 'Stream error');
    if (json.usage) usage = json.usage;
    const choice = json.choices?.[0];
    if (!choice) return;
    if (choice.finish_reason) finishReason = choice.finish_reason;
    const delta = choice.delta ?? {};
    if (typeof delta.content === 'string' && delta.content) {
      content += delta.content;
      opts.onDelta?.(delta.content);
    }
    if (delta.images) for (const im of delta.images) { const u = im?.image_url?.url; if (u) images.push(u); }
    if (Array.isArray(delta.tool_calls)) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index ?? 0;
        if (!toolCalls[idx]) toolCalls[idx] = { id: tc.id ?? `call_${idx}`, type: 'function', function: { name: '', arguments: '' } };
        const cur = toolCalls[idx];
        if (tc.id) cur.id = tc.id;
        if (tc.function?.name) cur.function.name += tc.function.name;
        if (tc.function?.arguments) cur.function.arguments += tc.function.arguments;
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).replace(/\r$/, '');
      buffer = buffer.slice(nl + 1);
      handleLine(line);
    }
  }
  if (buffer.trim()) handleLine(buffer);

  return { content, toolCalls: toolCalls.filter(Boolean), finishReason, usage, images };
}

function extractImages(msg: any): string[] {
  const out: string[] = [];
  if (Array.isArray(msg?.images)) for (const im of msg.images) { const u = im?.image_url?.url; if (u) out.push(u); }
  if (Array.isArray(msg?.content)) for (const p of msg.content) { if (p?.type === 'image_url' && p.image_url?.url) out.push(p.image_url.url); }
  return out;
}

/** Ask a JSON-mode completion and parse the result leniently. */
export async function chatJson<T = unknown>(apiKey: string, opts: Omit<ChatOptions, 'response_format' | 'stream' | 'onDelta'>): Promise<T> {
  const res = await chat(apiKey, { ...opts, stream: false, response_format: { type: 'json_object' } });
  return parseJsonLenient<T>(res.content);
}

export function parseJsonLenient<T = unknown>(text: string): T {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed) as T; } catch { /* fallthrough */ }
  // strip ```json fences
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1].trim()) as T; } catch { /* fallthrough */ } }
  // find first { ... last }
  const a = trimmed.indexOf('{'), b = trimmed.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(trimmed.slice(a, b + 1)) as T; } catch { /* fallthrough */ } }
  const c = trimmed.indexOf('['), d = trimmed.lastIndexOf(']');
  if (c >= 0 && d > c) { try { return JSON.parse(trimmed.slice(c, d + 1)) as T; } catch { /* fallthrough */ } }
  throw new Error('Model did not return valid JSON');
}

/**
 * Generate an image via an image-capable chat model (e.g. google/gemini-2.5-flash-image-preview).
 * Returns a data URL.
 */
export async function generateImage(apiKey: string, model: string, prompt: string, opts: { aspect?: 'square' | 'portrait' | 'landscape'; signal?: AbortSignal } = {}): Promise<string> {
  if (!apiKey) throw new OpenRouterError('No OpenRouter API key configured.');
  const aspectHint = opts.aspect === 'portrait' ? ' Portrait orientation (3:4).' : opts.aspect === 'landscape' ? ' Wide cinematic orientation (16:9).' : ' Square composition.';
  const body = {
    model,
    messages: [{ role: 'user', content: `Generate an image. ${prompt}${aspectHint} Do not include any text, captions, or watermarks in the image.` }],
    modalities: ['image', 'text'],
    stream: false,
  };
  const res = await fetch(`${BASE}/chat/completions`, { method: 'POST', headers: headers(apiKey), body: JSON.stringify(body), signal: opts.signal });
  if (!res.ok) {
    let msg = `Image generation failed (${res.status})`;
    try { const j = await res.json(); msg = j.error?.message ?? msg; } catch { /* ignore */ }
    throw new OpenRouterError(msg, res.status);
  }
  const json = await res.json();
  const msg = json.choices?.[0]?.message;
  const imgs = extractImages(msg);
  if (!imgs.length) throw new OpenRouterError('The model returned no image. Try a different image model in Settings.');
  return imgs[0];
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.6);
}
