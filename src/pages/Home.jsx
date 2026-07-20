import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";

export default function Home({ search }) {
    const [movies, setMovies] = useState([]);
    const [heroMovies, setHeroMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function isIncognito() {
            try {
                const { quota } =
                    await navigator.storage.estimate();

                return quota < 120000000;
            } catch {
                return false;
            }
        }

        async function loadMovies() {
            try {
                const incognito =
                    await isIncognito();

                const storage =
                    incognito
                        ? sessionStorage
                        : localStorage;

                const CACHE_KEY = "movies";
                const CACHE_TIME = "movies_time";

                const cached =
                    storage.getItem(CACHE_KEY);

                const cachedTime =
                    storage.getItem(CACHE_TIME);

                const now = Date.now();

                // Use cache if less than 24 hours old
                if (
                    cached &&
                    cachedTime &&
                    now -
                        Number(cachedTime) <
                        24 *
                            60 *
                            60 *
                            1000
                ) {
                    console.log(
                        incognito
                            ? "Loaded from sessionStorage"
                            : "Loaded from localStorage"
                    );

                    const parsed =
                        JSON.parse(cached);

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

                console.log(
                    "Fetching movies..."
                );

                const response =
                    await fetch(
                        "https://script.google.com/macros/s/AKfycbyxKNbRtP9u9UyuuFrmR8gUA9rSeRfu3foRqDFxrWpRadM4L1Lx29bK2A7wzrEMPIxILw/exec"
                    );

                const data =
                    await response.json();

                setMovies(data.data);

                setHeroMovies(
                    [...data.data]
                        .sort(
                            () =>
                                Math.random() -
                                0.5
                        )
                        .slice(0, 5)
                );

                storage.setItem(
                    CACHE_KEY,
                    JSON.stringify(
                        data.data
                    )
                );

                storage.setItem(
                    CACHE_TIME,
                    now
                );

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        }

        loadMovies();
    }, []);

    const filtered =
        movies.filter((movie) =>
            movie["Movie Name"]
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    const latest =
        filtered.filter(
            (movie) =>
                movie.Year ===
                2026
        );

    const recent =
        filtered.filter(
            (movie) =>
                movie.Year ===
                2025
        );

    const isSearching =
        search.trim() !== "";

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
                movies={
                    heroMovies
                }
            />
        )}

        <div className="container">
            {!isSearching && (
                <>
                    <MovieSection
                        title="Latest"
                        movies={latest}
                    />

                    <MovieSection
                        title="Recent"
                        movies={recent}
                    />
                </>
            )}

            {filtered.length ===
            0 ? (
                <h2>
                    No movies found.
                </h2>
            ) : (
                <MovieSection
                    title={
                        isSearching
                            ? `Search Results (${filtered.length})`
                            : "All Movies"
                    }
                    movies={
                        filtered
                    }
                />
            )}
        </div>
        </>
    );
}
