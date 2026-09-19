import {
    useEffect,
    useState
} from "react";

import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";
import Recent from "../components/Recent";

export default function Home({ search }) {

    /*
     * =====================================================
     * INITIAL HELPERS
     * =====================================================
     */

    /*
     * Detect mobile.
     */
    const [isMobile, setIsMobile] =
        useState(
            window.innerWidth <= 768
        );

    /*
     * Restore mobile loaded count.
     */
    const getInitialMobileCount = () => {
        try {
            const saved =
                sessionStorage.getItem(
                    "home_mobile_count"
                );

            const count =
                Number(saved);

            if (
                Number.isFinite(count) &&
                count >= 40
            ) {
                return count;
            }
        } catch {
            // Ignore
        }

        return 40;
    };

    /*
     * Restore cached movies.
     */
    const getInitialMovies = () => {
        try {
            const saved =
                sessionStorage.getItem(
                    "home_movies"
                );

            if (saved) {
                const parsed =
                    JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch {
            // Ignore
        }

        return [];
    };

    /*
     * Restore desktop page.
     */
    const getInitialPage = () => {
        try {
            const saved =
                sessionStorage.getItem(
                    "home_desktop_page"
                );

            const page =
                Number(saved);

            if (
                Number.isFinite(page) &&
                page >= 1
            ) {
                return page;
            }
        } catch {
            // Ignore
        }

        return 1;
    };

    /*
     * =====================================================
     * INITIAL DATA
     * =====================================================
     */

    const initialMovies =
        getInitialMovies();

    const [mobileCount, setMobileCount] =
        useState(
            getInitialMobileCount
        );

    const [movies, setMovies] =
        useState(initialMovies);

    const [heroMovies, setHeroMovies] =
        useState([]);

    /*
     * If cached movies exist,
     * don't show loading.
     */
    const [loading, setLoading] =
        useState(
            initialMovies.length === 0
        );

    /*
     * Restore desktop page number.
     */
    const [page, setPage] =
        useState(getInitialPage);

    const [trending, setTrending] =
        useState([]);

    /*
     * =====================================================
     * DISABLE BROWSER SCROLL RESTORATION
     * =====================================================
     */

    useEffect(() => {
        if (
            "scrollRestoration" in
            history
        ) {
            history.scrollRestoration =
                "manual";
        }

        return () => {
            if (
                "scrollRestoration" in
                history
            ) {
                history.scrollRestoration =
                    "auto";
            }
        };
    }, []);

    /*
     * =====================================================
     * MOBILE / DESKTOP DETECTION
     * =====================================================
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
     * =====================================================
     * LOAD MOVIES
     * =====================================================
     */

    useEffect(() => {
        async function loadMovies() {
            try {
                const response =
                    await fetch(
                        "/movies.json"
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load movies.json"
                    );
                }

                const json =
                    await response.json();

                const movieData =
                    json.data || json;

                /*
                 * Update movies.
                 */
                setMovies(movieData);

                /*
                 * Cache movies.
                 */
                try {
                    sessionStorage.setItem(
                        "home_movies",
                        JSON.stringify(
                            movieData
                        )
                    );
                } catch {
                    // Ignore storage errors
                }

                /*
                 * Random 5 Hero movies.
                 */
                setHeroMovies(
                    [...movieData]
                        .sort(
                            () =>
                                Math.random() -
                                0.5
                        )
                        .slice(0, 5)
                );

                setLoading(false);

            } catch (error) {
                console.error(
                    "Movie loading error:",
                    error
                );

                /*
                 * Cached movies, if any,
                 * remain visible.
                 */
                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    /*
     * =====================================================
     * HERO FROM CACHED MOVIES
     * =====================================================
     */

    useEffect(() => {
        if (
            movies.length > 0 &&
            heroMovies.length === 0
        ) {
            setHeroMovies(
                [...movies]
                    .sort(
                        () =>
                            Math.random() -
                            0.5
                    )
                    .slice(0, 5)
            );
        }
    }, [
        movies,
        heroMovies.length
    ]);

    /*
     * =====================================================
     * SEARCH CHANGED
     * =====================================================
     */

    useEffect(() => {

        /*
         * Search is a new view,
         * therefore page starts at 1.
         */
        setPage(1);

        try {
            sessionStorage.setItem(
                "home_desktop_page",
                "1"
            );
        } catch {
            // Ignore
        }

        /*
         * Reset mobile count for search.
         */
        if (search.trim() !== "") {
            setMobileCount(40);

            try {
                sessionStorage.removeItem(
                    "home_mobile_count"
                );
            } catch {
                // Ignore
            }
        }

    }, [search]);

    /*
     * =====================================================
     * FILTER MOVIES
     * =====================================================
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
     * =====================================================
     * LATEST
     * =====================================================
     */

    const latest =
        filtered
            .filter(
                (movie) =>
                    Number(
                        movie.Year
                    ) === 2026
            )
            .slice(0, 14);

    /*
     * =====================================================
     * TRENDING
     * =====================================================
     */

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
                .slice(0, 14)
        );

    }, [
        movies,
        search
    ]);

    /*
     * =====================================================
     * DESKTOP PAGINATION
     * =====================================================
     */

    const DESKTOP_PER_PAGE = 35;

    const totalPages =
        Math.ceil(
            filtered.length /
                DESKTOP_PER_PAGE
        );

    /*
     * Make sure restored page is
     * within available pages.
     */
    useEffect(() => {

        if (
            totalPages > 0 &&
            page > totalPages
        ) {
            setPage(totalPages);

            try {
                sessionStorage.setItem(
                    "home_desktop_page",
                    String(totalPages)
                );
            } catch {
                // Ignore
            }
        }

    }, [
        totalPages,
        page
    ]);

    const desktopMovies =
        filtered.slice(
            (page - 1) *
                DESKTOP_PER_PAGE,

            page *
                DESKTOP_PER_PAGE
        );

    /*
     * =====================================================
     * MOBILE MOVIES
     * =====================================================
     */

    const mobileMovies =
        filtered.slice(
            0,
            mobileCount
        );

    /*
     * =====================================================
     * MOBILE INFINITE SCROLL
     * =====================================================
     */

    useEffect(() => {

        if (!isMobile) return;

        if (isSearching) return;

        const handleScroll = () => {

            const scrollPosition =
                window.innerHeight +
                window.scrollY;

            const documentHeight =
                document.documentElement
                    .scrollHeight;

            /*
             * Load next batch
             * 500px before bottom.
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

                        const nextCount =
                            Math.min(
                                current +
                                    40,
                                filtered.length
                            );

                        try {
                            sessionStorage.setItem(
                                "home_mobile_count",
                                String(
                                    nextCount
                                )
                            );
                        } catch {
                            // Ignore
                        }

                        return nextCount;
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
     * =====================================================
     * SAVE DESKTOP PAGE
     * =====================================================
     */

    useEffect(() => {

        if (loading) return;

        /*
         * Don't save search page as the
         * normal home page.
         */
        if (isSearching) return;

        try {
            sessionStorage.setItem(
                "home_desktop_page",
                String(page)
            );
        } catch {
            // Ignore
        }

    }, [
        page,
        loading,
        isSearching
    ]);

    /*
     * =====================================================
     * SAVE SCROLL POSITION
     * =====================================================
     *
     * Works for both desktop and mobile.
     */

    useEffect(() => {

        const saveScrollPosition = () => {

            /*
             * Don't overwrite saved position
             * while the page is restoring it.
             */
            if (
                window.__restoringHomeScroll
            ) {
                return;
            }

            try {
                sessionStorage.setItem(
                    "home_scroll_position",
                    String(
                        window.scrollY
                    )
                );
            } catch {
                // Ignore
            }
        };

        window.addEventListener(
            "scroll",
            saveScrollPosition,
            {
                passive: true
            }
        );

        /*
         * Save when leaving page.
         */
        return () => {

            saveScrollPosition();

            window.removeEventListener(
                "scroll",
                saveScrollPosition
            );
        };

    }, []);

    /*
     * =====================================================
     * RESTORE SCROLL POSITION
     * =====================================================
     *
     * Important:
     * page is included in dependencies.
     *
     * Therefore desktop page is rendered first,
     * then exact scroll position is restored.
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

        if (
            !Number.isFinite(position) ||
            position < 0
        ) {
            sessionStorage.removeItem(
                "home_scroll_position"
            );

            return;
        }

        let attempts = 0;

        /*
         * Mark that restoration is in progress.
         */
        window.__restoringHomeScroll =
            true;

        const restore = () => {

            attempts++;

            const maxScroll =
                Math.max(
                    0,
                    document.documentElement
                        .scrollHeight -
                        window.innerHeight
                );

            /*
             * Wait until enough content exists.
             */
            if (
                maxScroll <
                    position &&
                attempts < 60
            ) {

                requestAnimationFrame(
                    restore
                );

                return;
            }

            window.scrollTo({
                top: Math.min(
                    position,
                    maxScroll
                ),
                left: 0,
                behavior: "instant"
            });

            /*
             * Allow scroll saving again
             * after restoration.
             */
            requestAnimationFrame(() => {
                window.__restoringHomeScroll =
                    false;
            });
        };

        /*
         * Wait for React to finish rendering.
         */
        requestAnimationFrame(() => {

            requestAnimationFrame(
                restore
            );

        });

    }, [
        loading,
        page,
        mobileCount
    ]);

    /*
     * =====================================================
     * LOADING
     * =====================================================
     */

    if (
        loading &&
        movies.length === 0
    ) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

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
                        {/* All Movies */}

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

                        {/* =================================================
                            DESKTOP PAGINATION
                        ================================================= */}

                        {!isMobile &&
                            !isSearching &&
                            totalPages > 1 && (
                                <div className="pagination">

                                    <button
                                        disabled={
                                            page ===
                                            1
                                        }
                                        onClick={() => {

                                            const newPage =
                                                page -
                                                1;

                                            setPage(
                                                newPage
                                            );

                                            try {
                                                sessionStorage.setItem(
                                                    "home_desktop_page",
                                                    String(
                                                        newPage
                                                    )
                                                );

                                                /*
                                                 * When manually changing page,
                                                 * clear old scroll position.
                                                 */
                                                sessionStorage.setItem(
                                                    "home_scroll_position",
                                                    "0"
                                                );
                                            } catch {
                                                // Ignore
                                            }

                                            /*
                                             * New page starts at top.
                                             */
                                            window.scrollTo({
                                                top: 0,
                                                left: 0,
                                                behavior:
                                                    "instant"
                                            });

                                        }}
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
                                        onClick={() => {

                                            const newPage =
                                                page +
                                                1;

                                            setPage(
                                                newPage
                                            );

                                            try {
                                                sessionStorage.setItem(
                                                    "home_desktop_page",
                                                    String(
                                                        newPage
                                                    )
                                                );

                                                /*
                                                 * New page starts at top.
                                                 */
                                                sessionStorage.setItem(
                                                    "home_scroll_position",
                                                    "0"
                                                );
                                            } catch {
                                                // Ignore
                                            }

                                            window.scrollTo({
                                                top: 0,
                                                left: 0,
                                                behavior:
                                                    "instant"
                                            });

                                        }}
                                    >
                                        Next
                                    </button>

                                </div>
                            )}

                        {/* =================================================
                            MOBILE LOADING
                        ================================================= */}

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
