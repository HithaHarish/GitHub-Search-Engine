const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const connectDB = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
connectDB();
console.log("MongoDB connected");

const searchSchema = new mongoose.Schema({
  query: String,
  createdAt: { type: Date, default: Date.now },
});
const Search = mongoose.model("Search", searchSchema);

app.get("/", (req, res) => {
  res.send("GitHub Search API is running");
});

app.get("/github-search", async (req, res) => {
  try {
    let {
      q,
      repoName,
      languages,
      minStars,
      maxStars,
      hasLink,
      page = 1,
      per_page = 20,
    } = req.query;

    if (!q) return res.status(400).json({ error: "No query provided" });

    await Search.create({ query: q });

    // Start building query
    let githubQuery = q;

    if (repoName) githubQuery += `+in:name+${repoName}`;
    if (languages) {
      const langs = languages.split(",").map(l => l.trim());
      githubQuery += langs.map(lang => `+language:${lang}`).join("");
    }
    if (minStars && !isNaN(minStars)) githubQuery += `+stars:>=${minStars}`;
    if (maxStars && !isNaN(maxStars)) githubQuery += `+stars:<=${maxStars}`;

    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(githubQuery)}&page=${page}&per_page=${per_page}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return res.json([]);

    let repos = data.items.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
    }));

    // Filter for hasLink on backend (optional)
    if (hasLink === "true") repos = repos.filter(r => r.url);

    res.json(repos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch from GitHub" });
  }
});

app.get("/recent-searches", async (req, res) => {
  try {
    const recent = await Search.find().sort({ createdAt: -1 }).limit(10);
    res.json(recent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recent searches" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
