// Serverless function to proxy MCQMCP tool calls
// MCQMCP server REST API at https://mcqmcp.onrender.com/api/tools/call

export const config = {
  runtime: 'edge',
};

const MCQMCP_URL = 'https://mcqmcp.onrender.com';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { tool, args } = await req.json();

    // Call the MCQMCP REST API endpoint
    const response = await fetch(`${MCQMCP_URL}/api/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tool,
        arguments: args,
      }),
    });

    if (response.ok) {
      const result = await response.json();

      // Transform MCQMCP response to normalized format for frontend
      if (result.success && result.result) {
        const mcqResult = result.result;

        // Normalize options: MCQMCP returns {A: "...", B: "...", C: "...", D: "..."}
        // We need to convert to array format for the frontend
        let optionsArray = [];
        if (mcqResult.options) {
          if (Array.isArray(mcqResult.options)) {
            optionsArray = mcqResult.options;
          } else {
            // Convert object format to array, preserving order A, B, C, D
            optionsArray = Object.entries(mcqResult.options)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, value]) => value);
          }
        }

        // Normalize correct_answer: MCQMCP returns "A"/"B"/"C"/"D", we need the actual text
        let correctAnswer = mcqResult.correct_answer;
        if (mcqResult.options && !Array.isArray(mcqResult.options) && mcqResult.correct_answer) {
          // If correct_answer is a letter key, get the actual text
          if (mcqResult.options[mcqResult.correct_answer]) {
            correctAnswer = mcqResult.options[mcqResult.correct_answer];
          }
        }

        const normalized = {
          question: mcqResult.question,
          options: optionsArray,
          correct_answer: correctAnswer,
          explanation: mcqResult.explanation || null,
          code: mcqResult.code || null,
          source: mcqResult.source || 'item-bank',
          topic: mcqResult.topic || null,
          item_id: mcqResult.item_id || null
        };

        return new Response(JSON.stringify({
          content: [{
            type: 'text',
            text: JSON.stringify(normalized)
          }]
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Pass through other responses (like mcq_match_topic, mcq_get_status)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // MCQMCP server returned an error
    const errorText = await response.text();
    console.error('MCQMCP error:', response.status, errorText);

    return new Response(JSON.stringify({
      error: 'MCQMCP server error',
      status: response.status,
      details: errorText
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('MCQ API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
