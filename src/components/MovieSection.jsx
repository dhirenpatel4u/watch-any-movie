
import MovieCard from "./MovieCard";

export default function MovieSection({
    title,
    movies,
    homePage = 1
}) {

    return (
        <div className="movie-section">

            <h2>{title}</h2>

            <div className="grid">

                {movies.map((movie) => (

                    <MovieCard
                        key={movie["IMDB ID"]}
                        movie={movie}
                        homePage={homePage}
                    />

                ))}

            </div>

        </div>
    );
}
