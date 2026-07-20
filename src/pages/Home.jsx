import { useEffect, useState } from "react";
import MovieSection from "../components/MovieSection";

export default function Home({ search }) {
    const [movies, setMovies] = useState([]);
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

                    setMovies(
                        JSON.parse(cached)
                    );

                    setLoading(false);
                    return;
                }

                console.log(
                    "Fetching movies..."
                );

                const response =
                    await fetch(
                        "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnRVaQVJXRUjmOv7OVWraFMF4rvcJlXXamDr4hIAz54OqSYcXP_Zq6vyW-a_TDVHSe_qe_o51RZiV46RGIrHzqIxjbRUqA7ABWdSGdRVX2Pl9yFlQtGLuAzB27VFpiORg2D4iLOtd-eoruV0HrqUuomTCk_cfdmgOdzFkCBFqRiKKAZ2eZxy4Rz4qsjQvJ4Wk2E3w1c8DdpQWtRFFho0dHqM3LydDH4U2m696GKnlZlDJvHPQ8Ieg77izbeNNthNp4ArtnWgjihn0HkfoCG0-bxYWADwvQ&lib=MdkOOLVUqxpsMtamGk_CUO1T3b6iDXk-u"
                    );

                const data =
                    await response.json();

                setMovies(data.data);

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
                movie["Stream URL"] ===
                2026
        );

    const recent =
        filtered.filter(
            (movie) =>
                movie["Stream URL"] ===
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
    );
}
