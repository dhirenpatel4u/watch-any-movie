import fs from "fs";
import path from "path";

export default function handler(req, res) {
const id = req.query.id;


// =====================================================
// VALIDATE MOVIE ID
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

    const movies = Array.isArray(json)
        ? json
        : json.data || [];

    // =================================================
    // FIND MOVIE BY IMDB ID
    // =================================================

    const movie = movies.find(
        (item) =>
            String(item["IMDB ID"]) ===
            String(id)
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
        movie.Year || "";

    const description =
        movie.Description ||
        `Watch ${title} online.`;

    let poster =
        movie.Poster || "";

    const siteUrl =
        "https://watch-any-movies.vercel.app";

    const movieUrl =
        `${siteUrl}/watch/${encodeURIComponent(id)}`;

    // =================================================
    // MAKE POSTER URL ABSOLUTE
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
    // LOAD VITE BUILD HTML
    // =================================================

    const indexPath = path.join(
        process.cwd(),
        "dist",
        "index.html"
    );

    if (!fs.existsSync(indexPath)) {
        console.error(
            "dist/index.html was not found"
        );

        return res.status(500).send(
            "Built index.html not found"
        );
    }

    let html =
        fs.readFileSync(
            indexPath,
            "utf8"
        );

    // =================================================
    // REMOVE STATIC METADATA
    // =================================================

    html = html.replace(
        /<title>[\s\S]*?<\/title>/gi,
        ""
    );

    html = html.replace(
        /<meta\s+name=["']description["'][^>]*>\s*/gi,
        ""
    );

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

    // =================================================
    // MOVIE METADATA
    // =================================================

    const meta = `
```

<title>${safeTitle}</title>

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

<link
    rel="canonical"
    href="${safeUrl}"
>
`;

```
    // =================================================
    // INSERT METADATA INTO HEAD
    // =================================================

    html = html.replace(
        /<\/head>/i,
        `${meta}\n</head>`
    );

    // =================================================
    // IMPORTANT CACHE SETTINGS
    // =================================================
    //
    // Each movie URL has different metadata.
    // Do not let the browser/CDN reuse old HTML.
    //

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
    // RETURN HTML
    // =================================================

    return res
        .status(200)
        .send(html);

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
