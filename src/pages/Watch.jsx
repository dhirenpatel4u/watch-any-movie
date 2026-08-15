import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


export default function Watch() {
    const { id } = useParams();

    const [movies, setMovies] = useState([]);
    const [movie, setMovie] = useState(null);
    const [random, setRandom] = useState([]);

useEffect(() => {
    async function loadMovies() {
        try {
            const response = await fetch("/movies.json");
            const json = await response.json();

            const data = json.data;

            setMovies(data);

            const currentMovie = data.find(
                (m) => m["IMDB ID"] === id
            );

            setMovie(currentMovie);

            // Generate recommendations only once
            let saved =
                sessionStorage.getItem(
                    "watch_random"
                );

            if (saved) {
                setRandom(JSON.parse(saved));
            } else {
                const recommendations = [...data]
                    .filter(
                        (m) =>
                            m["IMDB ID"] !== id
                    )
                    .sort(
                        () => Math.random() - 0.5
                    )
                    .slice(0, 20);

                sessionStorage.setItem(
                    "watch_random",
                    JSON.stringify(
                        recommendations
                    )
                );

                setRandom(recommendations);
            }
        } catch (error) {
            console.error(error);
        }
    }

    loadMovies();
}, []);

const sidebarMovies = [
    movie,
    ...random.filter(
        (m) =>
            m["IMDB ID"] !==
            movie?.["IMDB ID"]
    ),
].filter(Boolean);

    if (!movie) {
        return (
            <div className="loading">
                Loading...
            </div>
        );
    }

    return (
        <div className="watch-container">
            <div className="player-section">
                <iframe
                    src={`https://gemma416okl.com/play/${id}`}
                    title={
                        movie[
                            "Movie Name"
                        ]
                    }
                    allowFullScreen
                />

                <h1>{movie["Movie Name"]}</h1>

                <div className="movie-description-actors-space"></div>

                <p className="movie-year">
                    {movie.Year}
                </p>
                
                <div className="movie-description-actors-space"></div>
                
                <p className="movie-description">
                    {movie.Description}
                </p>
                
                <div className="movie-description-actors-space"></div>
                
                <p className="movie-actors">
                    <strong>Actors:</strong>{" "}
                    {movie.Actors?.join(", ")}
                </p>
                
                <div className="movie-actors-bottom-space"></div>
            </div>

            <div className="sidebar">
                <h2>
                    You May Also
                    Like
                </h2>

                {sidebarMovies.map(
                    (item) => (
                        <Link
                            key={
                                item[
                                    "IMDB ID"
                                ]
                            }
                            to={`/watch/${item["IMDB ID"]}`}
                            className={`side-card ${
                                item[
                                    "IMDB ID"
                                ] === id
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <div className="poster-wrapper">
                                <img
                                    src={item.Poster}
                                    alt={
                                        item[
                                            "Movie Name"
                                        ]
                                    }
                                />

                                {item[
                                    "IMDB ID"
                                ] ===
                                    id && (
                                    <div className="play-icon">
                                        ▶
                                    </div>
                                )}
                            </div>

                            <div className="side-info">
                                <h3>
                                    {item["Movie Name"]}
                                </h3>

                                <span className="side-actors">
                                    {item.Actors?.join(", ")}
                                </span>

                                <p>
                                    {item.Year}
                                </p>
                            </div>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
