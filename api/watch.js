import fs from "fs";
import path from "path";

export default function handler(req, res) {
const id = req.query.id;

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
    // READ VITE BUILD
    // =================================================

    const indexPath = path.join(
        process.cwd(),
        "dist",
        "index.html"
    );

    if (!fs.existsSync(indexPath)) {
        console.error(
            "dist/index.html not found:",
            indexPath
        );

        return res.status(500).send(
            "Build index.html not found"
        );
    }

    let html =
        fs.readFileSync(
            indexPath,
            "utf8"
        );

    // =================================================
    // REMOVE OLD METADATA
    // =================================================

    html = html.replace(
        /<title>[\s\S]*?<\/title>/i,
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

<title>${safeTitle}</title>

<meta
name="description"
content="${safeDescription}"




<meta
property="og"
content="video.movie"




<meta
property="og"
content="${safeTitle}"




<meta
property="og"
content="${safeDescription}"




<meta
property="og"
content="${safePoster}"




<meta
property="og:image"
content="${safeTitle}"




<meta
property="og"
content="${safeUrl}"




<meta
property="og"
content="Watch Any Movies"




<meta
property="og:image"
content="image/jpeg"




<meta
property="og:image"
content="500"




<meta
property="og:image"
content="750"




<meta
name="twitter"
content="summary_large_image"




<meta
name="twitter"
content="${safeTitle}"




<meta
name="twitter"
content="${safeDescription}"




<meta
name="twitter"
content="${safePoster}"




<meta
name="twitter:image"
content="${safeTitle}"




<link rel="canonical" href="${safeUrl}" > `;

    // =================================================
    // INSERT METADATA
    // =================================================

    html = html.replace(
        /<\/head>/i,
        `${meta}\n</head>`
    );

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
        "Movie OG metadata error:",
        error
    );

    return res.status(500).send(
        "Failed to load movie"
    );
}

}
