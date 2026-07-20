import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {

    const poster =
        `https://m.media-amazon.com/images/M/${movie.Poster}`;

    return (
        <Link
            to={`/watch/${movie["IMDB ID"]}`}
            className="card"
        >
            <img src={poster} />

            <h3>{movie["Movie Name"]}</h3>

            <p>{movie["Stream URL"]}</p>
        </Link>
    );
}
