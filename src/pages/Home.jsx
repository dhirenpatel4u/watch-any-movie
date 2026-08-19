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

    const [trending, setTrending] =
        useState([]);

    /*
     * Disable browser automatic
     * scroll restoration.
     *
     * We handle restoration ourselves.
     */
    useEffect(() => {
        if ("scrollRestoration" in history) {
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
     * Load movies from
     * public/movies.json
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
                 * Random 5 movies
                 * for Hero
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
     * Reset pagination when
     * search changes
     */
    useEffect(() => {
        setPage(1);
        setMobileCount(40);
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
     * =========================
     * LATEST
     * =========================
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
     * =========================
     * TRENDING
     * =========================
     *
     * Random 12 movies.
     */
    useEffect(() => {
        if (!filtered.length) {
            setTrending([]);
            return;
        }

        const randomMovies =
            [...filtered]
                .sort(
                    () =>
                        Math.random() -
                        0.5
                )
                .slice(0, 12);

        setTrending(randomMovies);
    }, [movies, search]);

    /*
     * =========================
     * DESKTOP PAGINATION
     * =========================
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
     * =========================
     * MOBILE MOVIES
     * =========================
     *
     * First 40
     * then load another 40.
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
             * when 500px from bottom.
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
                            current + 40,
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
     * =========================
     * RESTORE HOME POSITION
     * =========================
     *
     * This is intentionally separate
     * from the scroll listener.
     *
     * It runs only when Home finishes
     * loading.
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

        let restored = false;

        /*
         * Try to restore after the page
         * has rendered.
         */
        const restorePosition = () => {
            if (restored) {
                return;
            }

            const maxScroll =
                Math.max(
                    0,
                    document.documentElement
                        .scrollHeight -
                        window.innerHeight
                );

            /*
             * Do not restore until the
             * page is tall enough.
             */
            if (
                maxScroll < position
            ) {
                return;
            }

            restored = true;

            window.scrollTo({
                top: position,
                left: 0,
                behavior: "instant"
            });

            /*
             * Remove saved position
             * after successful restore.
             */
            sessionStorage.removeItem(
                "home_scroll_position"
            );
        };

        /*
         * Wait for React rendering.
         */
        const timer1 =
            setTimeout(() => {
                restorePosition();
            }, 300);

        /*
         * Images/cards may still be
         * rendering.
         */
        const timer2 =
            setTimeout(() => {
                restorePosition();
            }, 700);

        const timer3 =
            setTimeout(() => {
                restorePosition();
            }, 1200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [loading]);

    /*
     * =========================
     * LOADING
     * =========================
     */
    if (loading) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    /*
     * =========================
     * PAGE
     * =========================
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
                        {/* =====================
                            ALL MOVIES
                        ====================== */}

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

                        {/* =====================
                            DESKTOP PAGINATION
                        ====================== */}

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

                        {/* =====================
                            MOBILE LOAD MORE
                        ====================== */}

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
