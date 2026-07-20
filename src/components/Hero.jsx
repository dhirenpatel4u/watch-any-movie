import { Link } from "react-router-dom";

export default function Hero({
    movies,
}) {
    if (!movies.length)
        return null;

    return (
        <div className="hero">
            {movies.map(
                (
                    movie,
                    index
                ) => (
                    <Link
                        key={
                            movie[
                                "IMDB ID"
                            ]
                        }
                        to={`/watch/${movie["IMDB ID"]}`}
                        className={
                            index === 0
                                ? "hero-main"
                                : "hero-small"
                        }
                    >
                        <img
                            src={`https://m.media-amazon.com/images/M/${movie.Poster}`}
                            alt={
                                movie[
                                    "Movie Name"
                                ]
                            }
                        />

                        <div className="hero-info">
                            <h2>
                                {
                                    movie[
                                        "Movie Name"
                                    ]
                                }
                            </h2>

                            <p>
                                {
                                    movie[
                                        "Stream URL"
                                    ]
                                }
                            </p>

                            <button>
                                Watch
                                Now
                            </button>
                        </div>
                    </Link>
                )
            )}
        </div>
    );
}
