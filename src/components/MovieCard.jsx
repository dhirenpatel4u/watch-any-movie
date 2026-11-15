
import { Link } from "react-router-dom";

export default function MovieCard({
    movie,
    homePage = 1
}) {

    const handleClick = () => {

        /*
         * SAVE CURRENT DESKTOP PAGE
         */
        sessionStorage.setItem(
            "home_desktop_page",
            String(homePage)
        );

        /*
         * SAVE EXACT SCROLL POSITION
         */
        sessionStorage.setItem(
            "home_scroll_position",
            String(window.scrollY)
        );

        /*
         * ENABLE HOME RESTORATION
         */
        sessionStorage.setItem(
            "restore_home_scroll",
            "true"
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
