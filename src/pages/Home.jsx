import {
    useEffect,
    useState
} from "react";

import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";
import Recent from "../components/Recent";

export default function Home({
    search
}) {
    const [movies, setMovies] =
        useState([]);

    const [heroMovies, setHeroMovies] =
        useState([]);

    const [recentMovies, setRecentMovies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [page, setPage] =
        useState(1);

    /*
     * Mobile infinite scroll
     *
     * First 40
     * then 80
     * then 120...
     */
    const [mobileCount, setMobileCount] =
        useState(40);

    const [isMobile, setIsMobile] =
        useState(
            window.innerWidth <= 768
        );

    /*
     * =====================================
     * Detect mobile / desktop
     * =====================================
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
     * =====================================
     * Load movies
     * =====================================
     */

    useEffect(() => {
        let cancelled = false;

        async function loadMovies() {
            try {
                /*
                 * Detect private / incognito mode
                 */
                async function isIncognito() {
                    try {
                        const {
                            quota
                        } =
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
                 * =================================
                 * Use cache if less than 24 hours
                 * =================================
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

                    if (
                        !cancelled
                    ) {
                        setMovies(parsed);

                        /*
                         * Random 5 hero movies
                         */
                        setHeroMovies(
                            [...parsed]
                                .sort(
                                    () =>
                                        Math.random() -
                                        0.5
                                )
                                .slice(
                                    0,
                                    5
                                )
                        );
                    }

                    return;
                }

                /*
                 * =================================
                 * Fetch public/movies.json
                 * =================================
                 */

                const response =
                    await fetch(
                        "/movies.json",
                        {
                            cache: "no-cache"
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load movies.json: ${response.status}`
                    );
                }

                const json =
                    await response.json();

                const movieData =
                    Array.isArray(
                        json
                    )
                        ? json
                        : json.data || [];

                if (
                    !Array.isArray(
                        movieData
                    )
                ) {
                    throw new Error(
                        "Invalid movies.json format"
                    );
                }

                if (
                    !cancelled
                ) {
                    setMovies(
                        movieData
                    );

                    /*
                     * Random 5 hero movies
                     */
                    setHeroMovies(
                        [...movieData]
                            .sort(
                                () =>
                                    Math.random() -
                                    0.5
                            )
                            .slice(
                                0,
                                5
                            )
                    );
                }

                /*
                 * Cache movies
                 */
                try {
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
                } catch (
                    storageError
                ) {
                    console.warn(
                        "Could not save movie cache:",
                        storageError
                    );
                }

            } catch (error) {
                console.error(
                    "Movie loading error:",
                    error
                );

            } finally {
                if (
                    !cancelled
                ) {
                    setLoading(false);
                }
            }
        }

        loadMovies();

        return () => {
            cancelled = true;
        };

    }, []);

    /*
     * =====================================
     * Load Recently Watched
     * =====================================
     */

    useEffect(() => {
        try {
            const stored =
                localStorage.getItem(
                    "recently_watched"
                );

            if (!stored) {
                setRecentMovies([]);
                return;
            }

            const parsed =
                JSON.parse(stored);

            if (
                Array.isArray(
                    parsed
                )
            ) {
                setRecentMovies(
                    parsed.slice(0, 7)
                );
            }

        } catch (error) {
            console.error(
                "Failed to load recently watched:",
                error
            );

            setRecentMovies([]);
        }
    }, []);

    /*
     * =====================================
     * Reset pagination on search
     * =====================================
     */

    useEffect(() => {
        setPage(1);
        setMobileCount(40);
    }, [search]);

    /*
     * =====================================
     * Search
     * =====================================
     */

    const searchText =
        String(search || "")
            .trim()
            .toLowerCase();

    const filtered =
        movies.filter((movie) =>
            String(
                movie[
                    "Movie Name"
                ] || ""
            )
                .toLowerCase()
                .includes(
                    searchText
                )
        );

    const isSearching =
        searchText !== "";

    /*
     * =====================================
     * Latest
     *
     * First 12 movies from JSON
     * having Year 2026.
     * =====================================
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
     * =====================================
     * Trending
     *
     * Random 12 movies
     * =====================================
     */

    const [
        trending,
        setTrending
    ] = useState([]);

    useEffect(() => {
        if (!filtered.length) {
            setTrending([]);
            return;
        }

        const shuffled =
            [...filtered].sort(
                () =>
                    Math.random() -
                    0.5
            );

        setTrending(
            shuffled.slice(
                0,
                12
            )
        );

    }, [movies, search]);

    /*
     * =====================================
     * Desktop pagination
     *
     * 35 movies per page
     * =====================================
     */

    const DESKTOP_PER_PAGE =
        35;

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
     * =====================================
     * Mobile movies
     *
     * 40 initially
     * =====================================
     */

    const mobileMovies =
        filtered.slice(
            0,
            mobileCount
        );

    /*
     * =====================================
     * Mobile infinite scroll
     * =====================================
     */

    useEffect(() => {
        if (!isMobile) {
            return;
        }

        if (isSearching) {
            return;
        }

        const handleScroll = () => {
            const scrollPosition =
                window.innerHeight +
                window.scrollY;

            const documentHeight =
                document.documentElement
                    .scrollHeight;

            /*
             * Load next 40 when
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

    /*
     * =====================================
     * HOME SCROLL RESTORATION
     * =====================================
     *
     * Save position while on Home.
     *
     * When returning from Watch page,
     * restore the previous position.
     */

    useEffect(() => {
        if (loading) {
            return;
        }

        /*
         * Prevent browser's own automatic
         * scroll restoration from fighting
         * with our restoration.
         */
        if (
            "scrollRestoration" in
            window.history
        ) {
            window.history.scrollRestoration =
                "manual";
        }

        /*
         * Restore saved position
         */
        const savedPosition =
            sessionStorage.getItem(
                "home_scroll_position"
            );

        if (savedPosition) {
            const position =
                Number(
                    savedPosition
                );

            /*
             * Wait for React rendering,
             * Hero rendering and cards.
             */
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        window.scrollTo(
                            0,
                            position
                        );
                    }, 300);
                });
            });
        }

        /*
         * Save scrolling position
         */
        const saveScrollPosition =
            () => {
                sessionStorage.setItem(
                    "home_scroll_position",
                    window.scrollY.toString()
                );
            };

        window.addEventListener(
            "scroll",
            saveScrollPosition,
            {
                passive: true
            }
        );

        /*
         * Save before Home unmounts
         */
        return () => {
            sessionStorage.setItem(
                "home_scroll_position",
                window.scrollY.toString()
            );

            window.removeEventListener(
                "scroll",
                saveScrollPosition
            );
        };

    }, [loading]);

    /*
     * =====================================
     * Loading
     * =====================================
     */

    if (loading) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    /*
     * =====================================
     * Page
     * =====================================
     */

    return (
        <>
            {/* HERO */}

            {!isSearching && (
                <Hero
                    shows={
                        heroMovies
                    }
                />
            )}

            <div className="container">

                {/* =================================
                    HOME SECTIONS
                ================================= */}

                {!isSearching && (
                    <>
                        {/* Recently Watched */}

                        {recentMovies.length >
                            0 && (
                            <Recent
                                movies={
                                    recentMovies
                                }
                            />
                        )}

                        {/* Latest */}

                        <div className="home-mobile-scroll-section">
                            <MovieSection
                                title="Latest"
                                movies={
                                    latest
                                }
                            />
                        </div>

                        {/* Trending */}

                        <div className="home-mobile-scroll-section">
                            <MovieSection
                                title="Trending"
                                movies={
                                    trending
                                }
                            />
                        </div>
                    </>
                )}

                {/* =================================
                    NO RESULTS
                ================================= */}

                {filtered.length ===
                0 ? (
                    <h2>
                        No movies found.
                    </h2>
                ) : (
                    <>
                        {/* =================================
                            ALL MOVIES
                        ================================= */}

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

                        {/* =================================
                            DESKTOP PAGINATION
                        ================================= */}

                        {!isMobile &&
                            !isSearching &&
                            totalPages >
                                1 && (
                                <div className="pagination">

                                    <button
                                        type="button"

                                        disabled={
                                            page ===
                                            1
                                        }

                                        onClick={() =>
                                            setPage(
                                                (
                                                    previous
                                                ) =>
                                                    previous -
                                                    1
                                            )
                                        }
                                    >
                                        Previous
                                    </button>

                                    <span>
                                        {page}{" "}
                                        /{" "}
                                        {
                                            totalPages
                                        }
                                    </span>

                                    <button
                                        type="button"

                                        disabled={
                                            page ===
                                            totalPages
                                        }

                                        onClick={() =>
                                            setPage(
                                                (
                                                    previous
                                                ) =>
                                                    previous +
                                                    1
                                            )
                                        }
                                    >
                                        Next
                                    </button>

                                </div>
                            )}

                        {/* =================================
                            MOBILE LOAD MORE
                        ================================= */}

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
