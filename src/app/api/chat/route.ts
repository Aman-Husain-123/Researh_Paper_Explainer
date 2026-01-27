import { NextRequest, NextResponse } from 'next/server';

const API_KEY = "euri-5a3c1d875f10d9374efc458c164f5dbbf7e2b70f37e8eebdd3d0264b49f28b60";
const API_URL = "https://api.euron.one/api/v1/euri/chat/completions";

export async function POST(req: NextRequest) {
    try {
        const { messages, paperContext } = await req.json();

        // Enhancing the system prompt to follow the mandatory structure if it's the first message
        // or to stay grounded in the paper context for follow-ups.
        const systemPrompt = `
You are the reasoning core of a research-paper understanding platform.
ANIMATION-FIRST MODE (NON-NEGOTIABLE):
When producing a visual explanation, you MUST think in terms of ANIMATION and TIMELINES.

REASONING ORDER: PROBLEM → FAILURE → PAIN → INSIGHT → SOLUTION → GENERALIZATION.

MANDATORY ANIMATION FORMAT:
--------------------------------
SECTION G: ANIMATION TIMELINE (REQUIRED)
--------------------------------
Provide a numbered sequence. Each step MUST specify:
1. Elements appearing/activating.
2. Visual changes (color, thickness, opacity, motion).
3. WHY this matters conceptually.
4. What the user should notice.
Include at least ONE INTERACTION REQUIREMENT (slider, hover, toggle).

SUCCESS CONDITION:
The user should understand the broken state, the change, and why the new idea works BY THE ANIMATION ALONE.

PAPER CONTEXT:
${paperContext || "No context provided yet."}
`;

        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
        ];

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                messages: apiMessages,
                model: "gpt-4.1-nano",
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return NextResponse.json({ error: 'Failed to fetch from Euron AI' }, { status: response.status });
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message;

        return NextResponse.json({
            role: 'assistant',
            content: typeof assistantMessage.content === 'string' ? assistantMessage.content : assistantMessage.content[0].text
        });
    } catch (error: any) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
    }
}
