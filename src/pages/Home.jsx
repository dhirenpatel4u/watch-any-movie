
import {
    useEffect,
    useRef,
    useState
} from "react";

import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";
import Recent from "../components/Recent";

/*
 * GET INITIAL DESKTOP PAGE
 */
const getInitialPage = () => {

    try {

        const navigation =
            performance.getEntriesByType("navigation")[0];

        // Fresh browser reload always starts at page 1
        if (navigation?.type === "reload") {
            return 1;
        }

        // Restore page only when returning from Watch
        if (
            sessionStorage.getItem(
                "restore_home_scroll"
            ) === "true"
        ) {

            const savedPage = Number(
                sessionStorage.getItem(
                    "home_desktop_page"
                )
            );

            if (
                Number.isInteger(savedPage) &&
                savedPage >= 1
            ) {
                return savedPage;
            }
        }

    } catch {}

    return 1;
};

export default function Home({ search }) {

    const [isMobile, setIsMobile] = useState(
        window.innerWidth <= 768
    );

    /*
     * INITIAL MOBILE COUNT
     */
    const getInitialMobileCount = () => {

        try {

            const saved = sessionStorage.getItem(
                "home_mobile_count"
            );

            const count = Number(saved);

            if (
                Number.isFinite(count) &&
                count >= 40
            ) {
                return count;
            }

        } catch {}

        return 40;
    };

    /*
     * INITIAL MOVIES CACHE
     */
    const getInitialMovies = () => {

        try {

            const saved = sessionStorage.getItem(
                "home_movies"
            );

            if (saved) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }

        } catch {}

        return [];
    };

    const initialMovies = getInitialMovies();

    const [mobileCount, setMobileCount] =
        useState(getInitialMobileCount);

    const [movies, setMovies] =
        useState(initialMovies);

    const [heroMovies, setHeroMovies] =
        useState([]);

    const [loading, setLoading] =
        useState(initialMovies.length === 0);

    // Restore page immediately during component initialization
    const [page, setPage] =
        useState(getInitialPage);

    const [trending, setTrending] =
        useState([]);

    const previousSearch = useRef(search);

    /*
     * CHECK RELOAD
     */
    const isReload =
        performance.getEntriesByType("navigation")[0]?.type === "reload";

    /*
     * RESET STORAGE ON BROWSER RELOAD
     */
    useEffect(() => {

        if (!isReload) return;

        sessionStorage.removeItem(
            "home_desktop_page"
        );

        sessionStorage.removeItem(
            "home_scroll_position"
        );

        sessionStorage.removeItem(
            "restore_home_scroll"
        );

        setPage(1);

    }, []);

    /*
     * SAVE DESKTOP PAGE
     */
    useEffect(() => {

        if (isReload) return;

        if (
            window.location.pathname === "/" &&
            !isMobile
        ) {

            sessionStorage.setItem(
                "home_desktop_page",
                String(page)
            );
        }

    }, [page, isMobile]);

    /*
     * DISABLE BROWSER AUTOMATIC RESTORATION
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
     * SAVE HOME SCROLL POSITION
     */
    useEffect(() => {

        const saveScroll = () => {

            if (
                window.location.pathname === "/"
            ) {

                sessionStorage.setItem(
                    "home_scroll_position",
                    String(window.scrollY)
                );
            }
        };

        window.addEventListener(
            "scroll",
            saveScroll,
            { passive: true }
        );

        return () => {

            window.removeEventListener(
                "scroll",
                saveScroll
            );
        };

    }, []);

    /*
     * MOBILE / DESKTOP DETECTION
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
     * LOAD MOVIES
     */
    useEffect(() => {

        async function loadMovies() {

            try {

                const response = await fetch(
                    "/movies.json"
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load movies.json"
                    );
                }

                const json = await response.json();

                const movieData =
                    json.data || json;

                setMovies(movieData);

                try {

                    sessionStorage.setItem(
                        "home_movies",
                        JSON.stringify(movieData)
                    );

                } catch {}

                setHeroMovies(
                    [...movieData]
                        .sort(
                            () => Math.random() - 0.5
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
     * CREATE HERO FROM CACHE
     */
    useEffect(() => {

        if (
            movies.length > 0 &&
            heroMovies.length === 0
        ) {

            setHeroMovies(
                [...movies]
                    .sort(
                        () => Math.random() - 0.5
                    )
                    .slice(0, 5)
            );
        }

    }, [movies, heroMovies.length]);

    /*
     * SEARCH CHANGED
     */
    useEffect(() => {

        // Do not reset restored page on initial mount
        if (previousSearch.current === search) {
            return;
        }

        previousSearch.current = search;

        setPage(1);

        sessionStorage.removeItem(
            "home_desktop_page"
        );

        if (search.trim() !== "") {

            setMobileCount(40);

            sessionStorage.removeItem(
                "home_mobile_count"
            );
        }

    }, [search]);

    /*
     * FILTER MOVIES
     */
    const filtered = movies.filter((movie) =>
        String(movie["Movie Name"] || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const isSearching = search.trim() !== "";

    /*
     * LATEST
     */
    const latest = filtered
        .filter(
            (movie) => Number(movie.Year) === 2026
        )
        .slice(0, 14);

    /*
     * TRENDING
     */
    useEffect(() => {

        if (!filtered.length) {
            setTrending([]);
            return;
        }

        setTrending(
            [...filtered]
                .sort(
                    () => Math.random() - 0.5
                )
                .slice(0, 14)
        );

    }, [movies, search]);

    /*
     * DESKTOP PAGINATION
     */
    const DESKTOP_PER_PAGE = 35;

    const totalPages = Math.ceil(
        filtered.length / DESKTOP_PER_PAGE
    );

    const desktopMovies = filtered.slice(
        (page - 1) * DESKTOP_PER_PAGE,
        page * DESKTOP_PER_PAGE
    );

    /*
     * MOBILE MOVIES
     */
    const mobileMovies = filtered.slice(
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
                window.innerHeight + window.scrollY;

            const documentHeight =
                document.documentElement.scrollHeight;

            if (
                documentHeight - scrollPosition < 500
            ) {

                setMobileCount((current) => {

                    if (current >= filtered.length) {
                        return current;
                    }

                    const nextCount = Math.min(
                        current + 40,
                        filtered.length
                    );

                    try {

                        sessionStorage.setItem(
                            "home_mobile_count",
                            String(nextCount)
                        );

                    } catch {}

                    return nextCount;
                });
            }
        };

        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
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
     * RESTORE HOME SCROLL POSITION
     */
    useEffect(() => {

        if (loading) return;
        if (isReload) return;

        const shouldRestore =
            sessionStorage.getItem(
                "restore_home_scroll"
            );

        if (shouldRestore !== "true") {
            return;
        }

        const savedPosition = Number(
            sessionStorage.getItem(
                "home_scroll_position"
            )
        );

        if (
            !Number.isFinite(savedPosition) ||
            savedPosition < 0
        ) {

            sessionStorage.removeItem(
                "restore_home_scroll"
            );

            return;
        }

        let attempts = 0;
        let frame;
        let cancelled = false;

        const restore = () => {

            if (cancelled) return;

            attempts++;

            const maxScroll = Math.max(
                0,
                document.documentElement.scrollHeight -
                window.innerHeight
            );

            /*
             * Wait for the correct page content
             * to become available.
             */
            if (
                maxScroll < savedPosition &&
                attempts < 180
            ) {

                frame = requestAnimationFrame(
                    restore
                );

                return;
            }

            window.scrollTo(
                0,
                Math.min(savedPosition, maxScroll)
            );

            sessionStorage.removeItem(
                "restore_home_scroll"
            );

            sessionStorage.removeItem(
                "home_scroll_position"
            );
        };

        frame = requestAnimationFrame(() => {

            frame = requestAnimationFrame(restore);

        });

        return () => {

            cancelled = true;

            cancelAnimationFrame(frame);
        };

    }, [loading, page, isReload]);

    /*
     * LOADING
     */
    if (loading && movies.length === 0) {

        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    /*
     * HOME PAGE
     */
    return (
        <>

            {!isSearching && (
                <Hero shows={heroMovies} />
            )}

            <div className="container">

                {!isSearching && (
                    <>

                        <Recent />

                        <div className="home-mobile-scroll-section">

                            <MovieSection
                                title="Latest"
                                movies={latest}
                                homePage={page}
                            />

                        </div>

                        <div className="home-mobile-scroll-section">

                            <MovieSection
                                title="Trending"
                                movies={trending}
                                homePage={page}
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
                                homePage={page}
                            />

                        </div>

                        {!isMobile &&
                            !isSearching &&
                            totalPages > 1 && (

                                <div className="pagination">

                                    <button
                                        disabled={page === 1}
                                        onClick={() =>
                                            setPage(page - 1)
                                        }
                                    >
                                        Previous
                                    </button>

                                    <span>
                                        {page} / {totalPages}
                                    </span>

                                    <button
                                        disabled={
                                            page === totalPages
                                        }
                                        onClick={() =>
                                            setPage(page + 1)
                                        }
                                    >
                                        Next
                                    </button>

                                </div>

                            )}

                        {isMobile &&
                            !isSearching &&
                            mobileCount < filtered.length && (

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
