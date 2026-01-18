import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function queryWithContext(
  question: string,
  context: Array<{ content: string; metadata: Record<string, unknown> }>
): Promise<string> {
  const contextText = context
    .map((c, i) => `[Source ${i + 1} - ${c.metadata.filename}]\n${c.content}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are an expert document analyst. Your role is to:

1. **Analyze and synthesize** information from documents - don't just repeat or quote them
2. **Provide insights** - explain what the information means, identify patterns, and draw conclusions
3. **Be structured** - use headings, bullet points, and clear formatting when helpful
4. **Be concise but thorough** - get to the point while covering key aspects
5. **Add value** - offer interpretations, implications, or recommendations when relevant

If the documents don't contain enough information to fully answer the question, explain what you can determine and what's missing.`;

  const userMessage = `## Document Context

${contextText}

---

## Question
${question}

---

Provide a thoughtful, well-structured answer that analyzes the information (don't just repeat the source text). Include insights, key takeaways, or implications where relevant.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ]
  });

  const textContent = response.content.find(block => block.type === 'text');
  return textContent?.text || 'No response generated';
}
