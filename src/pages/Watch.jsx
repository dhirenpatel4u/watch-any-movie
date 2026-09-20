import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Watch.css";

export default function Watch() {
    const { id } = useParams();

    // =====================================================
    // GET CACHED MOVIES
    // =====================================================

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

    // =====================================================
    // STATE
    // =====================================================

    const [movies, setMovies] =
        useState(initialMovies);

    const [movie, setMovie] =
        useState(null);

    const [random, setRandom] =
        useState([]);

    const [loading, setLoading] =
        useState(
            initialMovies.length === 0
        );

    const [playerLoaded, setPlayerLoaded] =
        useState(false);

    /*
     * Is browser fullscreen active?
     */
    const [isFullscreen, setIsFullscreen] =
        useState(false);

    /*
     * Is viewport landscape?
     */
    const [isLandscape, setIsLandscape] =
        useState(
            typeof window !== "undefined"
                ? window.innerWidth >
                  window.innerHeight
                : false
        );

    /*
     * Recommendation panel.
     */
    const [showRecommendations, setShowRecommendations] =
        useState(false);

    // =====================================================
    // RESET WHEN MOVIE CHANGES
    // =====================================================

    useEffect(() => {
        setPlayerLoaded(false);
        setShowRecommendations(false);
    }, [id]);

    // =====================================================
    // FULLSCREEN + ORIENTATION DETECTION
    // =====================================================

    useEffect(() => {
        const updateDisplayState = () => {
            const fullscreenElement =
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement;

            /*
             * Normal browser fullscreen detection.
             */
            const browserFullscreen =
                !!fullscreenElement;

            /*
             * Fallback detection.
             *
             * Some iframe players don't correctly
             * expose fullscreenElement to the parent.
             */
            const fullscreenBySize =
                window.innerHeight >=
                window.screen.height * 0.90;

            const fullscreen =
                browserFullscreen ||
                fullscreenBySize;

            const landscape =
                window.innerWidth >
                window.innerHeight;

            setIsFullscreen(fullscreen);
            setIsLandscape(landscape);

            /*
             * Close panel when fullscreen ends.
             */
            if (!fullscreen) {
                setShowRecommendations(false);
            }
        };

        updateDisplayState();

        document.addEventListener(
            "fullscreenchange",
            updateDisplayState
        );

        document.addEventListener(
            "webkitfullscreenchange",
            updateDisplayState
        );

        document.addEventListener(
            "mozfullscreenchange",
            updateDisplayState
        );

        document.addEventListener(
            "MSFullscreenChange",
            updateDisplayState
        );

        window.addEventListener(
            "resize",
            updateDisplayState
        );

        window.addEventListener(
            "orientationchange",
            updateDisplayState
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                updateDisplayState
            );

            document.removeEventListener(
                "webkitfullscreenchange",
                updateDisplayState
            );

            document.removeEventListener(
                "mozfullscreenchange",
                updateDisplayState
            );

            document.removeEventListener(
                "MSFullscreenChange",
                updateDisplayState
            );

            window.removeEventListener(
                "resize",
                updateDisplayState
            );

            window.removeEventListener(
                "orientationchange",
                updateDisplayState
            );
        };
    }, []);

    // =====================================================
    // ESCAPE KEY
    // =====================================================

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowRecommendations(false);
            }
        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    // =====================================================
    // DEVICE DETECTION
    // =====================================================

    const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia(
            "(max-width: 768px)"
        ).matches;

    /*
     * DESKTOP:
     * fullscreen = button visible
     *
     * MOBILE:
     * fullscreen + landscape = button visible
     *
     * MOBILE PORTRAIT:
     * button hidden
     */
    const showFullscreenRecommendation =
        isFullscreen &&
        (
            !isMobile ||
            isLandscape
        );

    // =====================================================
    // FIND CURRENT MOVIE
    // =====================================================

    useEffect(() => {
        if (!movies.length) {
            return;
        }

        const currentMovie =
            movies.find(
                (item) =>
                    String(
                        item["IMDB ID"]
                    ) === String(id)
            );

        setMovie(
            currentMovie || null
        );

        // ================================================
        // RECENTLY WATCHED
        // ================================================

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
                            currentMovie[
                                "IMDB ID"
                            ]
                        )
                );

                recent.unshift(
                    currentMovie
                );

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

        // ================================================
        // RANDOM RECOMMENDATIONS
        // ================================================

        const shuffled =
            [...movies].sort(
                () =>
                    Math.random() -
                    0.5
            );

        const randomMovies =
            shuffled
                .filter(
                    (item) =>
                        String(
                            item["IMDB ID"]
                        ) !== String(id)
                )
                .slice(0, 20);

        setRandom(
            randomMovies
        );
    }, [id, movies]);

    // =====================================================
    // LOAD MOVIES
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        async function loadMovies() {
            try {
                const response =
                    await fetch(
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
    // NORMAL SIDEBAR
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

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="watch-container">

            {/* ==========================================
                PLAYER SECTION
            ========================================== */}

            <div className="player-section">

                <div className="watch-player-wrapper">

                    {/* ==================================
                        BLACK LOADING SCREEN
                    ================================== */}

                    {!playerLoaded && (
                        <div className="watch-player-loading" />
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
                            setPlayerLoaded(
                                true
                            )
                        }
                        className="watch-player-iframe"
                    />

                    {/* ==================================
                        FULLSCREEN BUTTON
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
                            <span className="recommendation-heart">
                                ♡
                            </span>

                            <span>
                                You May Also Like
                            </span>
                        </button>
                    )}

                    {/* ==================================
                        RECOMMENDATION PANEL
                    ================================== */}

                    {showFullscreenRecommendation &&
                        showRecommendations && (
                            <>
                                {/* ==================================
                                    BACKDROP
                                ================================== */}

                                <div
                                    className="recommendation-overlay"
                                    onClick={() =>
                                        setShowRecommendations(
                                            false
                                        )
                                    }
                                />

                                {/* ==================================
                                    RIGHT PANEL
                                ================================== */}

                                <aside className="fullscreen-recommendation-panel">

                                    {/* HEADER */}

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

                                    {/* MOVIES */}

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
                    movie.Actors.length >
                        0 && (
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
                                        key={
                                            actor
                                        }
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
                NORMAL SIDEBAR
            ========================================== */}

            <div className="sidebar">

                <h2>
                    You May Also Like
                </h2>

                {sidebarMovies.map(
                    (item) => (
                        <Link
                            key={
                                item[
                                    "IMDB ID"
                                ]
                            }
                            to={`/watch/${item["IMDB ID"]}`}
                            className={`side-card ${
                                String(
                                    item[
                                        "IMDB ID"
                                    ]
                                ) ===
                                String(id)
                                    ? "active"
                                    : ""
                            }`}
                        >

                            <div className="poster-wrapper">

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

                                {String(
                                    item[
                                        "IMDB ID"
                                    ]
                                ) ===
                                    String(id) && (
                                    <div className="play-icon">
                                        ▶
                                    </div>
                                )}

                            </div>

                            <div className="side-info">

                                <h3>
                                    {
                                        item[
                                            "Movie Name"
                                        ]
                                    }
                                </h3>

                                {item.Actors &&
                                    item.Actors
                                        .length >
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
