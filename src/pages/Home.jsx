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
     * Restore movies immediately from cache.
     * This prevents "Loading Movies..." from
     * flashing when returning from Watch page.
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
     * If cached movies exist, don't show
     * the loading screen.
     */
    const [loading, setLoading] =
        useState(
            initialMovies.length === 0
        );

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
                 * IMPORTANT:
                 * Cache movies so Home can render
                 * immediately when returning from
                 * the Watch page.
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

                /*
                 * If cached movies exist, keep
                 * showing them.
                 */
                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    /*
     * If cached movies already exist,
     * create Hero movies immediately.
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
    }, [movies, heroMovies.length]);

    /*
     * Search changed
     */
    useEffect(() => {
        setPage(1);

        /*
         * Only reset mobile count
         * for a new search.
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
     * Trending
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
    }, [movies, search]);

    /*
     * Desktop pagination
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
     */
    const mobileMovies =
        filtered.slice(
            0,
            mobileCount
        );

    /*
     * MOBILE INFINITE SCROLL
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
     * RESTORE SCROLL POSITION
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

            window.scrollTo({
                top: position,
                left: 0,
                behavior: "instant"
            });

            sessionStorage.removeItem(
                "home_scroll_position"
            );
        };

        requestAnimationFrame(() => {
            requestAnimationFrame(
                restore
            );
        });

    }, [loading, mobileCount]);

    /*
     * Loading
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
                                                page - 1
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
                                                page + 1
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
