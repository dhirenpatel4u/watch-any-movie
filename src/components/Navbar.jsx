export default function Navbar({
    search,
    setSearch
}) {
    return (
        <nav className="navbar">

            <h1>Movie OTT</h1>

            <input
                type="text"
                placeholder="Search movies..."
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
            />

        </nav>
    );
}
