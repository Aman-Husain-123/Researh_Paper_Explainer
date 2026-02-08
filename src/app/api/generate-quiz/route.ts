import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.EURI_API_KEY;
const API_URL = process.env.EURI_API_URL || "https://api.euron.one/api/v1/euri/chat/completions";

// Difficulty-specific question type prompts
const DIFFICULTY_PROMPTS = {
    easy: `
EASY LEVEL QUESTIONS - Focus on:
- Basic definitions and terminology from the paper
- Key facts and figures mentioned
- Simple "what is" or "which one" questions
- Identifying main concepts and their definitions
- Recall of specific terms, names, or values mentioned
- Basic understanding of the paper's main topic

Question style: Direct, factual, one correct answer clearly identifiable from reading the paper.`,

    medium: `
MEDIUM LEVEL QUESTIONS - Focus on:
- Understanding WHY certain methods or approaches were chosen
- Relationships between different concepts in the paper
- Architectural or methodological details
- Cause-and-effect relationships
- Comparing aspects within the paper's methodology
- Understanding the purpose behind specific design choices

Question style: Requires comprehension and some analytical thinking.`,

    hard: `
HARD LEVEL QUESTIONS - Focus on:
- "What if" scenarios and hypothetical modifications
- Mathematical or theoretical implications
- Comparing with other methods NOT in the paper
- Potential limitations and edge cases
- Deep architectural reasoning and trade-offs
- Synthesis of multiple concepts to derive new insights
- Critical evaluation of the paper's claims

Question style: Requires deep analysis, synthesis, and critical thinking.`
};

export async function POST(req: NextRequest) {
    try {
        const { paperText, difficulty, count = 5, randomSeed } = await req.json();

        if (!paperText) {
            return NextResponse.json({ error: 'No context provided' }, { status: 400 });
        }

        const difficultyPrompt = DIFFICULTY_PROMPTS[difficulty as keyof typeof DIFFICULTY_PROMPTS] || DIFFICULTY_PROMPTS.medium;

        // Add randomness factors
        const timestamp = Date.now();
        const randomFactor = Math.random().toString(36).substr(2, 8);
        const startPosition = Math.floor(Math.random() * Math.min(1000, paperText.length));

        // Select different portions of the paper for variety
        const textLength = paperText.length;
        const chunkSize = Math.min(6000, textLength);
        const randomStart = Math.floor(Math.random() * Math.max(0, textLength - chunkSize));
        const selectedText = paperText.substring(randomStart, randomStart + chunkSize);

        const systemPrompt = `
You are an expert examiner creating a unique quiz for a research paper. Generate ${count} COMPLETELY NEW and UNIQUE ${difficulty.toUpperCase()} level questions.

${difficultyPrompt}

CRITICAL REQUIREMENTS:
1. Each question MUST be unique and different from any questions you might have generated before
2. Use randomization seed "${randomSeed || randomFactor}" to ensure variety
3. Questions must be directly based on the paper content provided
4. All 4 options must be plausible (avoid obviously wrong answers)
5. The explanation must clearly justify why the correct answer is right AND why others are wrong
6. Vary question formats: some "Which of the following...", some "What is...", some "According to the paper..."

OUTPUT FORMAT (strict JSON):
{
  "questions": [
    {
      "id": 1,
      "text": "Question text that tests ${difficulty} level understanding...",
      "options": ["Option A (plausible)", "Option B (plausible)", "Option C (plausible)", "Option D (plausible)"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why the answer is correct and others are incorrect."
    }
  ]
}

Timestamp for uniqueness: ${timestamp}
`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Based on this research paper excerpt, generate ${count} unique ${difficulty.toUpperCase()} level questions:\n\n${selectedText}\n\nRemember: Make these questions DIFFERENT from any previous questions. Focus on ${difficulty} difficulty characteristics.` }
                ],
                model: "gpt-4.1-nano",
                response_format: { type: "json_object" },
                temperature: 0.9  // Higher temperature for more variety
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error('Quiz generation failed');
        }

        const data = await response.json();
        const parsedContent = JSON.parse(data.choices[0].message.content);

        // Validate and ensure proper structure
        if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
            throw new Error('Invalid response format');
        }

        // Add difficulty tag to each question and ensure proper IDs
        const questionsWithMetadata = parsedContent.questions.map((q: any, index: number) => ({
            ...q,
            id: `${difficulty}_${timestamp}_${index}`,
            difficulty: difficulty
        }));

        return NextResponse.json({ questions: questionsWithMetadata });
    } catch (error: any) {
        console.error('Quiz error:', error);
        return NextResponse.json({ error: 'Failed to generate quiz', details: error.message }, { status: 500 });
    }
}
