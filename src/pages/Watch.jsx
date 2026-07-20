import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


export default function Watch() {
    const { id } = useParams();

    const [movies, setMovies] = useState([]);
    const [movie, setMovie] = useState(null);
    const [random, setRandom] = useState([]);

useEffect(() => {
    async function loadMovies() {

        let data = [];

        const cached =
            localStorage.getItem(
                "movies"
            );

        if (cached) {
            data =
                JSON.parse(
                    cached
                );
        } else {
            const response =
                await fetch(
                    "https://script.googleusercontent.com/macros/echo?..."
                );

            const json =
                await response.json();

            data = json.data;
        }

        setMovies(data);

        setMovie(
            data.find(
                (m) =>
                    m["IMDB ID"] === id
            )
        );

        // Generate random list once
        let randomMovies =
            sessionStorage.getItem(
                "watch_random"
            );

        if (!randomMovies) {

            randomMovies =
                JSON.stringify(
                    data
                        .sort(
                            () =>
                                Math.random() -
                                0.5
                        )
                        .slice(0, 20)
                );

            sessionStorage.setItem(
                "watch_random",
                randomMovies
            );
        }

        setRandom(
            JSON.parse(
                randomMovies
            )
        );
    }

    loadMovies();

}, [id]);

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

                <h1>
                    {
                        movie[
                            "Movie Name"
                        ]
                    }
                </h1>

                <p>
                    {
                        movie[
                            "Stream URL"
                        ]
                    }
                </p>
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
                                    src={`https://m.media-amazon.com/images/M/${item.Poster}`}
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
                                    {
                                        item[
                                            "Movie Name"
                                        ]
                                    }
                                </h3>

                                <p>
                                    {
                                        item[
                                            "Stream URL"
                                        ]
                                    }
                                </p>
                            </div>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
