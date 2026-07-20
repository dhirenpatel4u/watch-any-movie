import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MovieSection from "../components/MovieSection";

export default function Home() {

    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        fetch(
            "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnRVaQVJXRUjmOv7OVWraFMF4rvcJlXXamDr4hIAz54OqSYcXP_Zq6vyW-a_TDVHSe_qe_o51RZiV46RGIrHzqIxjbRUqA7ABWdSGdRVX2Pl9yFlQtGLuAzB27VFpiORg2D4iLOtd-eoruV0HrqUuomTCk_cfdmgOdzFkCBFqRiKKAZ2eZxy4Rz4qsjQvJ4Wk2E3w1c8DdpQWtRFFho0dHqM3LydDH4U2m696GKnlZlDJvHPQ8Ieg77izbeNNthNp4ArtnWgjihn0HkfoCG0-bxYWADwvQ&lib=MdkOOLVUqxpsMtamGk_CUO1T3b6iDXk-u"
        )
            .then((r) => r.json())
            .then((data) => setMovies(data.data));

    }, []);

    const filtered = movies.filter((m) =>
        m["Movie Name"]
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const latest =
        filtered.filter(
            (m) => m["Stream URL"] === 2026
        );

    const recent =
        filtered.filter(
            (m) => m["Stream URL"] === 2025
        );

    return (
        <>
            <Navbar
                search={search}
                setSearch={setSearch}
            />

            <div className="container">

                <MovieSection
                    title="Latest"
                    movies={latest}
                />

                <MovieSection
                    title="Recent"
                    movies={recent}
                />

                <MovieSection
                    title="All Movies"
                    movies={filtered}
                />

            </div>
        </>
    );
}
