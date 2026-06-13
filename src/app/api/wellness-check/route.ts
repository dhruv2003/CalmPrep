import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkInSchema } from '@/lib/validation';
import { buildGeminiPrompt } from '@/lib/gemini-prompt';

// Rate limit map (simple in-memory for MVP)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60000; // 1 minute per IP/user

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
    }

    // Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const lastRequest = rateLimitMap.get(ip);
    if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }
    rateLimitMap.set(ip, Date.now());

    const body = await req.json();
    const validatedData = checkInSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid check-in data', details: validatedData.error.issues }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-flash-latest for best compatibility with new API keys
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = buildGeminiPrompt(validatedData.data);
    const result = await model.generateContent(prompt);
    
    let text = result.response.text();
    
    // Clean up potential markdown formatting that Gemini sometimes adds even in JSON mode
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Gemini Output:', text);
      return NextResponse.json({ error: 'Failed to parse AI response. The model may have returned invalid JSON.' }, { status: 500 });
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Wellness Check API Error:', error);
    return NextResponse.json({ error: 'Failed to process wellness check. Please try again later.' }, { status: 500 });
  }
}
