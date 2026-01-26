import OpenAI from 'openai';
import fs from 'fs';

// Lazy initialization - only create client when first needed
let groqClient: OpenAI | null = null;
let initialized = false;

/**
 * Get Groq client (OpenAI-compatible)
 * Uses Groq's free API with OpenAI SDK
 */
function getGroqClient(): OpenAI | null {
    if (!initialized) {
        initialized = true;
        const apiKey = process.env.GROQ_API_KEY;

        if (apiKey && apiKey !== '' && apiKey !== 'mock-key') {
            groqClient = new OpenAI({
                apiKey: apiKey,
                baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
            });
            console.log('Groq client initialized with key:', apiKey.substring(0, 15) + '...');
        } else {
            console.warn('GROQ_API_KEY not found. AI features will return mock data.');
        }
    }
    return groqClient;
}

/**
 * Generate a viral script using Groq's Llama model
 */
export const generateScript = async (topic: string, niche: string): Promise<string> => {
    console.log('generateScript called for:', topic, niche);
    const client = getGroqClient();
    console.log('Groq client:', client ? 'READY' : 'NULL');

    if (!client) {
        console.warn('Groq client not initialized. Returning mock script.');
        return getMockScript(topic, niche);
    }

    try {
        console.log('Calling Groq API...');
        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // Groq's best free model
            messages: [
                {
                    role: 'system',
                    content: `You are a viral short-form video script writer specializing in the ${niche} niche.
                    
Your scripts should follow this structure:
1. HOOK (0-3 seconds): A shocking statement, question, or visual that stops scrollers
2. PROBLEM/CONTEXT (3-10 seconds): Set up the pain point or curiosity
3. BODY (10-45 seconds): Deliver the value with 3-5 key points
4. CTA (45-60 seconds): Clear call to action

Rules:
- Use conversational, energetic language
- Include specific numbers and examples
- Add [VISUAL CUE] markers for B-roll suggestions
- Keep sentences short and punchy
- End with a hook for the next video`,
                },
                {
                    role: 'user',
                    content: `Write a viral 60-second script about: ${topic}`,
                },
            ],
            temperature: 0.8,
            max_tokens: 1000,
        });

        console.log('Groq response received!');
        return completion.choices[0]?.message?.content || getMockScript(topic, niche);
    } catch (error: any) {
        console.error('Groq API Error:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));

        if (error.code === 'insufficient_quota') {
            console.error('Groq quota exceeded.');
        }

        return getMockScript(topic, niche);
    }
};

/**
 * Generate captions - currently returns mock data
 * Note: Groq doesn't support audio transcription like Whisper
 * Consider using AssemblyAI or Deepgram for transcription
 */
export const generateCaptions = async (audioPath: string): Promise<string> => {
    console.warn('Audio transcription not supported by Groq. Returning mock captions.');
    console.warn('Consider using AssemblyAI or Deepgram for audio transcription.');
    return getMockCaptions();
};

/**
 * Generate hook ideas for a topic
 */
export const generateHooks = async (topic: string, count: number = 5): Promise<string[]> => {
    const client = getGroqClient();

    if (!client) {
        return [
            `Did you know ${topic} could change everything?`,
            `Stop scrolling if you care about ${topic}`,
            `I wasted 2 years before learning this about ${topic}`,
            `${topic} is broken. Here's why:`,
            `The truth about ${topic} nobody tells you`,
        ];
    }

    try {
        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Generate viral video hooks. Each hook should be under 10 words, create curiosity, and make people stop scrolling. Return only the hooks, one per line.',
                },
                {
                    role: 'user',
                    content: `Generate ${count} viral hooks for a video about: ${topic}`,
                },
            ],
            temperature: 0.9,
            max_tokens: 300,
        });

        const content = completion.choices[0]?.message?.content || '';
        return content.split('\n').filter(h => h.trim()).slice(0, count);
    } catch (error: any) {
        console.error('Hook generation error:', error.message);
        return [`The truth about ${topic}`];
    }
};

// Mock data for when API is not configured
function getMockScript(topic: string, niche: string): string {
    return `VIRAL SCRIPT: ${topic}

[HOOK - 0:00-0:03]
"Wait... you've been doing ${topic} wrong this whole time?"

[VISUAL CUE: Shocked face, then transition]

[PROBLEM - 0:03-0:10]
"Most people in ${niche} never realize this simple mistake is costing them everything."

[BODY - 0:10-0:45]
"Here's what the top 1% do differently:

Point 1: They focus on consistency over perfection
[VISUAL CUE: Calendar with checkmarks]

Point 2: They leverage systems, not willpower
[VISUAL CUE: Automated workflow graphic]

Point 3: They track everything and adjust
[VISUAL CUE: Analytics dashboard]"

[CTA - 0:45-0:60]
"Follow for Part 2 where I show you the exact system I use.
Drop a fire emoji if this helped!"

---
NOTE: This is a mock script. Add your GROQ_API_KEY to .env for real AI generation.`;
}

function getMockCaptions(): string {
    return `1
00:00:00,000 --> 00:00:03,000
Wait... you've been doing this wrong?

2
00:00:03,000 --> 00:00:08,000
Most people never realize this simple mistake.

3
00:00:08,000 --> 00:00:15,000
Here's what the top 1% do differently.

4
00:00:15,000 --> 00:00:25,000
They focus on consistency over perfection.

5
00:00:25,000 --> 00:00:35,000
They leverage systems, not willpower.

---
MOCK CAPTIONS: Audio transcription requires a separate service (AssemblyAI, Deepgram, etc.)`;
}
