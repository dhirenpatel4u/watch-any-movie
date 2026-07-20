import { Link, useLocation } from "react-router-dom";

export default function Navbar({
    search,
    setSearch
}) {

    const location = useLocation();

    const isHome =
        location.pathname === "/";

    const isWatch =
        location.pathname.startsWith("/watch/");

    return (
        <nav className="navbar">

            <Link to="/">
                <h1>Watch Any Movie</h1>
            </Link>

            {isHome && (
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />
            )}

            {isWatch && (
                <Link
                    to="/"
                    className="home-btn"
                >
                    Home
                </Link>
            )}

        </nav>
    );
}
