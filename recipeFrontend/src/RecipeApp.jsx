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

      {loading && <p style={styles.centerText}>⏳ Generating recipes...</p>}
      {error && <p style={{ ...styles.centerText, color: "red" }}>{error}</p>}

      <div style={styles.list}>
        {recipes.map((r, i) => (
          <div style={styles.card} key={i}>
            <h2 style={styles.cardTitle}>{r.title}</h2>
            <p style={styles.centerText}><strong>Servings:</strong> {r.servings}</p>
            <p style={styles.centerText}><strong>Time:</strong> {r.time_minutes} mins</p>
            <p style={styles.centerText}><strong>Difficulty:</strong> {r.difficulty}</p>

            <h3 style={styles.centerText}>Ingredients</h3>
            <ul style={styles.centerList}>
              {r.ingredients.map((ing, idx) => (
                <li key={idx}>{ing.qty} {ing.name}</li>
              ))}
            </ul>

            <h3 style={styles.centerText}>Steps</h3>
            <ol style={styles.centerList}>
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
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "2px solid #ccc",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    background: "#222",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: 20,
  },
  list: {
    marginTop: 20,
  },
  card: {
    background: "linear-gradient(135deg, #1a1a1a, #333)",
    color: "white",
    borderRadius: 12,
    padding: 25,
    marginBottom: 25,
    border: "1px solid #444",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 15,
  },
  centerText: {
    textAlign: "center",
    margin: "5px 0",
  },
  centerList: {
    textAlign: "center",
    listStylePosition: "inside",
    paddingLeft: 0,
    marginBottom: 15,
  },
};
