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
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);

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
     * We handle it ourselves.
     */
    useEffect(() => {
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

        return () => {
            if ("scrollRestoration" in history) {
                history.scrollRestoration = "auto";
            }
        };
    }, []);

    /*
     * Mobile detection
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
                    await fetch("/movies.json");

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
                 * Random 5 hero movies
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
     * Reset pagination when search changes
     */
    useEffect(() => {
        setPage(1);
        setMobileCount(40);
    }, [search]);

    /*
     * Filter
     */
    const filtered =
        movies.filter((movie) =>
            String(
                movie["Movie Name"] || ""
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
                    Number(movie.Year) ===
                    2026
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
     * Mobile infinite loading
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
     * IMPORTANT:
     *
     * Restore previous Home position
     * AFTER Home has rendered.
     */
    useEffect(() => {
        if (loading) return;

        const saved =
            sessionStorage.getItem(
                "home_scroll_position"
            );

        if (!saved) return;

        const position =
            Number(saved);

        /*
         * Give React time to render
         * Hero + sections + cards.
         */
        let attempts = 0;

        const restoreScroll = () => {
            attempts++;

            window.scrollTo(
                0,
                position
            );

            /*
             * Check whether browser actually
             * reached the requested position.
             */
            if (
                Math.abs(
                    window.scrollY -
                        position
                ) > 10 &&
                attempts < 20
            ) {
                requestAnimationFrame(
                    restoreScroll
                );
            }
        };

        requestAnimationFrame(() => {
            requestAnimationFrame(
                restoreScroll
            );
        });

        /*
         * Extra restoration because
         * images/cards may increase page height.
         */
        const timer1 = setTimeout(
            () => {
                window.scrollTo(
                    0,
                    position
                );
            },
            300
        );

        const timer2 = setTimeout(
            () => {
                window.scrollTo(
                    0,
                    position
                );
            },
            800
        );

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [loading]);

    /*
     * Save scroll position continuously.
     */
    useEffect(() => {
        if (loading) return;

        let timeout;

        const savePosition = () => {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                sessionStorage.setItem(
                    "home_scroll_position",
                    window.scrollY.toString()
                );
            }, 100);
        };

        window.addEventListener(
            "scroll",
            savePosition,
            {
                passive: true
            }
        );

        return () => {
            clearTimeout(timeout);

            /*
             * Save exact position
             * before leaving Home.
             */
            sessionStorage.setItem(
                "home_scroll_position",
                window.scrollY.toString()
            );

            window.removeEventListener(
                "scroll",
                savePosition
            );
        };
    }, [loading]);

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
                        <Recent />

                        <div className="home-mobile-scroll-section">
                            <MovieSection
                                title="Latest"
                                movies={latest}
                            />
                        </div>

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
