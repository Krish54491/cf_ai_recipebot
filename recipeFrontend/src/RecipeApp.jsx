import React, { useState } from "react";
// I was too lazy to set up Tailwind, so inline styles it is 
// I also just asked GPT-4 to generate the frontend code for me 
export default function RecipeApp() {
  const [food, setFood] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!food.trim()) {
      setError("Enter a food first.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      const res = await fetch("http://127.0.0.1:8787/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setRecipes(data.recipes || []);
      }
    } catch (err) {
      setError("Failed to reach backend: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍕 RecipeBot</h1>

      <input
        style={styles.input}
        type="text"
        placeholder="Type a food... e.g. pizza"
        value={food}
        onChange={(e) => setFood(e.target.value)}
      />

      <button style={styles.button} onClick={generate}>
        Generate Recipes
      </button>

      {loading && <p>⏳ Generating recipes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={styles.list}>
        {recipes.map((r, i) => (
          <div style={styles.card} key={i}>
            <h2>{r.title}</h2>
            <p><strong>Servings:</strong> {r.servings}</p>
            <p><strong>Time:</strong> {r.time_minutes} mins</p>
            <p><strong>Difficulty:</strong> {r.difficulty}</p>

            <h3>Ingredients</h3>
            <ul>
              {r.ingredients.map((ing, idx) => (
                <li key={idx}>{ing.qty} {ing.name}</li>
              ))}
            </ul>

            <h3>Steps</h3>
            <ol>
              {r.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
    padding: 20,
    fontFamily: "Arial"
  },
  title: {
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "2px solid #ccc",
    marginBottom: 10
  },
  button: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    background: "black",
    color: "white",
    border: "none",
    cursor: "pointer"
  },
  list: {
    marginTop: 20
  },
  card: {
    background: "black",
    color: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  }
};
