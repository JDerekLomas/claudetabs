import Anthropic from '@anthropic-ai/sdk';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, system, model = 'claude-sonnet-4-5-20250929' } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Build request options with prompt caching
    const requestOptions = {
      model: model,
      max_tokens: 8192,
      messages: messages,
    };

    // Add system prompt with cache control if provided
    // The system prompt (learner profile + learning history) is cached for efficiency
    if (system) {
      requestOptions.system = [
        {
          type: 'text',
          text: system,
          cache_control: { type: 'ephemeral' }
        }
      ];
    }

    // Create a streaming response
    const stream = await anthropic.messages.stream(requestOptions);

    // Track token usage
    let usage = null;

    // Convert Anthropic stream to Response stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
            // Capture usage from message_delta or message_stop events
            if (chunk.type === 'message_delta' && chunk.usage) {
              usage = { ...usage, ...chunk.usage };
            }
          }

          // Get final message for complete usage stats
          const finalMessage = await stream.finalMessage();
          if (finalMessage?.usage) {
            usage = finalMessage.usage;
          }

          // Send usage data before closing
          if (usage) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ usage })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
