import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MovieSection from "../components/MovieSection";

export default function ActorSearch() {
    const { actor } = useParams();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMovies() {
            try {
                const response =
                    await fetch("/movies.json");

                const json =
                    await response.json();

                const data = Array.isArray(json)
                    ? json
                    : json.data || [];

                const actorName =
                    decodeURIComponent(actor);

                const results =
                    data.filter((movie) =>
                        Array.isArray(
                            movie.Actors
                        ) &&
                        movie.Actors.some(
                            (name) =>
                                name.toLowerCase() ===
                                actorName.toLowerCase()
                        )
                    );

                setMovies(results);

            } catch (error) {
                console.error(
                    "Failed to load movies:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadMovies();
    }, [actor]);

    if (loading) {
        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    const actorName =
        decodeURIComponent(actor);

    return (
        <div className="container">

            <MovieSection
                title={`${actorName} (${movies.length})`}
                movies={movies}
            />

            {movies.length === 0 && (
                <h2>
                    No movies found for {actorName}
                </h2>
            )}

        </div>
    );
}
