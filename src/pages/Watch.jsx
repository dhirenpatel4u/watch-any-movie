import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Watch.css";

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
     * Controls movies.json loading.
     */
    const [loading, setLoading] = useState(
        initialMovies.length === 0
    );

    /*
     * Controls iframe visibility.
     */
    const [playerLoaded, setPlayerLoaded] = useState(false);

    /*
     * Controls fullscreen state.
     */
    const [isFullscreen, setIsFullscreen] =
        useState(false);

    /*
     * Controls mobile landscape state.
     */
    const [isLandscape, setIsLandscape] =
        useState(
            typeof window !== "undefined"
                ? window.innerWidth >
                      window.innerHeight
                : false
        );

    /*
     * Controls recommendation panel.
     */
    const [showRecommendations, setShowRecommendations] =
        useState(false);

    // =====================================================
    // RESET PLAYER WHEN MOVIE CHANGES
    // =====================================================

    useEffect(() => {
        setPlayerLoaded(false);
        setShowRecommendations(false);
    }, [id]);

    // =====================================================
    // FULLSCREEN DETECTION
    // =====================================================

    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenElement =
                document.fullscreenElement ||
                document.webkitFullscreenElement;

            const fullscreen = !!fullscreenElement;

            setIsFullscreen(fullscreen);

            /*
             * Automatically close recommendations
             * when fullscreen ends.
             */
            if (!fullscreen) {
                setShowRecommendations(false);
            }
        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        document.addEventListener(
            "webkitfullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );

            document.removeEventListener(
                "webkitfullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    // =====================================================
    // MOBILE ORIENTATION DETECTION
    // =====================================================

    useEffect(() => {
        const handleOrientation = () => {
            setIsLandscape(
                window.innerWidth >
                    window.innerHeight
            );
        };

        handleOrientation();

        window.addEventListener(
            "resize",
            handleOrientation
        );

        window.addEventListener(
            "orientationchange",
            handleOrientation
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleOrientation
            );

            window.removeEventListener(
                "orientationchange",
                handleOrientation
            );
        };
    }, []);

    // =====================================================
    // ESCAPE KEY
    // =====================================================

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setShowRecommendations(false);
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);

    // =====================================================
    // DETERMINE WHETHER BUTTON SHOULD SHOW
    // =====================================================

    const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia(
            "(max-width: 768px)"
        ).matches;

    /*
     * Desktop:
     *   Fullscreen = show
     *
     * Mobile:
     *   Fullscreen + landscape = show
     *   Fullscreen + portrait = hide
     */
    const showFullscreenRecommendation =
        isFullscreen &&
        (!isMobile || isLandscape);

    // =====================================================
    // FIND CURRENT MOVIE
    // =====================================================

    useEffect(() => {
        if (!movies.length) {
            return;
        }

        const currentMovie = movies.find(
            (item) =>
                String(item["IMDB ID"]) ===
                String(id)
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

                if (cancelled) {
                    return;
                }

                setMovies(data);

                /*
                 * Keep Home and Watch cache synchronized.
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
    // MOVIE NOT FOUND
    // =====================================================

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

                <div
                    className="watch-player-wrapper"
                >

                    {/* ==================================
                        BLACK LOADING SCREEN
                    ================================== */}

                    {!playerLoaded && (
                        <div
                            className="watch-player-loading"
                        />
                    )}

                    {/* ==================================
                        EXTERNAL PLAYER
                    ================================== */}

                    <iframe
                        key={id}
                        src={`https://slast430did.com/play/${id}`}
                        title={movie["Movie Name"]}
                        allowFullScreen
                        onLoad={() =>
                            setPlayerLoaded(true)
                        }
                        className="watch-player-iframe"
                    />

                    {/* ==================================
                        YOU MAY ALSO LIKE BUTTON

                        Desktop:
                        Fullscreen only

                        Mobile:
                        Fullscreen + landscape only
                    ================================== */}

                    {showFullscreenRecommendation && (
                        <button
                            type="button"
                            className="fullscreen-recommendation-button"
                            onClick={() =>
                                setShowRecommendations(
                                    (value) =>
                                        !value
                                )
                            }
                        >
                            <span>
                                ♡
                            </span>

                            <span>
                                You May Also Like
                            </span>
                        </button>
                    )}

                    {/* ==================================
                        FULLSCREEN RECOMMENDATION PANEL
                    ================================== */}

                    {showFullscreenRecommendation &&
                        showRecommendations && (
                            <>
                                {/* Transparent area
                                    behind panel */}

                                <div
                                    className="recommendation-overlay"
                                    onClick={() =>
                                        setShowRecommendations(
                                            false
                                        )
                                    }
                                />

                                {/* Right panel */}

                                <aside
                                    className="fullscreen-recommendation-panel"
                                >

                                    {/* Header */}

                                    <div className="recommendation-panel-header">

                                        <h2>
                                            You May Also Like
                                        </h2>

                                        <button
                                            type="button"
                                            className="recommendation-close"
                                            onClick={() =>
                                                setShowRecommendations(
                                                    false
                                                )
                                            }
                                            aria-label="Close recommendations"
                                        >
                                            ×
                                        </button>

                                    </div>

                                    {/* Movies */}

                                    <div className="recommendation-panel-list">

                                        {random.map(
                                            (item) => (
                                                <Link
                                                    key={
                                                        item[
                                                            "IMDB ID"
                                                        ]
                                                    }
                                                    to={`/watch/${item["IMDB ID"]}`}
                                                    className="fullscreen-recommendation-card"
                                                    onClick={() =>
                                                        setShowRecommendations(
                                                            false
                                                        )
                                                    }
                                                >

                                                    <img
                                                        src={
                                                            item.Poster
                                                        }
                                                        alt={
                                                            item[
                                                                "Movie Name"
                                                            ]
                                                        }
                                                    />

                                                    <div className="fullscreen-recommendation-info">

                                                        <h3>
                                                            {
                                                                item[
                                                                    "Movie Name"
                                                                ]
                                                            }
                                                        </h3>

                                                        <p>
                                                            {
                                                                item.Year
                                                            }
                                                        </p>

                                                    </div>

                                                </Link>
                                            )
                                        )}

                                    </div>

                                </aside>
                            </>
                        )}

                </div>

                {/* ==========================================
                    MOVIE TITLE
                ========================================== */}

                <h1>
                    {movie["Movie Name"]}
                </h1>

                {/* ==========================================
                    YEAR
                ========================================== */}

                <p className="movie-year">
                    {movie.Year}
                </p>

                <div className="movie-description-actors-space"></div>

                {/* ==========================================
                    DESCRIPTION
                ========================================== */}

                {movie.Description && (
                    <p className="movie-description">
                        {movie.Description}
                    </p>
                )}

                <div className="movie-description-actors-space"></div>

                {/* ==========================================
                    ACTORS
                ========================================== */}

                {movie.Actors &&
                    movie.Actors.length > 0 && (
                        <p className="movie-actors">

                            <strong>
                                Actors:
                            </strong>{" "}

                            {movie.Actors.map(
                                (
                                    actor,
                                    index
                                ) => (
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
                NORMAL PAGE SIDEBAR
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

                                {/* Actors */}

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
