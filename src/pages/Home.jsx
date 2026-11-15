
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
     * Restore previously loaded mobile batch
     */
    const getInitialMobileCount = () => {
        try {
            const saved =
                sessionStorage.getItem(
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
     * Restore cached movies
     */
    const getInitialMovies = () => {
        try {
            const saved =
                sessionStorage.getItem(
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

    const [page, setPage] = useState(1);

    const [trending, setTrending] =
        useState([]);

    /*
     * Disable browser automatic scroll restoration
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
     * Save Home scroll position
     */
    useEffect(() => {

        const saveScroll = () => {

            sessionStorage.setItem(
                "home_scroll_position",
                String(window.scrollY)
            );

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
                    await fetch("/movies.json");

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
     * Create Hero movies from cache
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
     * Search changed
     */
    useEffect(() => {

        setPage(1);

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
    const filtered = movies.filter((movie) =>
        String(movie["Movie Name"] || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const isSearching = search.trim() !== "";

    /*
     * Latest
     */
    const latest = filtered
        .filter(
            (movie) => Number(movie.Year) === 2026
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
                    () => Math.random() - 0.5
                )
                .slice(0, 14)
        );

    }, [movies, search]);

    /*
     * Desktop pagination
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
     * Mobile movies
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

        const shouldRestore =
            sessionStorage.getItem(
                "restore_home_scroll"
            );

        if (shouldRestore !== "true") {
            return;
        }

        const savedPosition =
            sessionStorage.getItem(
                "home_scroll_position"
            );

        if (!savedPosition) {
            sessionStorage.removeItem(
                "restore_home_scroll"
            );
            return;
        }

        const position = Number(savedPosition);

        if (
            !Number.isFinite(position) ||
            position < 0
        ) {

            sessionStorage.removeItem(
                "home_scroll_position"
            );

            sessionStorage.removeItem(
                "restore_home_scroll"
            );

            return;
        }

        let attempts = 0;
        let frame;

        const restore = () => {

            attempts++;

            const maxScroll = Math.max(
                0,
                document.documentElement.scrollHeight -
                window.innerHeight
            );

            if (
                maxScroll < position &&
                attempts < 60
            ) {

                frame = requestAnimationFrame(
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

            sessionStorage.removeItem(
                "restore_home_scroll"
            );
        };

        frame = requestAnimationFrame(() => {

            frame = requestAnimationFrame(restore);

        });

        return () => {
            cancelAnimationFrame(frame);
        };

    }, [loading]);

    /*
     * Loading
     */
    if (loading && movies.length === 0) {

        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

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

                    <h2>No movies found.</h2>

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
