import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// =====================================================
// UPDATE MOVIE PAGE METADATA
// =====================================================

function updateMovieMetadata(movie, id) {
if (!movie || !id) {
return;
}

const title =
    movie["Movie Name"] ||
    "Watch Any Movies";

const year =
    movie.Year || "";

const fullTitle =
    `${title}${year ? ` (${year})` : ""} - Watch Any Movies`;

const description =
    movie.Description ||
    `Watch ${title} online.`;

let poster =
    movie.Poster || "";

const movieUrl =
    `${window.location.origin}/watch/${encodeURIComponent(id)}`;

// =================================================
// MAKE POSTER URL ABSOLUTE
// =================================================

if (
    poster &&
    poster.startsWith("/")
) {
    poster =
        `${window.location.origin}${poster}`;
}

// =================================================
// PAGE TITLE
// =================================================

document.title =
    fullTitle;

// =================================================
// META HELPER
// =================================================

function setMeta(
    selector,
    attribute,
    value
) {
    let element =
        document.head.querySelector(
            selector
        );

    if (!element) {
        element =
            document.createElement(
                "meta"
            );

        element.setAttribute(
            attribute,
            value
        );

        document.head.appendChild(
            element
        );
    }

    element.setAttribute(
        "content",
        value
    );
}

// =================================================
// DESCRIPTION
// =================================================

setMeta(
    'meta[name="description"]',
    "name",
    description
);

// =================================================
// OPEN GRAPH
// =================================================

setMeta(
    'meta[property="og:type"]',
    "property",
    "video.movie"
);

setMeta(
    'meta[property="og:title"]',
    "property",
    fullTitle
);

setMeta(
    'meta[property="og:description"]',
    "property",
    description
);

setMeta(
    'meta[property="og:image"]',
    "property",
    poster
);

setMeta(
    'meta[property="og:image:alt"]',
    "property",
    title
);

setMeta(
    'meta[property="og:url"]',
    "property",
    movieUrl
);

setMeta(
    'meta[property="og:site_name"]',
    "property",
    "Watch Any Movies"
);

// =================================================
// OG IMAGE
// =================================================

setMeta(
    'meta[property="og:image:type"]',
    "property",
    "image/jpeg"
);

setMeta(
    'meta[property="og:image:width"]',
    "property",
    "500"
);

setMeta(
    'meta[property="og:image:height"]',
    "property",
    "750"
);

// =================================================
// TWITTER
// =================================================

setMeta(
    'meta[name="twitter:card"]',
    "name",
    "summary_large_image"
);

setMeta(
    'meta[name="twitter:title"]',
    "name",
    fullTitle
);

setMeta(
    'meta[name="twitter:description"]',
    "name",
    description
);

setMeta(
    'meta[name="twitter:image"]',
    "name",
    poster
);

setMeta(
    'meta[name="twitter:image:alt"]',
    "name",
    title
);

// =================================================
// CANONICAL
// =================================================

let canonical =
    document.head.querySelector(
        'link[rel="canonical"]'
    );

if (!canonical) {
    canonical =
        document.createElement(
            "link"
        );

    canonical.setAttribute(
        "rel",
        "canonical"
    );

    document.head.appendChild(
        canonical
    );
}

canonical.setAttribute(
    "href",
    movieUrl
);

}

// =====================================================
// WATCH PAGE
// =====================================================

export default function Watch() {
const { id } =
useParams();

const [movies, setMovies] =
    useState([]);

const [movie, setMovie] =
    useState(null);

const [random, setRandom] =
    useState([]);

const [loading, setLoading] =
    useState(true);

// =================================================
// LOAD MOVIES
// =================================================

useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
        try {
            setLoading(true);

            const response =
                await fetch(
                    "/movies.json",
                    {
                        cache: "no-store"
                    }
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

            // =========================================
            // RANDOM RECOMMENDATIONS
            // =========================================

            const shuffled =
                [...data].sort(
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
                            ) !==
                            String(id)
                    )
                    .slice(0, 20);

            setRandom(
                randomMovies
            );

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

// =================================================
// CHANGE MOVIE WHEN URL ID CHANGES
// =================================================

useEffect(() => {
    if (!movies.length) {
        return;
    }

    const currentMovie =
        movies.find(
            (item) =>
                String(
                    item["IMDB ID"]
                ) ===
                String(id)
        );

    setMovie(
        currentMovie || null
    );

    // =============================================
    // UPDATE BROWSER METADATA
    // =============================================

    if (currentMovie) {
        updateMovieMetadata(
            currentMovie,
            id
        );
    }

    // =============================================
    // RECENTLY WATCHED
    // =============================================

    if (currentMovie) {
        try {
            const stored =
                localStorage.getItem(
                    "recently_watched"
                );

            let recent =
                stored
                    ? JSON.parse(stored)
                    : [];

            recent =
                recent.filter(
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
                recent.slice(
                    0,
                    7
                );

            localStorage.setItem(
                "recently_watched",
                JSON.stringify(
                    recent
                )
            );

        } catch (error) {
            console.error(
                "Failed to save recently watched:",
                error
            );
        }
    }

}, [id, movies]);

// =================================================
// SIDEBAR
// =================================================

const sidebarMovies = [
    movie,
    ...random.filter(
        (item) =>
            String(
                item["IMDB ID"]
            ) !==
            String(
                movie?.["IMDB ID"]
            )
    )
].filter(Boolean);

// =================================================
// LOADING
// =================================================

if (loading) {
    return (
        <div className="loading">
            Loading Movies...
        </div>
    );
}

// =================================================
// NOT FOUND
// =================================================

if (!movie) {
    return (
        <div className="loading">
            Movie Not Found
        </div>
    );
}

// =================================================
// RENDER
// =================================================

return (
    <div className="watch-container">

        {/* ==========================================
            PLAYER
        ========================================== */}

        <div className="player-section">

            <iframe
                src={`https://slast430did.com/play/${id}`}
                title={
                    movie["Movie Name"]
                }
                allowFullScreen
            />

            {/* Movie Title */}

            <h1>
                {
                    movie[
                        "Movie Name"
                    ]
                }
            </h1>

            {/* Year */}

            <p className="movie-year">
                {movie.Year}
            </p>

            <div className="movie-description-actors-space"></div>

            {/* Description */}

            {movie.Description && (
                <p className="movie-description">
                    {
                        movie.Description
                    }
                </p>
            )}

            <div className="movie-description-actors-space"></div>

            {/* ==================================
                ACTORS
            ================================== */}

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
                                    {
                                        actor
                                    }
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
                            item[
                                "IMDB ID"
                            ]
                        }
                        to={`/watch/${encodeURIComponent(
                            item["IMDB ID"]
                        )}`}
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

                        {/* Poster */}

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
                                                    item.Actors.length -
                                                        1 &&
                                                    ", "}

                                            </span>
                                        )
                                    )}

                                </span>
                            )}

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

    </div>
);

}
