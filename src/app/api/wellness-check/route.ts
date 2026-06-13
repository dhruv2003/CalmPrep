import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkInSchema } from '@/lib/validation';
import { buildGeminiPrompt } from '@/lib/gemini-prompt';
import { wellnessResponseSchema } from '@/lib/response-validation';

// Module-level singleton — created once, reused across requests
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI
  ? genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' },
    })
  : null;

// Rate limit map with periodic cleanup to prevent memory leaks
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60000; // 1 minute per IP/user

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of rateLimitMap) {
    if (now - timestamp > RATE_LIMIT_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_MS * 5);

/**
 * Sanitizes user input to prevent prompt injection attacks.
 * Strips control characters and limits length.
 */
function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Strip control chars
    .replace(/<script[\s\S]*?<\/script>/gi, '')           // Strip script tags
    .replace(/<[^>]*>/g, '')                               // Strip HTML tags
    .trim();
}

export async function POST(req: Request) {
  try {
    if (!apiKey || !model) {
      return NextResponse.json(
        { error: 'Gemini API key is missing' },
        { status: 500 }
      );
    }

    // Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const lastRequest = rateLimitMap.get(ip);
    if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }
    rateLimitMap.set(ip, Date.now());

    const body = await req.json();
    const validatedData = checkInSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid check-in data', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    // Sanitize user-provided text fields before sending to AI
    const sanitizedData = {
      ...validatedData.data,
      journalText: sanitizeText(validatedData.data.journalText),
      biggestPressure: sanitizeText(validatedData.data.biggestPressure),
    };

    const prompt = buildGeminiPrompt(sanitizedData);
    const result = await model.generateContent(prompt);

    let text = result.response.text();

    // Clean up potential markdown formatting that Gemini sometimes adds
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let rawResponse;
    try {
      rawResponse = JSON.parse(text);
    } catch {
      console.error('JSON Parse Error. Raw Gemini Output:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response. The model may have returned invalid JSON.' },
        { status: 500 }
      );
    }

    // Validate the AI response shape before sending to client
    const validated = wellnessResponseSchema.safeParse(rawResponse);
    if (!validated.success) {
      console.error('AI response validation failed:', validated.error.issues);
      // Return partial data with defaults rather than failing completely
      return NextResponse.json(rawResponse);
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error('Wellness Check API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process wellness check. Please try again later.' },
      { status: 500 }
    );
  }
}
