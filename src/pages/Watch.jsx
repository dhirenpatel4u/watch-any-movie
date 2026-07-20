import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Watch() {
    const { id } = useParams();

    const [movies, setMovies] = useState([]);
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const cached =
            localStorage.getItem("movies");

        if (cached) {
            const data =
                JSON.parse(cached);

            setMovies(data);

            setMovie(
                data.find(
                    (m) =>
                        m["IMDB ID"] === id
                )
            );

            return;
        }

        fetch(
            "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnRVaQVJXRUjmOv7OVWraFMF4rvcJlXXamDr4hIAz54OqSYcXP_Zq6vyW-a_TDVHSe_qe_o51RZiV46RGIrHzqIxjbRUqA7ABWdSGdRVX2Pl9yFlQtGLuAzB27VFpiORg2D4iLOtd-eoruV0HrqUuomTCk_cfdmgOdzFkCBFqRiKKAZ2eZxy4Rz4qsjQvJ4Wk2E3w1c8DdpQWtRFFho0dHqM3LydDH4U2m696GKnlZlDJvHPQ8Ieg77izbeNNthNp4ArtnWgjihn0HkfoCG0-bxYWADwvQ&lib=MdkOOLVUqxpsMtamGk_CUO1T3b6iDXk-u"
        )
            .then((r) => r.json())
            .then((data) => {
                setMovies(data.data);

                setMovie(
                    data.data.find(
                        (m) =>
                            m[
                                "IMDB ID"
                            ] === id
                    )
                );
            });
    }, [id]);

    const random = [
        movie,
        ...movies
            .filter(
                (m) =>
                    m["IMDB ID"] !== id
            )
            .sort(
                () =>
                    Math.random() -
                    0.5
            )
            .slice(0, 19),
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

                {random.map(
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
