import { Link } from "react-router-dom";

export default function Recent({ movies }) {
    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <section className="movie-section recent-section">
            <h2>Recently Watched</h2>

            <div className="recent-grid">
                {movies.map((movie) => (
                    <Link
                        key={movie["IMDB ID"]}
                        to={`/watch/${movie["IMDB ID"]}`}
                        className="recent-card"
                    >
                        <img
                            src={`https://m.media-amazon.com/images/M/${movie.Poster}`}
                            alt={movie["Movie Name"]}
                            loading="lazy"
                        />

                        <div className="recent-info">
                            <h3>
                                {movie["Movie Name"]}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
