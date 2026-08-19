import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Recent() {
    const [recentMovies, setRecentMovies] =
        useState([]);

    useEffect(() => {
        try {
            const stored =
                localStorage.getItem(
                    "recently_watched"
                );

            if (stored) {
                setRecentMovies(
                    JSON.parse(stored)
                );
            }
        } catch (error) {
            console.error(
                "Failed to load recently watched:",
                error
            );
        }
    }, []);

    if (
        !recentMovies ||
        recentMovies.length === 0
    ) {
        return null;
    }

    return (
        <section className="movie-section recent-section">
            <h2>Recently Watched</h2>

            <div className="recent-grid">
                {recentMovies.map((movie) => (
                    <Link
                        key={movie["IMDB ID"]}
                        to={`/watch/${movie["IMDB ID"]}`}
                        className="recent-card"
                    >
                        <img
                            src={movie.Poster}
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
