import fs from "fs";
import path from "path";

export default function handler(req, res) {
    const id = req.query.id;

    if (!id) {
        return res.status(400).send(
            "Movie ID missing"
        );
    }

    try {
        // -----------------------------
        // Load movies.json
        // -----------------------------

        const moviesPath = path.join(
            process.cwd(),
            "public",
            "movies.json"
        );

        const json = JSON.parse(
            fs.readFileSync(
                moviesPath,
                "utf8"
            )
        );

        const movies = Array.isArray(json)
            ? json
            : json.data || [];

        // -----------------------------
        // Find movie by IMDb ID
        // -----------------------------

        const movie = movies.find(
            (item) =>
                item["IMDB ID"] === id
        );

        if (!movie) {
            return res.status(404).send(
                "Movie Not Found"
            );
        }

        // -----------------------------
        // Movie data from JSON
        // -----------------------------

        const title =
            movie["Movie Name"] ||
            "Watch Any Movies";

        const year =
            movie.Year || "";

        const description =
            movie.Description ||
            `Watch ${title} online.`;

        const poster =
            movie.Poster || "";

        const siteUrl =
            "https://watch-any-movies.vercel.app";

        const movieUrl =
            `${siteUrl}/watch/${encodeURIComponent(id)}`;

        // -----------------------------
        // Escape HTML
        // -----------------------------

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        const fullTitle =
            `${title}${year ? ` (${year})` : ""}`;

        const safeTitle =
            escapeHtml(fullTitle);

        const safeDescription =
            escapeHtml(description);

        const safePoster =
            escapeHtml(poster);

        const safeUrl =
            escapeHtml(movieUrl);

        // -----------------------------
        // Read Vite index.html
        // -----------------------------

        const indexPath = path.join(
            process.cwd(),
            "dist",
            "index.html"
        );

        let html = fs.readFileSync(
            indexPath,
            "utf8"
        );

        // -----------------------------
        // Remove DEFAULT OG metadata
        // -----------------------------

        html = html.replace(
            /<meta\s+property=["']og:[^>]*>\s*/gi,
            ""
        );

        html = html.replace(
            /<meta\s+name=["']twitter:[^>]*>\s*/gi,
            ""
        );

        html = html.replace(
            /<link\s+rel=["']canonical["'][^>]*>\s*/gi,
            ""
        );

        // Remove default description
        html = html.replace(
            /<meta\s+name=["']description["'][^>]*>\s*/gi,
            ""
        );

        // -----------------------------
        // Movie page title
        // -----------------------------

        html = html.replace(
            /<title>[\s\S]*?<\/title>/i,
            `<title>${safeTitle} - Watch Any Movies</title>`
        );

        // -----------------------------
        // Movie-specific metadata
        // -----------------------------

        const meta = `
<meta
    name="description"
    content="${safeDescription}"
>

<meta
    property="og:type"
    content="video.movie"
>

<meta
    property="og:title"
    content="${safeTitle} - Watch Any Movies"
>

<meta
    property="og:description"
    content="${safeDescription}"
>

<meta
    property="og:image"
    content="${safePoster}"
>

<meta
    property="og:image:alt"
    content="${safeTitle}"
>

<meta
    property="og:url"
    content="${safeUrl}"
>

<meta
    property="og:site_name"
    content="Watch Any Movies"
>

<meta
    name="twitter:card"
    content="summary_large_image"
>

<meta
    name="twitter:title"
    content="${safeTitle} - Watch Any Movies"
>

<meta
    name="twitter:description"
    content="${safeDescription}"
>

<meta
    name="twitter:image"
    content="${safePoster}"
>

<meta
    name="twitter:image:alt"
    content="${safeTitle}"
>

<link
    rel="canonical"
    href="${safeUrl}"
>
`;

        // -----------------------------
        // Insert movie metadata
        // -----------------------------

        html = html.replace(
            "</head>",
            `${meta}\n</head>`
        );

        // -----------------------------
        // Cache
        // -----------------------------

        res.setHeader(
            "Content-Type",
            "text/html; charset=utf-8"
        );

        res.setHeader(
            "Cache-Control",
            "public, max-age=300, s-maxage=300"
        );

        return res.status(200).send(html);

    } catch (error) {
        console.error(
            "Movie OG metadata error:",
            error
        );

        return res.status(500).send(
            "Failed to load movie"
        );
    }
}
