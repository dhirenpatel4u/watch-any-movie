import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Watch() {
    const { id } = useParams();

    const [movies, setMovies] = useState([]);
    const [movie, setMovie] = useState(null);
    const [random, setRandom] = useState([]);
    const [loading, setLoading] = useState(true);

    // =====================================================
    // LOAD MOVIES + RANDOM RECOMMENDATIONS ONLY ONCE
    // =====================================================

    useEffect(() => {
        async function loadMovies() {
            try {
                setLoading(true);

                const response =
                    await fetch("/movies.json");

                if (!response.ok) {
                    throw new Error(
                        `Failed to load movies.json: ${response.status}`
                    );
                }

                const json =
                    await response.json();

                const data = Array.isArray(json)
                    ? json
                    : json.data || [];

                setMovies(data);

                // Generate random recommendations
                // ONLY when Watch page loads

                const shuffled = [...data].sort(
                    () => Math.random() - 0.5
                );

                const randomMovies =
                    shuffled
                        .filter(
                            (item) =>
                                item["IMDB ID"] !== id
                        )
                        .slice(0, 20);

                setRandom(randomMovies);

            } catch (error) {
                console.error(
                    "Failed to load movies:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    // =====================================================
    // CHANGE CURRENT MOVIE WHEN ID CHANGES
    // =====================================================

    useEffect(() => {
        if (!movies.length) return;

        const currentMovie =
            movies.find(
                (item) =>
                    item["IMDB ID"] === id
            );

        setMovie(currentMovie || null);

        // Recently watched

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

                recent =
                    recent.slice(0, 7);

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

    }, [id, movies]);

    // =====================================================
    // SIDEBAR
    // =====================================================

    const sidebarMovies = [
        movie,
        ...random.filter(
            (item) =>
                item["IMDB ID"] !==
                movie?.["IMDB ID"]
        ),
    ].filter(Boolean);

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    // =====================================================
    // NOT FOUND
    // =====================================================

    if (!movie) {
        return (
            <div className="loading">
                Movie Not Found
            </div>
        );
    }

    return (
        <div className="watch-container">

            {/* ==========================================
                PLAYER
            ========================================== */}

            <div className="player-section">

                <iframe
                    src={`https://slast430did.com/play/${id}`}
                    title={movie["Movie Name"]}
                    allowFullScreen
                />

                {/* Movie Title */}

                <h1>
                    {movie["Movie Name"]}
                </h1>

                {/* Year */}

                <p className="movie-year">
                    {movie.Year}
                </p>

                <div className="movie-description-actors-space"></div>

                {/* Description */}

                {movie.Description && (
                    <p className="movie-description">
                        {movie.Description}
                    </p>
                )}

                <div className="movie-description-actors-space"></div>

                {/* ==================================
                    ACTORS
                ================================== */}

                {movie.Actors &&
                    movie.Actors.length > 0 && (

                    <p className="movie-actors">

                        <strong>
                            Actors:
                        </strong>{" "}

                        {movie.Actors.map(
                            (actor, index) => (
                                <span
                                    key={actor}
                                >
                                    <Link
                                        to={`/actor/${encodeURIComponent(
                                            actor
                                        )}`}
                                        className="actor-link"
                                    >
                                        {actor}
                                    </Link>

                                    {index <
                                        movie.Actors.length -
                                            1 &&
                                        ", "}
                                </span>
                            )
                        )}

                    </p>
                )}

                <div className="movie-actors-bottom-space"></div>

            </div>

            {/* ==========================================
                YOU MAY ALSO LIKE
            ========================================== */}

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

                                {item[
                                    "IMDB ID"
                                ] === id && (
                                    <div className="play-icon">
                                        ▶
                                    </div>
                                )}

                            </div>

                            {/* Information */}

                            <div className="side-info">

                                <h3>
                                    {
                                        item[
                                            "Movie Name"
                                        ]
                                    }
                                </h3>

                                {/* Clickable Actors */}

                                {item.Actors &&
                                    item.Actors.length >
                                        0 && (

                                    <span className="side-actors">

                                        {item.Actors.map(
                                            (
                                                actor,
                                                index
                                            ) => (
                                                <span
                                                    key={
                                                        actor
                                                    }
                                                >
                                                    <Link
                                                        to={`/actor/${encodeURIComponent(
                                                            actor
                                                        )}`}
                                                        className="actor-link"
                                                        onClick={(
                                                            e
                                                        ) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        {
                                                            actor
                                                        }
                                                    </Link>

                                                    {index <
                                                        item
                                                            .Actors
                                                            .length -
                                                            1 &&
                                                        ", "}
                                                </span>
                                            )
                                        )}

                                    </span>
                                )}

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
