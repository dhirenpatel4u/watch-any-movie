import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
    const handleClick = () => {
        /*
         * Save exact Home scroll position
         */
        sessionStorage.setItem(
            "home_scroll_position",
            String(window.scrollY)
        );
    };

    return (
        <Link
            to={`/watch/${movie["IMDB ID"]}`}
            className="card"
            onClick={handleClick}
        >
            <img
                src={movie.Poster}
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
