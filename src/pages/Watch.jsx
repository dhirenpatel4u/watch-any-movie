import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";

export default function Watch() {

    const { id } = useParams();

    const [movies, setMovies] = useState([]);

    useEffect(() => {

        fetch(
            "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnRVaQVJXRUjmOv7OVWraFMF4rvcJlXXamDr4hIAz54OqSYcXP_Zq6vyW-a_TDVHSe_qe_o51RZiV46RGIrHzqIxjbRUqA7ABWdSGdRVX2Pl9yFlQtGLuAzB27VFpiORg2D4iLOtd-eoruV0HrqUuomTCk_cfdmgOdzFkCBFqRiKKAZ2eZxy4Rz4qsjQvJ4Wk2E3w1c8DdpQWtRFFho0dHqM3LydDH4U2m696GKnlZlDJvHPQ8Ieg77izbeNNthNp4ArtnWgjihn0HkfoCG0-bxYWADwvQ&lib=MdkOOLVUqxpsMtamGk_CUO1T3b6iDXk-u"
        )
            .then((r) => r.json())
            .then((data) => setMovies(data.data));

    }, []);

    const random = [...movies]
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);

    return (
        <div className="watch-page">

            <iframe
                src={`https://gemma416okl.com/play/${id}`}
                title="player"
                allowFullScreen
            />

            <h2>You May Also Like</h2>

            <div className="grid">
                {random.map((movie) => (
                    <MovieCard
                        key={movie["IMDB ID"]}
                        movie={movie}
                    />
                ))}
            </div>

        </div>
    );
}
