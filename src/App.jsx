
import {
    useLayoutEffect,
    useState
} from "react";

import {
    Routes,
    Route,
    useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import ActorSearch from "./pages/ActorSearch";

function ScrollManager() {

    const location = useLocation();

    useLayoutEffect(() => {

        if (
            location.pathname.startsWith("/watch/")
        ) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant"
            });

            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }

    }, [location.pathname]);

    return null;
}

export default function App() {

    const [search, setSearch] = useState("");

    return (
        <>
            <ScrollManager />

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

                <Route
                    path="/actor/:actor"
                    element={
                        <ActorSearch />
                    }
                />

            </Routes>
        </>
    );
}
