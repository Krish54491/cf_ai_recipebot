const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Only allow POST /recipes
    if (request.method !== "POST" || url.pathname !== "/recipes") {
      return new Response("Use POST /recipes", { status: 405, headers: corsHeaders });
    }

    // Parse JSON 
    let raw = await request.text();
    console.log("RAW BODY:", JSON.stringify(raw));

    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON", raw, message: err.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
	// check for food field
    const food = data.food;
    if (!food) {
      return new Response(
        JSON.stringify({ error: "Missing 'food' field", received: data }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // AI prompt 
    const prompt = `
      You are a recipe generator AI. For the food "${food}", return ONLY JSON.
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
              { "name": "string", "qty": "string", "normalized": "string", "shopping": "string" }
            ],
            "steps": ["string"]
          }
        ]
      }
      Return 3–5 options. No text outside JSON.
    `;

    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { // if you want to use another model, change this line
      prompt,
      max_tokens: 1200,
    });

    const text = aiResponse.response;

    // AI JSON output 
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { error: "AI invalid JSON", raw: text };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};
