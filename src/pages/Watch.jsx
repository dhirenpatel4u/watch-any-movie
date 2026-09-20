import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Watch() {
    const { id } = useParams();

    /*
     * Get cached movies from Home.
     */
    const getCachedMovies = () => {
        try {
            const saved =
                sessionStorage.getItem("home_movies");

            if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch {
            // Ignore cache errors
        }

        return [];
    };

    const initialMovies = getCachedMovies();

    const [movies, setMovies] = useState(initialMovies);
    const [movie, setMovie] = useState(null);
    const [random, setRandom] = useState([]);

    /*
     * If cached movies exist, we don't need to
     * wait before showing the movie.
     *
     * If there is no cache, loading starts as true.
     */
    const [loading, setLoading] = useState(
        initialMovies.length === 0
    );

    // =====================================================
    // FIND CURRENT MOVIE
    // =====================================================

    useEffect(() => {
        /*
         * Don't try to find the movie until we
         * actually have movie data.
         */
        if (!movies.length) {
            return;
        }

        const currentMovie = movies.find(
            (item) =>
                String(item["IMDB ID"]) === String(id)
        );

        setMovie(currentMovie || null);

        /*
         * Recently watched
         */
        if (currentMovie) {
            try {
                const stored =
                    localStorage.getItem(
                        "recently_watched"
                    );

                let recent = stored
                    ? JSON.parse(stored)
                    : [];

                if (!Array.isArray(recent)) {
                    recent = [];
                }

                recent = recent.filter(
                    (item) =>
                        String(
                            item["IMDB ID"]
                        ) !==
                        String(
                            currentMovie["IMDB ID"]
                        )
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

        /*
         * Generate random recommendations.
         */
        const shuffled = [...movies].sort(
            () => Math.random() - 0.5
        );

        const randomMovies = shuffled
            .filter(
                (item) =>
                    String(
                        item["IMDB ID"]
                    ) !== String(id)
            )
            .slice(0, 20);

        setRandom(randomMovies);
    }, [id, movies]);

    // =====================================================
    // LOAD FRESH MOVIES
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        async function loadMovies() {
            try {
                const response = await fetch(
                    "/movies.json"
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load movies.json: ${response.status}`
                    );
                }

                const json =
                    await response.json();

                const data =
                    Array.isArray(json)
                        ? json
                        : json.data || [];

                /*
                 * Don't update state if the component
                 * has already unmounted.
                 */
                if (cancelled) {
                    return;
                }

                /*
                 * Update movie list.
                 *
                 * If cached data already exists,
                 * this happens silently.
                 */
                setMovies(data);

                /*
                 * Keep Home and Watch cache
                 * synchronized.
                 */
                try {
                    sessionStorage.setItem(
                        "home_movies",
                        JSON.stringify(data)
                    );
                } catch {
                    // Ignore storage errors
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Failed to load movies:",
                        error
                    );
                }
            } finally {
                if (!cancelled) {
                    /*
                     * IMPORTANT:
                     * Only after movies.json has finished
                     * loading do we allow "Movie Not Found"
                     * to appear.
                     */
                    setLoading(false);
                }
            }
        }

        loadMovies();

        return () => {
            cancelled = true;
        };
    }, []);

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
    // LOADING / NOT FOUND
    // =====================================================

    /*
     * IMPORTANT:
     *
     * While movies.json is loading, NEVER show
     * "Movie Not Found".
     *
     * This prevents the fake error from flashing
     * before the movie data is available.
     */
    if (loading) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    /*
     * At this point movies.json has finished loading.
     *
     * If the movie still doesn't exist, it is a
     * genuine "Movie Not Found" situation.
     */
    if (!movie) {
        return (
            <div className="loading">
                Movie Not Found
            </div>
        );
    }

    // =====================================================
    // WATCH PAGE
    // =====================================================

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
                                String(
                                    item["IMDB ID"]
                                ) === String(id)
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

                                {String(
                                    item["IMDB ID"]
                                ) === String(id) && (
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
