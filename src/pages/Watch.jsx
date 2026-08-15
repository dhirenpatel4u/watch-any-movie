import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Watch() {
    const { id } = useParams();

    const [movies, setMovies] = useState([]);
    const [movie, setMovie] = useState(null);
    const [random, setRandom] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMovies() {
            try {
                setLoading(true);

                const response = await fetch("/movies.json");

                if (!response.ok) {
                    throw new Error(
                        `Failed to load movies.json: ${response.status}`
                    );
                }

                const json = await response.json();

                const data = Array.isArray(json)
                    ? json
                    : json.data || [];

                setMovies(data);

                const currentMovie = data.find(
                    (m) => m["IMDB ID"] === id
                );

                setMovie(currentMovie);

                // -------------------------------------------------
                // Recently Watched
                // -------------------------------------------------

                if (currentMovie) {
                    try {
                        const stored =
                            localStorage.getItem(
                                "recently_watched"
                            );

                        let recent = stored
                            ? JSON.parse(stored)
                            : [];

                        recent = recent.filter(
                            (item) =>
                                item["IMDB ID"] !==
                                currentMovie["IMDB ID"]
                        );

                        recent.unshift(currentMovie);

                        recent = recent.slice(0, 7);

                        localStorage.setItem(
                            "recently_watched",
                            JSON.stringify(recent)
                        );
                    } catch (error) {
                        console.error(
                            "Failed to save recently watched:",
                            error
                        );
                    }
                }

                // -------------------------------------------------
                // You May Also Like
                //
                // Generate RANDOM list only when Watch.jsx loads.
                // Do NOT regenerate when changing movie.
                // -------------------------------------------------

                const shuffled = [...data].sort(
                    () => Math.random() - 0.5
                );

                const randomMovies = shuffled
                    .filter(
                        (m) =>
                            m["IMDB ID"] !== id
                    )
                    .slice(0, 20);

                setRandom(randomMovies);
            } catch (error) {
                console.error(
                    "Failed to load movies:",
                    error
                );

                setMovies([]);
                setMovie(null);
            } finally {
                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    // -------------------------------------------------
    // Current movie is always shown first.
    //
    // Random movies remain exactly the same when
    // navigating between movies because random[]
    // is NOT regenerated when id changes.
    // -------------------------------------------------

    const sidebarMovies = [
        movie,
        ...random.filter(
            (item) =>
                item["IMDB ID"] !==
                movie?.["IMDB ID"]
        ),
    ].filter(Boolean);

    if (loading) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="loading">
                Movie Not Found
            </div>
        );
    }

    return (
        <div className="watch-container">

            {/* =========================
                PLAYER SECTION
            ========================= */}

            <div className="player-section">

                <iframe
                    src={`https://gemma416okl.com/play/${id}`}
                    title={movie["Movie Name"]}
                    allowFullScreen
                />

                <h1>
                    {movie["Movie Name"]}
                </h1>

                {/* Year */}

                <p className="movie-year">
                    {movie.Year}
                </p>

                {/* Space */}

                <div className="movie-description-actors-space"></div>

                {/* Description */}

                {movie.Description && (
                    <p className="movie-description">
                        {movie.Description}
                    </p>
                )}

                {/* Space between Description and Actors */}

                <div className="movie-description-actors-space"></div>

                {/* Actors */}

                {movie.Actors &&
                    movie.Actors.length > 0 && (
                        <p className="movie-actors">
                            <strong>
                                Actors:
                            </strong>{" "}
                            {movie.Actors.join(", ")}
                        </p>
                    )}

                {/* Two-line space after Actors */}

                <div className="movie-actors-bottom-space"></div>

            </div>

            {/* =========================
                YOU MAY ALSO LIKE
            ========================= */}

            <div className="sidebar">

                <h2>
                    You May Also Like
                </h2>

                {sidebarMovies.map(
                    (item) => (
                        <Link
                            key={
                                item["IMDB ID"]
                            }
                            to={`/watch/${item["IMDB ID"]}`}
                            className={`side-card ${
                                item["IMDB ID"] === id
                                    ? "active"
                                    : ""
                            }`}
                        >

                            {/* Poster */}

                            <div className="poster-wrapper">

                                <img
                                    src={item.Poster}
                                    alt={
                                        item[
                                            "Movie Name"
                                        ]
                                    }
                                />

                                {/* Play icon only
                                    on current movie */}

                                {item[
                                    "IMDB ID"
                                ] === id && (
                                    <div className="play-icon">
                                        ▶
                                    </div>
                                )}

                            </div>

                            {/* Movie information */}

                            <div className="side-info">

                                <h3>
                                    {
                                        item[
                                            "Movie Name"
                                        ]
                                    }
                                </h3>

                                {/* Actors */}

                                {item.Actors &&
                                    item.Actors.length >
                                        0 && (
                                        <span className="side-actors">
                                            {item.Actors.join(
                                                ", "
                                            )}
                                        </span>
                                    )}

                                {/* Year */}

                                <p>
                                    {item.Year}
                                </p>

                            </div>

                        </Link>
                    )
                )}

            </div>

        </div>
    );
}
