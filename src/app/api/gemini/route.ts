import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, apiKey: clientApiKey, model, noteTitle, noteContent, count, difficulty, topic, messages, userMessage } = body;

    // Use client provided API key or environment variable
    const apiKey = (clientApiKey && clientApiKey.trim().length > 10)
      ? clientApiKey.trim()
      : (process.env.GEMINI_API_KEY || '');

    const selectedModel = model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (action === 'test-key') {
      if (!apiKey || apiKey.length < 10) {
        return NextResponse.json({ success: false, message: 'Invalid API key format.' });
      }
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const testModel = genAI.getGenerativeModel({ model: selectedModel });
        const res = await testModel.generateContent('Say "OK"');
        const text = res.response.text();
        return NextResponse.json({ success: true, message: `Connected to Gemini (${selectedModel}) successfully! Response: ${text.trim()}` });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || 'Failed to authenticate with Gemini.' });
      }
    }

    if (action === 'mcqs') {
      const result = await GeminiService.generateMCQs(
        apiKey,
        selectedModel,
        noteTitle || 'Study Material',
        noteContent || '',
        count || 5,
        difficulty || 'medium'
      );
      return NextResponse.json(result);
    }

    if (action === 'flashcards') {
      const result = await GeminiService.generateFlashcards(
        apiKey,
        selectedModel,
        noteTitle || 'Study Material',
        noteContent || '',
        count || 8
      );
      return NextResponse.json(result);
    }

    if (action === 'explanation') {
      const result = await GeminiService.generateExplanation(
        apiKey,
        selectedModel,
        noteTitle || 'Study Material',
        noteContent || '',
        topic
      );
      return NextResponse.json(result);
    }

    if (action === 'chat') {
      const result = await GeminiService.chatWithTutor(
        apiKey,
        selectedModel,
        noteTitle || 'Study Material',
        noteContent || '',
        messages || [],
        userMessage || 'Help me understand this topic.'
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action specified.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
