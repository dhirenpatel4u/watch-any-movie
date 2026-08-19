import {
    useEffect,
    useState
} from "react";

import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";
import Recent from "../components/Recent";

export default function Home({ search }) {
    const [movies, setMovies] = useState([]);
    const [heroMovies, setHeroMovies] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [page, setPage] =
        useState(1);

    // Mobile infinite-scroll count
    const [mobileCount, setMobileCount] =
        useState(40);

    const [isMobile, setIsMobile] =
        useState(
            window.innerWidth <= 768
        );

    /*
     * Detect mobile / desktop
     */
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(
                window.innerWidth <= 768
            );
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, []);

    /*
     * Load movies
     */
    useEffect(() => {
        async function loadMovies() {
            try {
                /*
                 * Detect incognito/private mode
                 */
                async function isIncognito() {
                    try {
                        const { quota } =
                            await navigator.storage.estimate();

                        return (
                            quota <
                            120000000
                        );
                    } catch {
                        return false;
                    }
                }

                const incognito =
                    await isIncognito();

                const storage =
                    incognito
                        ? sessionStorage
                        : localStorage;

                const CACHE_KEY =
                    "movies";

                const CACHE_TIME =
                    "movies_time";

                const cached =
                    storage.getItem(
                        CACHE_KEY
                    );

                const cachedTime =
                    storage.getItem(
                        CACHE_TIME
                    );

                const now =
                    Date.now();

                /*
                 * Use cached movies
                 */
                if (
                    cached &&
                    cachedTime &&
                    now -
                        Number(
                            cachedTime
                        ) <
                        24 *
                            60 *
                            60 *
                            1000
                ) {
                    const parsed =
                        JSON.parse(
                            cached
                        );

                    setMovies(parsed);

                    setHeroMovies(
                        [...parsed]
                            .sort(
                                () =>
                                    Math.random() -
                                    0.5
                            )
                            .slice(0, 5)
                    );

                    setLoading(false);

                    return;
                }

                /*
                 * Fetch movies.json
                 */
                const response =
                    await fetch(
                        "/movies.json"
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load movies.json"
                    );
                }

                const data =
                    await response.json();

                const movieData =
                    data.data ||
                    data;

                setMovies(movieData);

                setHeroMovies(
                    [...movieData]
                        .sort(
                            () =>
                                Math.random() -
                                0.5
                        )
                        .slice(0, 5)
                );

                /*
                 * Cache
                 */
                storage.setItem(
                    CACHE_KEY,
                    JSON.stringify(
                        movieData
                    )
                );

                storage.setItem(
                    CACHE_TIME,
                    now.toString()
                );

                setLoading(false);

            } catch (error) {
                console.error(
                    "Movie loading error:",
                    error
                );

                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    /*
     * Reset page when search changes
     */
    useEffect(() => {
        setPage(1);
        setMobileCount(40);
    }, [search]);

    /*
     * Restore previous Home scroll
     *
     * This happens after movies have loaded.
     */
    useEffect(() => {
        if (loading) return;

        const savedPosition =
            sessionStorage.getItem(
                "home_scroll_position"
            );

        if (!savedPosition) {
            return;
        }

        const position =
            Number(savedPosition);

        /*
         * Wait for cards/images to render
         */
        requestAnimationFrame(() => {
            setTimeout(() => {
                window.scrollTo({
                    top: position,
                    behavior: "instant"
                });
            }, 100);
        });

    }, [loading]);

    /*
     * Remember current Home scroll position
     */
    useEffect(() => {
        if (loading) return;

        let timeout;

        const saveScroll =
            () => {
                clearTimeout(timeout);

                timeout =
                    setTimeout(() => {
                        sessionStorage.setItem(
                            "home_scroll_position",
                            window.scrollY.toString()
                        );
                    }, 50);
            };

        window.addEventListener(
            "scroll",
            saveScroll,
            {
                passive: true
            }
        );

        return () => {
            clearTimeout(timeout);

            /*
             * Save final position
             * before leaving Home
             */
            sessionStorage.setItem(
                "home_scroll_position",
                window.scrollY.toString()
            );

            window.removeEventListener(
                "scroll",
                saveScroll
            );
        };
    }, [loading]);

    /*
     * Search
     */
    const filtered =
        movies.filter((movie) =>
            String(
                movie["Movie Name"] ||
                ""
            )
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    const isSearching =
        search.trim() !== "";

    /*
     * Latest
     *
     * First 12 movies from JSON
     * having Year 2026.
     */
    const latest =
        filtered
            .filter(
                (movie) =>
                    Number(
                        movie.Year
                    ) === 2026
            )
            .slice(0, 12);

    /*
     * Trending
     *
     * Random 12.
     *
     * IMPORTANT:
     * useMemo would be better here, but
     * this keeps your existing behavior.
     */
    const [trending, setTrending] =
        useState([]);

    useEffect(() => {
        if (!filtered.length) {
            setTrending([]);
            return;
        }

        setTrending(
            [...filtered]
                .sort(
                    () =>
                        Math.random() -
                        0.5
                )
                .slice(0, 12)
        );
    }, [movies, search]);

    /*
     * Desktop pagination
     *
     * 35 movies per page.
     */
    const DESKTOP_PER_PAGE = 35;

    const totalPages =
        Math.ceil(
            filtered.length /
                DESKTOP_PER_PAGE
        );

    const desktopMovies =
        filtered.slice(
            (page - 1) *
                DESKTOP_PER_PAGE,

            page *
                DESKTOP_PER_PAGE
        );

    /*
     * Mobile infinite scroll
     *
     * First 40
     * then 80
     * then 120...
     */
    const mobileMovies =
        filtered.slice(
            0,
            mobileCount
        );

    /*
     * Infinite scroll
     */
    useEffect(() => {
        if (!isMobile) return;
        if (isSearching) return;

        const handleScroll =
            () => {
                const scrollPosition =
                    window.innerHeight +
                    window.scrollY;

                const documentHeight =
                    document.documentElement
                        .scrollHeight;

                /*
                 * Start loading when
                 * 500px from bottom
                 */
                if (
                    documentHeight -
                        scrollPosition <
                    500
                ) {
                    setMobileCount(
                        (current) => {
                            if (
                                current >=
                                filtered.length
                            ) {
                                return current;
                            }

                            return Math.min(
                                current +
                                    40,
                                filtered.length
                            );
                        }
                    );
                }
            };

        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true
            }
        );

        return () => {
            window.removeEventListener(
                "scroll",
                handleScroll
            );
        };

    }, [
        isMobile,
        isSearching,
        filtered.length
    ]);

    if (loading) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    return (
        <>
            {!isSearching && (
                <Hero
                    shows={heroMovies}
                />
            )}

            <div className="container">

                {!isSearching && (
                    <>
                        {/* Recently Watched */}

                        <Recent />

                        {/* Latest */}

                        <div className="home-mobile-scroll-section">
                            <MovieSection
                                title="Latest"
                                movies={latest}
                            />
                        </div>

                        {/* Trending */}

                        <div className="home-mobile-scroll-section">
                            <MovieSection
                                title="Trending"
                                movies={trending}
                            />
                        </div>
                    </>
                )}

                {filtered.length === 0 ? (
                    <h2>
                        No movies found.
                    </h2>
                ) : (
                    <>
                        {/* ALL MOVIES */}

                        <div
                            className={
                                isMobile
                                    ? "mobile-all-movies"
                                    : ""
                            }
                        >
                            <MovieSection
                                title={
                                    isSearching
                                        ? `Search Results (${filtered.length})`
                                        : "All Movies"
                                }
                                movies={
                                    isMobile
                                        ? mobileMovies
                                        : desktopMovies
                                }
                            />
                        </div>

                        {/* Desktop pagination */}

                        {!isMobile &&
                            !isSearching &&
                            totalPages > 1 && (
                                <div className="pagination">

                                    <button
                                        disabled={
                                            page ===
                                            1
                                        }
                                        onClick={() =>
                                            setPage(
                                                page -
                                                    1
                                            )
                                        }
                                    >
                                        Previous
                                    </button>

                                    <span>
                                        {page} /{" "}
                                        {
                                            totalPages
                                        }
                                    </span>

                                    <button
                                        disabled={
                                            page ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setPage(
                                                page +
                                                    1
                                            )
                                        }
                                    >
                                        Next
                                    </button>

                                </div>
                            )}

                        {/* Mobile loading indicator */}

                        {isMobile &&
                            !isSearching &&
                            mobileCount <
                                filtered.length && (
                                <div className="load-more-indicator">
                                    Loading more movies...
                                </div>
                            )}
                    </>
                )}

            </div>
        </>
    );
}
