import OpenAI from 'openai';
import fs from 'fs';

// Initialize OpenAI client only if API key exists
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '' && process.env.OPENAI_API_KEY !== 'mock-key') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized');
} else {
    console.warn('⚠️  OPENAI_API_KEY not set. AI features will return mock data.');
}

/**
 * Generate a viral script using GPT-4
 */
export const generateScript = async (topic: string, niche: string): Promise<string> => {
    // Check if API key is configured
    if (!openai) {
        console.warn('⚠️  OpenAI client not initialized. Returning mock script.');
        return getMockScript(topic, niche);
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
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

        return completion.choices[0]?.message?.content || getMockScript(topic, niche);
    } catch (error: any) {
        console.error('OpenAI API Error:', error.message);

        // Return mock on error but log the issue
        if (error.code === 'insufficient_quota') {
            console.error('⚠️  OpenAI quota exceeded. Please add credits.');
        }

        return getMockScript(topic, niche);
    }
};

/**
 * Generate captions using Whisper API
 */
export const generateCaptions = async (audioPath: string): Promise<string> => {
    if (!openai) {
        console.warn('⚠️  OpenAI client not initialized. Returning mock captions.');
        return getMockCaptions();
    }

    try {
        // Check if file exists
        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'whisper-1',
            response_format: 'srt', // Get SRT format directly
            language: 'en',
        });

        return transcription as unknown as string;
    } catch (error: any) {
        console.error('Whisper API Error:', error.message);
        return getMockCaptions();
    }
};

/**
 * Generate hook ideas for a topic
 */
export const generateHooks = async (topic: string, count: number = 5): Promise<string[]> => {
    if (!openai) {
        return [
            `Did you know ${topic} could change everything?`,
            `Stop scrolling if you care about ${topic}`,
            `I wasted 2 years before learning this about ${topic}`,
            `${topic} is broken. Here's why:`,
            `The truth about ${topic} nobody tells you`,
        ];
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
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
    return `🎬 VIRAL SCRIPT: ${topic}

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
Drop a 🔥 if this helped!"

---
⚠️ NOTE: This is a mock script. Add your OpenAI API key to .env for real AI generation.`;
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
⚠️ MOCK CAPTIONS: Add your OpenAI API key for real Whisper transcription.`;
}
