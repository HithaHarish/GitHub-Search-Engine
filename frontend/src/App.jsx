import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    repoName: "",
    languages: [],
    minStars: "",
    maxStars: "",
    hasLink: false,
  });

  const handleSearch = async () => {
    if (!query) return;

    try {
      const res = await fetch(`http://localhost:3000/github-search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setFilteredResults(data);

      const recentRes = await fetch(`http://localhost:3000/recent-searches`);
      const recentData = await recentRes.json();
      setRecentSearches(recentData);
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = () => {
    let filtered = results;

    if (filters.repoName) {
      filtered = filtered.filter((repo) =>
        repo.name.toLowerCase().includes(filters.repoName.toLowerCase())
      );
    }

    if (filters.languages.length > 0) {
      filtered = filtered.filter(
        (repo) => repo.language && filters.languages.includes(repo.language)
      );
    }

    if (filters.minStars) {
      filtered = filtered.filter((repo) => repo.stars >= parseInt(filters.minStars));
    }

    if (filters.maxStars) {
      filtered = filtered.filter((repo) => repo.stars <= parseInt(filters.maxStars));
    }

    if (filters.hasLink) {
      filtered = filtered.filter((repo) => repo.url);
    }

    setFilteredResults(filtered);
  };

  // Handle adding a tech stack
  const addLanguage = (lang) => {
    if (lang && !filters.languages.includes(lang)) {
      setFilters({ ...filters, languages: [...filters.languages, lang] });
    }
  };

  // Handle removing a tech stack
  const removeLanguage = (lang) => {
    setFilters({ ...filters, languages: filters.languages.filter((l) => l !== lang) });
  };

  useEffect(() => {
    fetch(`http://localhost:3000/recent-searches`)
      .then((res) => res.json())
      .then((data) => setRecentSearches(data));
  }, []);

  return (
    <div className="container">
      <h1>GitHub Repo Search</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => setShowFilters((prev) => !prev)}>Filters</button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <h3>Filters</h3>

          {/* Repository Name */}
          <div className="filter-block">
            <label>Repository Name:</label>
            <input
              type="text"
              placeholder="Type repo name"
              value={filters.repoName}
              onChange={(e) => setFilters({ ...filters, repoName: e.target.value })}
            />
          </div>

          {/* Tech Stack */}
          <div className="filter-block">
            <label>Tech Stack:</label>
            <div className="tech-stack-input">
              <input
                type="text"
                placeholder="Add tech stack"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addLanguage(e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>
            <div className="tech-stack-list">
              {filters.languages.map((lang) => (
                <span key={lang} className="tech-item">
                  {lang} <button onClick={() => removeLanguage(lang)}>x</button>
                </span>
              ))}
            </div>
          </div>

          {/* Stars */}
          <div className="filter-block">
            <label>Stars:</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.minStars}
              onChange={(e) => setFilters({ ...filters, minStars: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxStars}
              onChange={(e) => setFilters({ ...filters, maxStars: e.target.value })}
            />
          </div>

          {/* Has Link */}
          <div className="filter-block">
            <label>
              <input
                type="checkbox"
                checked={filters.hasLink}
                onChange={(e) => setFilters({ ...filters, hasLink: e.target.checked })}
              />
              Only Repos with Link
            </label>
          </div>

          <button onClick={applyFilters} className="apply-btn">
            Apply Filters
          </button>
        </div>
      )}

      {filteredResults.length > 0 && (
        <div className="results">
          {filteredResults.map((repo) => (
            <div className="repo-card" key={repo.id}>
              <a href={repo.url} target="_blank" rel="noreferrer">
                {repo.name}
              </a>
              <p>{repo.description}</p>
              <p>
                <strong>Tech Stack:</strong> {repo.language || "N/A"} | ⭐ {repo.stars}{" "}
                {repo.url && (
                  <span>
                    | <a href={repo.url} target="_blank" rel="noreferrer">Link</a>
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {recentSearches.length > 0 && (
      <div className="recent-searches">
        <h2>Recent Searches</h2>
        {recentSearches.slice(0, 10).map((item) => (
          <div key={item._id} className="search-item">
            {item.query} • {new Date(item.createdAt).toLocaleString()}
          </div>
        ))}
    </div>
  )}
    </div>
  );
} 
export default App;
