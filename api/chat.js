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
    const { messages, system, model = 'claude-sonnet-4-5-20250929', webSearch = false } = await req.json();

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

    // Add web search tool if enabled
    if (webSearch) {
      requestOptions.tools = [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3 // Limit searches per request for cost control
        }
      ];
    }

    // Create a streaming response
    const stream = await anthropic.messages.stream(requestOptions);

    // Track token usage and search results
    let usage = null;
    let searchResults = [];

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

            // Capture web search results from content blocks
            if (chunk.type === 'content_block_start' && chunk.content_block?.type === 'web_search_tool_result') {
              // Send indicator that search is happening
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ searching: true })}\n\n`));
            }

            // Capture search result content
            if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'web_search_tool_result_delta') {
              if (chunk.delta.content) {
                searchResults.push(...chunk.delta.content);
              }
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

          // Extract citations/sources from final message content
          if (finalMessage?.content) {
            for (const block of finalMessage.content) {
              if (block.type === 'web_search_tool_result' && block.content) {
                searchResults = block.content.filter(item =>
                  item.type === 'web_search_result'
                ).map(item => ({
                  title: item.title,
                  url: item.url,
                  snippet: item.encrypted_content ? '[encrypted]' : (item.page_content?.slice(0, 200) || '')
                }));
              }
            }
          }

          // Send search results if any
          if (searchResults.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources: searchResults })}\n\n`));
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
