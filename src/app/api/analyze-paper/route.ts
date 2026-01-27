import { NextRequest, NextResponse } from 'next/server';

const API_KEY = "euri-5a3c1d875f10d9374efc458c164f5dbbf7e2b70f37e8eebdd3d0264b49f28b60";
const API_URL = "https://api.euron.one/api/v1/euri/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { paperText } = await req.json();

    if (!paperText) {
      return NextResponse.json({ error: 'No paper text provided' }, { status: 400 });
    }

    const systemPrompt = `
You are a DEEP & INTUITIVE research mentor. Your goal is to bridge the gap between high-level concepts and mathematical ground truth using simple, relatable terms.

STRICT CONTENT RULES:
- **Mathematical Intuition**: Every core concept MUST have a "Math Intuition" section. Don't just show formulas; explain *what the variables represent in real life* (e.g., "Think of 'Q' not just as a matrix, but as a user's search query").
- **Key Aspects**: valid bullet points highlighting crucial takeaways.
- **Depth**: Write 3-5 sentences per section. Avoid superficial summaries. Go deep into *why* things work.

OUTPUT (JSON):
{
  "problem": {
    "text": "Detailed explanation of the core problem.",
    "oldWay": "Previous approach",
    "limitation": "The specific bottleneck",
    "desiredWay": "The ideal solution"
  },
  "history": {
    "text": "Evolution of the field.",
    "eras": [
      {"year": "Era 1", "method": "Method", "limitation": "Issue"},
      {"year": "Era 2", "method": "Method", "limitation": "Issue"},
      {"year": "Now", "method": "This Paper", "benefit": "Breakthrough"}
    ]
  },
  "failure": {
    "text": "Deep dive into why previous methods failed (mathematically or structurally).",
    "breakdown": {
      "component": "Failing Component",
      "issue": "The technical failure (e.g. Gradient Vanishing)",
      "consequence": "The downstream impact"
    }
  },
  "insight": {
    "text": "The core innovation.",
    "before": "Old Mental Model",
    "after": "New Mental Model",
    "key concept": "The Pivot Point"
  },
  "concepts": {
    "text": "Explanation of core mechanics.",
    "list": ["Concept 1", "Concept 2", "Concept 3"],
    "math_intuition": {
      "title": "The Math Behind It",
      "equation": "Simplified equation (e.g. Attention(Q,K,V) = softmax(QK^T / sqrt(d))V)",
      "explanation": "Step-by-step breakdown of the equation using simple analogies."
    }
  },
  "system": { 
    "summary": "Detailed architectural walkthrough.",
    "visualSpec": "Spec for visualization.",
    "animationTimeline": "1. Step 1\n2. Step 2\n3. Step 3",
    "interactionIdea": "Interaction description.",
    "visualData": {
      "nodes": ["Input", "Layer", "Output"],
      "links": [{"source": 0, "target": 1, "label": "flow"}]
    },
    "mermaid": "graph LR; A-->B"
  },
  "generalization": {
    "text": "Broader applications.",
    "fields": ["Field 1", "Field 2"]
  },
  "validation": {
    "text": "Empirical evidence.",
    "metrics": [{"name": "Metric", "value": "Value", "context": "Context"}]
  },
  "mentalModels": {
    "text": "Cognitive frameworks to understand this.",
    "analogies": [{"name": "Analogy", "explanation": "Mapping"}]
  },
  "activeLearning": {
    "text": "Initial check. (Full quiz generated separately).",
    "quiz": [{"question": "Intro Question?", "options": ["A", "B"], "answer": 0}]
  }
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
          { role: "user", content: `Analyze this paper: ${paperText.substring(0, 8000)}` }
        ],
        model: "gpt-4.1-nano",
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze paper' }, { status: 500 });
  }
}
