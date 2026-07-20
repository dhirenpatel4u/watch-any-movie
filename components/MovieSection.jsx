import MovieCard from "./MovieCard";

export default function MovieSection({
    title,
    movies
}) {
    return (
        <>
            <h2>{title}</h2>

            <div className="grid">
                {movies.map((movie) => (
                    <MovieCard
                        key={movie["IMDB ID"]}
                        movie={movie}
                    />
                ))}
            </div>
        </>
    );
}
