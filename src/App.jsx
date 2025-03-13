import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedRuntime, setSelectedRuntime] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OMDB_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing!");
      setError("API Key is missing!");
      return;
    }

    const popularMovies = ['Inception', 'The Matrix', 'Interstellar', 'The Dark Knight', 'Pulp Fiction', 'Fight Club', 'Forrest Gump', 'The Shawshank Redemption', 'The Godfather', 'The Lord of the Rings'];

    const fetchMovies = async () => {
      try {
        const fetchedMovies = await Promise.all(
          popularMovies.map(async (title) => {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${title}`);
            const data = await response.json();
            return data.Response === "True" ? data : null;
          })
        );
        const validMovies = fetchedMovies.filter(movie => movie !== null);
        setMovies(validMovies);
        setFilteredMovies(validMovies);
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        setError("Failed to fetch movie data");
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const filtered = movies.filter(movie => {
      const imdbRating = parseFloat(movie.imdbRating) || 0;
      const runtimeMinutes = parseInt(movie.Runtime) || 0;

      return (
        (!searchQuery || movie.Title.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedGenre || movie.Genre.includes(selectedGenre)) &&
        (!selectedRating || imdbRating >= parseFloat(selectedRating)) &&
        (!selectedRuntime || runtimeMinutes <= parseInt(selectedRuntime))
      );
    });
    setFilteredMovies(filtered);
  }, [searchQuery, selectedGenre, selectedRating, selectedRuntime, movies]);

  // Statistics
  const totalMovies = filteredMovies.length;
  const averageRating = (
    filteredMovies.reduce((sum, movie) => sum + (parseFloat(movie.imdbRating) || 0), 0) / (totalMovies || 1)
  ).toFixed(1);
  
  const genreCounts = {};
  filteredMovies.forEach(movie => {
    movie.Genre.split(", ").forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  return (
    <div className="app-container">
      <h1>Movie Finder</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select onChange={(e) => setSelectedGenre(e.target.value)}>
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Comedy">Comedy</option>
          <option value="Drama">Drama</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Horror">Horror</option>
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
      </div>

      {/* Summary Statistics */}
      {movies.length > 0 && (
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

      {/* Error Handling */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Movie Display */}
      <div className="movie-list">
        {filteredMovies.length > 0 ? (
          filteredMovies.map(movie => (
            <div key={movie.imdbID} className="movie-card">
              <h2>{movie.Title}</h2>
              <p><strong>Year:</strong> {movie.Year}</p>
              <p><strong>Genre:</strong> {movie.Genre}</p>
              <p><strong>IMDb Rating:</strong> {movie.imdbRating}</p>
              <p><strong>Runtime:</strong> {movie.Runtime}</p>
              <img src={movie.Poster} alt={movie.Title} />
              <p><strong>Plot:</strong> {movie.Plot}</p>
              <p><strong>Awards:</strong> {movie.Awards}</p>
            </div>
          ))
        ) : (
          <p>No movies found</p>
        )}
      </div>
    </div>
  );
}

export default App;
