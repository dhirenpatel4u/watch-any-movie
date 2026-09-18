import fs from "fs";
import path from "path";

export default function handler(req, res) {
const id = req.query.id;

// =====================================================
// VALIDATE ID
// =====================================================

if (!id || Array.isArray(id)) {
    return res.status(400).send(
        "Movie ID missing"
    );
}

try {
    // =================================================
    // LOAD MOVIES.JSON
    // =================================================

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

    const movies =
        Array.isArray(json)
            ? json
            : json.data || [];

    // =================================================
    // FIND MOVIE
    // =================================================

    const movie = movies.find(
        (item) =>
            String(
                item["IMDB ID"]
            ) === String(id)
    );

    if (!movie) {
        return res.status(404).send(
            "Movie Not Found"
        );
    }

    // =================================================
    // MOVIE DATA
    // =================================================

    const title =
        movie["Movie Name"] ||
        "Watch Any Movies";

    const year =
        movie.Year ||
        "";

    const description =
        movie.Description ||
        `Watch ${title} online.`;

    let poster =
        movie.Poster ||
        "";

    const siteUrl =
        "https://watch-any-movies.vercel.app";

    const movieUrl =
        `${siteUrl}/watch/${encodeURIComponent(id)}`;

    // =================================================
    // ABSOLUTE POSTER URL
    // =================================================

    if (
        poster &&
        poster.startsWith("/")
    ) {
        poster =
            `${siteUrl}${poster}`;
    }

    // =================================================
    // ESCAPE HTML
    // =================================================

    function escapeHtml(value) {
        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    const fullTitle =
        `${title}${year ? ` (${year})` : ""} - Watch Any Movies`;

    const safeTitle =
        escapeHtml(fullTitle);

    const safeDescription =
        escapeHtml(description);

    const safePoster =
        escapeHtml(poster);

    const safeUrl =
        escapeHtml(movieUrl);

    // =================================================
    // HTML
    // =================================================
    //
    // Vite is configured to generate:
    //
    // /assets/app.js
    //
    // CSS files are generated as:
    //
    // /assets/<name>.css
    //
    // =================================================

    const html = `<!doctype html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>${safeTitle}</title>

<meta
    name="description"
    content="${safeDescription}"
>

<!-- Open Graph -->

<meta
    property="og:type"
    content="video.movie"
>

<meta
    property="og:title"
    content="${safeTitle}"
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
    property="og:image:type"
    content="image/jpeg"
>

<meta
    property="og:image:width"
    content="500"
>

<meta
    property="og:image:height"
    content="750"
>

<!-- Twitter -->

<meta
    name="twitter:card"
    content="summary_large_image"
>

<meta
    name="twitter:title"
    content="${safeTitle}"
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

<!-- Canonical -->

<link
    rel="canonical"
    href="${safeUrl}"
>

<!-- Favicon -->

<link
    rel="icon"
    type="image/png"
    href="/your-logo.png"
>

</head>

<body>

<div id="root"></div>

<script
    type="module"
    src="/assets/app.js"
></script>

</body>

</html>`;

    // =================================================
    // CACHE
    // =================================================

    res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
        "CDN-Cache-Control",
        "no-store"
    );

    res.setHeader(
        "Vercel-CDN-Cache-Control",
        "no-store"
    );

    res.setHeader(
        "Pragma",
        "no-cache"
    );

    res.setHeader(
        "Expires",
        "0"
    );

    // =================================================
    // RETURN
    // =================================================

    return res
        .status(200)
        .send(html);

} catch (error) {
    console.error(
        "Movie page error:",
        error
    );

    return res.status(500).send(
        "Failed to load movie"
    );
}

}
