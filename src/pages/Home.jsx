pimport {
    useEffect,
    useState
} from "react";

import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";
import Recent from "../components/Recent";

export default function Home({ search }) {

    const [movies, setMovies] = useState([]);
    const [heroMovies, setHeroMovies] = useState([]);

    const [recentMovies, setRecentMovies] =
        useState([]);

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
     * Load Recently Watched
     */
    useEffect(() => {

        try {

            const stored =
                localStorage.getItem(
                    "recently_watched"
                );

            if (stored) {

                const parsed =
                    JSON.parse(stored);

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
     * Load Movies
     */
    useEffect(() => {

        async function loadMovies() {

            try {

                /*
                 * Detect Incognito / Private mode
                 */
                async function isIncognito() {

                    try {

                        const {
                            quota
                        } =
                            await navigator
                                .storage
                                .estimate();

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


                /*
                 * IMPORTANT:
                 *
                 * Incognito:
                 * Directly load movies.json
                 *
                 * Normal:
                 * Use localStorage cache
                 */
                if (incognito) {

                    console.log(
                        "Incognito mode: loading movies.json directly"
                    );

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

                    setLoading(false);

                    return;
                }


                /*
                 * Normal browser
                 */
                const storage =
                    localStorage;

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
                 * Use cache if less
                 * than 24 hours old
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

                    console.log(
                        "Loaded movies from localStorage"
                    );

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
                console.log(
                    "Fetching /movies.json"
                );

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


                /*
                 * Save cache
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
     * Reset pagination when search changes
     */
    useEffect(() => {

        setPage(1);

        setMobileCount(40);

    }, [search]);


    /*
     * Restore previous Home scroll
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
     * Remember current Home scroll
     */
    useEffect(() => {

        if (loading) return;

        let timeout;


        const saveScroll = () => {

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
     * Random 12 movies.
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
     * 40
     * 80
     * 120
     * ...
     */
    const mobileMovies =
        filtered.slice(
            0,
            mobileCount
        );


    /*
     * Mobile Infinite Scroll
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
     * Loading screen
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

            {/* HERO */}

            {!isSearching && (
                <Hero
                    shows={heroMovies}
                />
            )}


            <div className="container">


                {/* HOME SECTIONS */}

                {!isSearching && (
                    <>

                        {/* Recently Watched */}

                        <Recent
                            movies={
                                recentMovies
                            }
                        />


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


                {/* SEARCH / ALL MOVIES */}

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


                        {/* DESKTOP PAGINATION */}

                        {!isMobile &&
                            !isSearching &&
                            totalPages > 1 && (

                                <div className="pagination">

                                    <button
                                        disabled={
                                            page === 1
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


                        {/* MOBILE LOAD MORE */}

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
