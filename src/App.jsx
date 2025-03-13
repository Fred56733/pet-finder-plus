import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedRuntime, setSelectedRuntime] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const apiKey = import.meta.env.VITE_OMDB_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing!");
      setError("API Key is missing!");
      return;
    }

    setError(null);

    const searchTerms = [
      "star", "batman", "avengers", "matrix", "jurassic", "spider", "lord", "harry",
      "fast", "furious", "mission", "terminator", "hobbit", "godzilla", "transformers",
      "superman", "wonder", "deadpool", "doctor", "x-men", "hunger", "pirates",
      "gladiator", "titanic", "interstellar", "joker", "gravity", "avatar",
    ];

    const movieRequests = searchTerms.map(term =>
      fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${term}`)
        .then(res => res.json())
        .catch(() => null)
    );

    try {
      const responses = await Promise.all(movieRequests);
      const movieResults = responses
        .filter(res => res && res.Search)
        .flatMap(res => res.Search)
        .reduce((acc, movie) => {
          if (!acc.find(m => m.imdbID === movie.imdbID)) {
            acc.push(movie);
          }
          return acc;
        }, []);

      if (movieResults.length > 0) {
        console.log("Fetching full details for", movieResults.length, "movies...");
        fetchFullMovieDetails(movieResults, apiKey);
      } else {
        setError("No movies found.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch movie data.");
    }
  };

  const fetchFullMovieDetails = async (moviesList, apiKey) => {
    const detailedMovieRequests = moviesList.map(movie =>
      fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
        .then(res => res.json())
        .catch(() => null)
    );

    try {
      const detailedMovies = await Promise.all(detailedMovieRequests);
      const validMovies = detailedMovies.filter(movie => movie && movie.Response === "True");

      setMovies(validMovies);
      console.log("Fetched Full Movie Details:", validMovies.length);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch movie details.");
    }
  };

  const filteredMovies = movies.filter(movie => {
    const imdbRating = parseFloat(movie.imdbRating) || 0;
    const runtimeMinutes = parseInt(movie.Runtime) || 0;

    return (
      (!searchTerm || movie.Title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedGenre || (movie.Genre && movie.Genre.includes(selectedGenre))) &&
      (!selectedRating || imdbRating >= parseFloat(selectedRating)) &&
      (!selectedRuntime || runtimeMinutes <= parseInt(selectedRuntime))
    );
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "rating") {
      return parseFloat(b.imdbRating) - parseFloat(a.imdbRating);
    } else if (sortBy === "year") {
      return parseInt(b.Year) - parseInt(a.Year);
    }
    return 0;
  });

  const totalMovies = sortedMovies.length;
  const averageRating = (
    sortedMovies.reduce((sum, movie) => sum + (parseFloat(movie.imdbRating) || 0), 0) / (totalMovies || 1)
  ).toFixed(1);
  
  const genreCounts = {};
  sortedMovies.forEach(movie => {
    movie.Genre?.split(", ").forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  return (
    <div className="app-container">
      <h1>Movie Finder</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filters">
        <select onChange={(e) => setSelectedGenre(e.target.value)}>
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Adventure">Adventure</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Drama">Drama</option>
          <option value="Crime">Crime</option>
          <option value="Animation">Animation</option>
          <option value="Comedy">Comedy</option>
          <option value="Documentary">Documentary</option>
          <option value="Short">Short</option>
          <option value="Thriller">Thriller</option>
          <option value="Family">Family</option>
          <option value="Horror">Horror</option>
          <option value="Mystery">Mystery</option>
          <option value="Romance">Romance</option>
          <option value="History">History</option>
          <option value="Biography">Biography</option>
          <option value="War">War</option>
        </select>

        <select onChange={(e) => setSelectedRating(e.target.value)}>
          <option value="">Min IMDb Rating</option>
          <option value="8.0">8+</option>
          <option value="7.0">7+</option>
          <option value="6.0">6+</option>
          <option value="5.0">5+</option>
        </select>

        <select onChange={(e) => setSelectedRuntime(e.target.value)}>
          <option value="">Max Runtime (min)</option>
          <option value="120">Under 2 hours</option>
          <option value="90">Under 1.5 hours</option>
          <option value="60">Under 1 hour</option>
        </select>

        <select onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort By</option>
          <option value="rating">Highest IMDb Rating</option>
          <option value="year">Newest First</option>
        </select>
      </div>

      {sortedMovies.length > 0 && (
        <div className="stats">
          <p><strong>Total Movies:</strong> {totalMovies}</p>
          <p><strong>Average IMDb Rating:</strong> {isNaN(averageRating) ? "N/A" : averageRating}</p>
          <p><strong>Genre Distribution:</strong></p>
          <ul>
            {Object.entries(genreCounts).map(([genre, count]) => (
              <li key={genre}>{genre}: {count}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="movie-list">
        {sortedMovies.length > 0 ? (
          sortedMovies.map(movie => (
            <div key={movie.imdbID} className="movie-card">
              <h2>{movie.Title}</h2>
              <p><strong>Year:</strong> {movie.Year}</p>
              <p><strong>Genre:</strong> {movie.Genre || "Unknown"}</p>
              <p><strong>IMDb Rating:</strong> {movie.imdbRating || "N/A"}</p>
              <p><strong>Runtime:</strong> {movie.Runtime || "N/A"}</p>
              <p><strong>Actors:</strong> {movie.Actors || "N/A"}</p>
              <p><strong>Awards:</strong> {movie.Awards || "N/A"}</p>
              <p><strong>Plot:</strong> {movie.Plot || "N/A"}</p>
              <img src={movie.Poster} alt={movie.Title} />
            </div>
          ))
        ) : (
          <p>No movies found. Adjust your filters.</p>
        )}
      </div>
    </div>
  );
}

export default App;
