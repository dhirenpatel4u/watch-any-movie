
import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

export default function Watch() {

    const { id } = useParams();

    /*
     * Get cached movies from Home
     */
    const getCachedMovies = () => {

        try {

            const saved =
                sessionStorage.getItem("home_movies");

            if (saved) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }

        } catch {}

        return [];
    };

    const initialMovies = getCachedMovies();

    const [movies, setMovies] =
        useState(initialMovies);

    const [movie, setMovie] = useState(null);

    const [random, setRandom] = useState([]);

    const [loading, setLoading] =
        useState(initialMovies.length === 0);

    const [playerLoaded, setPlayerLoaded] =
        useState(false);

    /*
     * Reset player when movie changes
     */
    useEffect(() => {

        setPlayerLoaded(false);

    }, [id]);

    /*
     * Find current movie
     */
    useEffect(() => {

        if (!movies.length) return;

        const currentMovie = movies.find(
            (item) =>
                String(item["IMDB ID"]) === String(id)
        );

        setMovie(currentMovie || null);

        /*
         * Recently watched
         */
        if (currentMovie) {

            try {

                const stored =
                    localStorage.getItem(
                        "recently_watched"
                    );

                let recent = stored
                    ? JSON.parse(stored)
                    : [];

                if (!Array.isArray(recent)) {
                    recent = [];
                }

                recent = recent.filter(
                    (item) =>
                        String(item["IMDB ID"]) !==
                        String(currentMovie["IMDB ID"])
                );

                recent.unshift(currentMovie);

                recent = recent.slice(0, 7);

                localStorage.setItem(
                    "recently_watched",
                    JSON.stringify(recent)
                );

            } catch (error) {

                console.error(
                    "Failed to save recently watched:",
                    error
                );
            }
        }

        /*
         * Generate recommendations
         */
        const shuffled = [...movies].sort(
            () => Math.random() - 0.5
        );

        const randomMovies = shuffled
            .filter(
                (item) =>
                    String(item["IMDB ID"]) !== String(id)
            )
            .slice(0, 20);

        setRandom(randomMovies);

    }, [id, movies]);

    /*
     * Load fresh movies
     */
    useEffect(() => {

        let cancelled = false;

        async function loadMovies() {

            try {

                const response =
                    await fetch("/movies.json");

                if (!response.ok) {

                    throw new Error(
                        `Failed to load movies.json: ${response.status}`
                    );
                }

                const json = await response.json();

                const data = Array.isArray(json)
                    ? json
                    : json.data || [];

                if (cancelled) return;

                setMovies(data);

                try {

                    sessionStorage.setItem(
                        "home_movies",
                        JSON.stringify(data)
                    );

                } catch {}

            } catch (error) {

                if (!cancelled) {

                    console.error(
                        "Failed to load movies:",
                        error
                    );
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMovies();

        return () => {
            cancelled = true;
        };

    }, []);

    /*
     * Sidebar
     */
    const sidebarMovies = [
        movie,
        ...random.filter(
            (item) =>
                item["IMDB ID"] !== movie?.["IMDB ID"]
        )
    ].filter(Boolean);

    /*
     * Loading / not found
     */
    if (loading) {

        return (
            <div className="loading">
                Loading Movies...
            </div>
        );
    }

    if (!movie) {

        return (
            <div className="loading">
                Movie Not Found
            </div>
        );
    }

    /*
     * Watch page
     */
    return (

        <div className="watch-container">

            <div className="player-section">

                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16 / 9",
                        backgroundColor: "#000",
                        overflow: "hidden"
                    }}
                >

                    {!playerLoaded && (

                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: "#000",
                                zIndex: 2
                            }}
                        />

                    )}

                    <iframe
                        key={id}
                        src={`https://slast430did.com/play/${id}`}
                        title={movie["Movie Name"]}
                        allowFullScreen
                        onLoad={() =>
                            setPlayerLoaded(true)
                        }
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            display: "block"
                        }}
                    />

                </div>

                <h1>
                    {movie["Movie Name"]}
                </h1>

                <p className="movie-year">
                    {movie.Year}
                </p>

                <div className="movie-description-actors-space"></div>

                {movie.Description && (

                    <p className="movie-description">
                        {movie.Description}
                    </p>

                )}

                <div className="movie-description-actors-space"></div>

                {movie.Actors &&
                    movie.Actors.length > 0 && (

                        <p className="movie-actors">

                            <strong>Actors:</strong>{" "}

                            {movie.Actors.map(
                                (actor, index) => (

                                    <span key={actor}>

                                        <Link
                                            to={`/actor/${encodeURIComponent(actor)}`}
                                            className="actor-link"
                                        >
                                            {actor}
                                        </Link>

                                        {index <
                                            movie.Actors.length - 1 &&
                                            ", "}

                                    </span>

                                )
                            )}

                        </p>

                    )}

                <div className="movie-actors-bottom-space"></div>

            </div>

            <div className="sidebar">

                <h2>
                    You May Also Like
                </h2>

                {sidebarMovies.map((item) => (

                    <Link
                        key={item["IMDB ID"]}
                        to={`/watch/${item["IMDB ID"]}`}
                        className={`side-card ${
                            String(item["IMDB ID"]) === String(id)
                                ? "active"
                                : ""
                        }`}
                    >

                        <div className="poster-wrapper">

                            <img
                                src={item.Poster}
                                alt={item["Movie Name"]}
                            />

                            {String(item["IMDB ID"]) === String(id) && (

                                <div className="play-icon">
                                    ▶
                                </div>

                            )}

                        </div>

                        <div className="side-info">

                            <h3>
                                {item["Movie Name"]}
                            </h3>

                            {item.Actors &&
                                item.Actors.length > 0 && (

                                    <span className="side-actors">

                                        {item.Actors.map(
                                            (actor, index) => (

                                                <span key={actor}>

                                                    <Link
                                                        to={`/actor/${encodeURIComponent(actor)}`}
                                                        className="actor-link"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        {actor}
                                                    </Link>

                                                    {index <
                                                        item.Actors.length - 1 &&
                                                        ", "}

                                                </span>

                                            )
                                        )}

                                    </span>

                                )}

                            <p>
                                {item.Year}
                            </p>

                        </div>

                    </Link>

                ))}

            </div>

        </div>

    );
}
