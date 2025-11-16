/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Use POST /recipes", { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/recipes") {
      return new Response("Not found", { status: 404 });
    }

    const { food } = await request.json();

    if (!food) {
      return new Response(JSON.stringify({ error: "Missing food" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Prompt for Workers AI (Llama 3.3)
    const prompt = `
You are a recipe generator AI. For the food "${food}", return ONLY valid JSON:

{
  "query": "${food}",
  "recipes": [
    {
      "id": "string",
      "title": "string",
      "servings": 4,
      "time_minutes": 45,
      "difficulty": "easy",
      "ingredients": [
        { "name": "string", "qty": "string", "normalized": "string" }
      ],
      "steps": ["string"]
    }
  ]
}

Return 3-5 recipe options and NO extra text.
`;

    // Call Cloudflare Workers AI
    const aiResponse = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct",
      {
        prompt,
        max_tokens: 1200,
      }
    );

    // Extract response text
    const text = aiResponse.response;

    // Try parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // Try to extract JSON with regex fallback
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return new Response(JSON.stringify({ error: "Invalid AI JSON", raw: text }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        return new Response(JSON.stringify({ error: "Still invalid JSON", raw: text }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
