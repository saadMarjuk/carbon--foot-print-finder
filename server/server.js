const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "data.txt");

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve Vite build files (React frontend)
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// API routes
app.get("/api/data", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  const lines = fs.readFileSync(DATA_FILE, "utf-8")
    .trim()
    .split("\n")
    .map(l => JSON.parse(l));
  res.json(lines.reverse());
});

app.post("/api/data", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  const carbon = parseFloat((Math.random() * 1).toFixed(3));
  const rating = carbon < 0.2 ? "A+" : carbon < 0.4 ? "A" : carbon < 0.6 ? "B" : "C";

  const lines = fs.existsSync(DATA_FILE)
    ? fs.readFileSync(DATA_FILE, "utf-8").trim().split("\n").map(l => JSON.parse(l))
    : [];
  const higher = lines.filter(e => parseFloat(e.carbon) > carbon).length;
  const percentCleaner = lines.length ? ((higher / lines.length) * 100).toFixed(0) : 100;

  const entry = { id: Date.now(), url, carbon, rating, percentCleaner, date: new Date().toISOString() };
  fs.appendFileSync(DATA_FILE, JSON.stringify(entry) + "\n");

  res.json(entry);
});

app.delete("/api/data/:id", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.status(404).json({ error: "No data" });

  const id = parseInt(req.params.id);
  const lines = fs.readFileSync(DATA_FILE, "utf-8").trim().split("\n").map(l => JSON.parse(l));
  const newLines = lines.filter(l => l.id !== id);

  fs.writeFileSync(DATA_FILE, newLines.map(l => JSON.stringify(l)).join("\n") + "\n");
  res.json({ success: true });
});

// Catch-all route for React Router (must be after API routes)
app.get("/*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
