import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Watch from "./pages/Watch";

export default function App() {

    const [search, setSearch] = useState("");

    return (
        <>
            <Navbar
                search={search}
                setSearch={setSearch}
            />

            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            search={search}
                        />
                    }
                />

                <Route
                    path="/watch/:id"
                    element={
                        <Watch />
                    }
                />
            </Routes>
        </>
    );
}
