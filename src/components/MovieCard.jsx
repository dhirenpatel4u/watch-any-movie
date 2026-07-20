import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
    const poster =
        `https://m.media-amazon.com/images/M/${movie.Poster}`;

    return (
        <Link
            to={`/watch/${movie["IMDB ID"]}`}
            className="card"
        >
            <img
                src={poster}
                alt={movie["Movie Name"]}
                loading="lazy"
            />

            <div className="card-info">
                <h3>
                    {movie["Movie Name"]}
                </h3>
            </div>
        </Link>
    );
}
