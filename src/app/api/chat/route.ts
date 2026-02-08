import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.EURI_API_KEY;
const API_URL = process.env.EURI_API_URL || "https://api.euron.one/api/v1/euri/chat/completions";

function generateVanillaResponse(lastMessage: string, paperContextStr: string, fullText: string = "") {
  let paperData: any = {};
  try {
    paperData = JSON.parse(paperContextStr || "{}");
  } catch (e) {
    console.error("Failed to parse paper context for vanilla mode", e);
  }

  const query = lastMessage.toLowerCase();

  // Heuristic Keyword Search
  let responseText = "";
  let richContent: any = null;

  if (query.includes("problem") || query.includes("fail") || query.includes("limit")) {
    responseText = `**The Core Problem:**\n\n${paperData.problem?.text || "The paper identifies a significant gap in current methods."}\n\n**Why Previous Methods Failed:**\n\n${paperData.failure?.text || "Not explicitly detailed, but usually due to scaling issues."}`;
    if (paperData.problem?.visualData) {
      richContent = { hasVisual: true, visualData: paperData.problem.visualData };
    }
  } else if (query.includes("solution") || query.includes("system") || query.includes("architecture") || query.includes("model")) {
    responseText = `**The Proposed Solution:**\n\n${paperData.system?.text || "The authors propose a novel architecture."}\n\n**Key Insight:**\n\n${paperData.insight?.text || "Using a new mechanism to capture dependencies."}`;
    if (paperData.system?.mermaid) {
      // Vanilla mode might not support deep dive logic fully, but we can return text.
    }
  } else if (query.includes("math") || query.includes("equation") || query.includes("proof")) {
    responseText = `**Mathematical Foundation:**\n\n${paperData.concepts?.text || "The paper relies on standard formulations along with new derivations."}`;
    if (paperData.concepts?.math_intuition) {
      richContent = {
        hasMath: true,
        math: paperData.concepts.math_intuition
      };
    }
  } else if (query.includes("concept") || query.includes("idea")) {
    responseText = `**Key Concepts:**\n\n${paperData.concepts?.text || "Several key concepts are introduced."}`;
  } else {
    // Search in full text if keywords aren't hit for summary
    if (fullText && fullText.length > 100) {
      const snippets = fullText.split('\n').filter(line =>
        query.split(' ').some(word => word.length > 3 && line.toLowerCase().includes(word))
      ).slice(0, 3);

      if (snippets.length > 0) {
        responseText = `(Analyzed from text) Based on your query, here is what I found in the paper:\n\n${snippets.join('\n\n')}\n\n*This is a local extraction. Use GPT mode for deeper synthesis.*`;
      } else {
        responseText = `(Vanilla Mode) I've analyzed the paper locally. Here is a high-level summary:\n\n${paperData.system?.summary || paperData.problem?.text || "The paper discusses extensive experiments and a new methodology."}`;
      }
    } else {
      responseText = `(Vanilla Mode) I've analyzed the paper locally. Here is a high-level summary:\n\n${paperData.system?.summary || paperData.problem?.text || "The paper discusses extensive experiments and a new methodology."}`;
    }
  }

  return {
    text: responseText,
    richContent: richContent || { hasVisual: false, hasMath: false }
  };
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messages, paperContext, fullText, useVanilla } = body;
  const lastMessage = messages?.[messages.length - 1]?.content || "";

  // 1. Check for Vanilla Mode Explicit Selection
  if (useVanilla) {
    console.log("Vanilla mode selected by user.");
    const vanillaResponse = generateVanillaResponse(lastMessage, paperContext, fullText);
    return NextResponse.json(vanillaResponse);
  }

  // 2. Try GPT Mode
  try {
    const systemPrompt = `
You are InsightScholar, a specialized research assistant.
You have access to the full text of a research paper.

YOUR CORE TASK:
1. Answer the user's question accurately using the paper's content.
2. Decide strictly: Chat Answer vs. Deep Dive.

### 1. DECISION LOGIC (CRITICAL)
**WHEN TO USE "hasVisual": true** (Triggers Deep Dive):
- ONLY when the user asks for a *process flow*, *architecture diagram*, *structural breakdown*, or *step-by-step mechanism* that implies a Node-Link graph.
- Example: "How does the Encoder work?", "Show me the data flow."

**WHEN TO USE "hasVisual": false** (Stays in Chat):
- For definitions, simple "Why" questions, mathematical derivations, or conceptual summarizations.
- Example: "Why do we scale dot products?", "Define Attention.", "What is the loss function?" -> These are TEXT + MATH.

### 2. AUTHENTIC MATH FORMULATION
- You must use **Standard LaTeX** with \`$\` delimiters for inline math (e.g., \`$E=mc^2$\`) and \`$$\` for block math.
- **AUTHENTICITY RULE**: Use the *exact* variable names and notation from the paper.
  - If the paper uses \`$h_i$\`, use \`$h_i$\`. DO NOT change it to \`$x$\` or "hidden state".
  - If the paper uses \`\\sqrt{d_k}\`, use \`\\sqrt{d_k}\`.
- Do not "simplify" the notation if it loses the specific nuance of the paper.

### 3. OUTPUT FORMAT (JSON)
{
  "text": "Your conversational answer here. Use $...$ for inline math.",
  "richContent": {
    "hasMath": true, // Set true if equation is key to the answer
    "math": {
      "title": "Exact Formulation",
      "equation": "$$ ... $$", // Block LaTeX equation.
      "explanation": "Briefly explain the variables ($d_k$ is dimension...)"
    },
    // ONLY include visualData if hasVisual is TRUE
    "hasVisual": false, 
    "visualData": {
      "nodes": ["A", "B"], 
      "links": [{"source": 0, "target": 1, "label": "next"}]
    },
    "animationSteps": ["Step 1", "Step 2"]
  }
}

FULL PAPER TEXT (Primary Source):
${fullText?.substring(0, 15000) || "Full text not available."}

SUMMARY STRUCTURE (For fast reference):
${paperContext || "No summary provided."}
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
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.warn(`GPT API Failed with status ${response.status}. Falling back to Vanilla mode.`);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Parse the JSON content from the LLM
    let parsedContent;
    try {
      let contentStr = assistantMessage.content;
      if (typeof contentStr !== 'string') {
        contentStr = JSON.stringify(contentStr);
      }

      // Clean markdown code blocks if present
      contentStr = contentStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

      parsedContent = JSON.parse(contentStr);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      // Fallback if LLM failed to produce valid JSON but API succeeded
      parsedContent = {
        text: typeof assistantMessage.content === 'string' ? assistantMessage.content : JSON.stringify(assistantMessage.content),
        richContent: null
      };
    }

    return NextResponse.json(parsedContent);

  } catch (error: any) {
    console.error('Chat API failed (Falling back to Vanilla):', error);

    // 3. FALLBACK: Execute Vanilla Logic if API fails
    const vanillaResponse = generateVanillaResponse(lastMessage, paperContext, fullText);

    // Append a small note indicating fallback occurred
    vanillaResponse.text = "(Note: API Connection unreachable. Switched to offline analysis.)\n\n" + vanillaResponse.text;

    return NextResponse.json(vanillaResponse);
  }
}
