import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OMDB_API_KEY;

    if (!apiKey) {
      console.error("❌ API Key is missing! Make sure it's set in .env and restart React.");
      setError("API Key is missing!");
      return;
    }

    const movieTitles = ['Inception', 'The Matrix', 'Interstellar', 'The Dark Knight']; // Example movie titles

    const fetchMovies = async () => {
      try {
        const fetchedMovies = await Promise.all(
          movieTitles.map(async (title) => {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${title}`);
            const data = await response.json();
            return data.Response === "True" ? data : null;
          })
        );
        const validMovies = fetchedMovies.filter(movie => movie !== null);
        setMovies(validMovies);
        setFilteredMovies(validMovies);
      } catch (fetchError) {
        console.error("❌ Fetch error:", fetchError);
        setError("Failed to fetch movie data");
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const filtered = movies.filter(movie => {
      return (
        movie.Title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (genreFilter ? movie.Genre.toLowerCase().includes(genreFilter.toLowerCase()) : true)
      );
    });
    setFilteredMovies(filtered);
  }, [searchQuery, genreFilter, movies]);

  return (
    <>
      <h1>Pet Finder Plus</h1>
      <div className="card">
        <input
          type="text"
          placeholder="Search by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by genre"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        />
      </div>
      
      {/* Error Handling */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Movies Display */}
      {filteredMovies.length > 0 ? (
        filteredMovies.map((movie) => (
          <div key={movie.imdbID} className="movie-info">
            <h2>{movie.Title}</h2>
            <p><strong>Year:</strong> {movie.Year}</p>
            <p><strong>Rating:</strong> {movie.Rated}</p>
            <p><strong>Genre:</strong> {movie.Genre}</p>
            <p><strong>Runtime:</strong> {movie.Runtime}</p>
            <p><strong>Actors:</strong> {movie.Actors}</p>
            <p><strong>Plot:</strong> {movie.Plot}</p>
            <img src={movie.Poster} alt={`${movie.Title} Poster`} />
            <p><strong>Awards:</strong> {movie.Awards}</p>
          </div>
        ))
      ) : (
        <p>No movies found</p>
      )}
    </>
  );
}

export default App;
