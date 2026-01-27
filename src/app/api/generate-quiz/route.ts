import { NextRequest, NextResponse } from 'next/server';

const API_KEY = "euri-5a3c1d875f10d9374efc458c164f5dbbf7e2b70f37e8eebdd3d0264b49f28b60";
const API_URL = "https://api.euron.one/api/v1/euri/chat/completions";

export async function POST(req: NextRequest) {
    try {
        const { paperText, difficulty, count = 3 } = await req.json();

        if (!paperText) {
            return NextResponse.json({ error: 'No context provided' }, { status: 400 });
        }

        const systemPrompt = `
You are an expert examiner for a PhD-level course. Your goal is to test the user's understanding of the provided research paper content.

Generate ${count} ${difficulty.toUpperCase()} questions based on the text.

DIFFICULTY GUIDE:
- Easy: Recall based. Definitions, key terms, basic "what is this".
- Medium: Conceptual. "Why" did they do this? specific relationships, architectural details.
- Hard: Synthesis/Application. "What if" scenarios, mathematical implications, comparison with other methods, deep architectural reasoning.

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "id": 1,
      "text": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this is correct and others are wrong."
    }
  ]
}
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
                    { role: "user", content: `Context: ${paperText.substring(0, 6000)}... Generate ${count} ${difficulty} questions.` }
                ],
                model: "gpt-4.1-nano",
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error('Quiz generation failed');
        }

        const data = await response.json();
        return NextResponse.json(JSON.parse(data.choices[0].message.content));
    } catch (error: any) {
        console.error('Quiz error:', error);
        return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
    }
}
