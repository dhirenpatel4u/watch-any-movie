import {
    useEffect,
    useState
} from "react";

import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";
import Recent from "../components/Recent";

export default function Home({ search }) {

    /*
     * Detect mobile first
     */
    const [isMobile, setIsMobile] =
        useState(
            window.innerWidth <= 768
        );

    /*
     * Restore previously loaded mobile
     * batch immediately.
     *
     * Example:
     * user loaded 120 movies
     * then opened a movie
     * then came back
     *
     * mobileCount starts at 120
     * instead of 40.
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

    const [mobileCount, setMobileCount] =
        useState(
            getInitialMobileCount
        );

    const [movies, setMovies] =
        useState([]);

    const [heroMovies, setHeroMovies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [page, setPage] =
        useState(1);

    const [trending, setTrending] =
        useState([]);

    /*
     * Disable browser's automatic
     * scroll restoration.
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
     * Mobile / desktop detection
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

                setMovies(movieData);

                /*
                 * Random 5 Hero movies
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

                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    /*
     * Search changed
     */
    useEffect(() => {
        setPage(1);

        /*
         * Only reset mobile count
         * for a new search.
         *
         * When simply returning from
         * Watch page, search has not
         * changed, so count remains.
         */
        if (search.trim() !== "") {
            setMobileCount(40);

            sessionStorage.removeItem(
                "home_mobile_count"
            );
        }
    }, [search]);

    /*
     * Filter movies
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
     * First 12 from JSON
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
                .slice(0, 12)
        );
    }, [movies, search]);

    /*
     * Desktop pagination
     *
     * 35 per page.
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
     * Mobile movies
     *
     * Example:
     * 40
     * 80
     * 120
     * 160
     */
    const mobileMovies =
        filtered.slice(
            0,
            mobileCount
        );

    /*
     * =========================
     * MOBILE INFINITE SCROLL
     * =========================
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

                        /*
                         * IMPORTANT:
                         * Save loaded batch.
                         */
                        sessionStorage.setItem(
                            "home_mobile_count",
                            String(
                                nextCount
                            )
                        );

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
     * =========================
     * RESTORE SCROLL POSITION
     * =========================
     *
     * This runs only after movies
     * have loaded.
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
             * If the page is not tall enough
             * yet, wait.
             */
            if (
                maxScroll <
                    position &&
                attempts < 30
            ) {
                requestAnimationFrame(
                    restore
                );

                return;
            }

            /*
             * Restore exact position.
             */
            window.scrollTo({
                top: position,
                left: 0,
                behavior: "instant"
            });

            /*
             * Remove saved position
             * after restoration.
             */
            sessionStorage.removeItem(
                "home_scroll_position"
            );
        };

        /*
         * Start after React has rendered.
         */
        requestAnimationFrame(() => {
            requestAnimationFrame(
                restore
            );
        });

    }, [loading, mobileCount]);

    /*
     * Loading
     */
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

                        {/* Mobile loading */}

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
